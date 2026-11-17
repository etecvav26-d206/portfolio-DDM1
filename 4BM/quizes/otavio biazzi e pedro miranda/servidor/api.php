<?php
/*
  API.PHP - o "servidor" do app de Médias

  O app (JavaScript) chama este arquivo assim:
    api.php?action=health   -> diz se o banco está funcionando
    api.php?action=start    -> sorteia 10 questões e cria uma tentativa
    api.php?action=save     -> salva as respostas e os desenhos
    api.php?action=finish   -> corrige a prova e devolve a nota
    api.php?action=session  -> busca uma tentativa pelo token

  Tudo é respondido em JSON.
  O banco de dados é criado com os arquivos da pasta sql/.
*/

declare(strict_types=1);

// ============================================================
// 1. CABEÇALHOS (dizem ao navegador como tratar a resposta)
// ============================================================
header('Content-Type: application/json; charset=utf-8');   // a resposta é JSON
header('Cache-Control: no-store');                          // não guardar em cache
header('Access-Control-Allow-Origin: *');                   // deixa o app chamar de outro endereço
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('X-Content-Type-Options: nosniff');

// O navegador às vezes pergunta antes (OPTIONS). Respondemos "ok" e paramos.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ============================================================
// 2. FUNÇÕES AUXILIARES
// ============================================================

// Envia uma resposta JSON e encerra o script
function reply(array $dados, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}

// Envia uma mensagem de erro (ok = false)
function fail(string $mensagem, int $status = 400): void
{
    reply(['ok' => false, 'message' => $mensagem], $status);
}

// Procura uma tentativa no banco pelo token.
// $travar = true bloqueia a linha enquanto salvamos (evita dois envios ao mesmo tempo).
function buscarTentativa(PDO $db, string $token, bool $travar = false): array
{
    // o token tem sempre 48 letras/números hexadecimais
    if (!preg_match('/^[a-f0-9]{48}$/D', $token)) {
        fail('Tentativa inválida.', 400);
    }

    $sql = 'SELECT * FROM attempts WHERE token = ?';
    if ($travar) {
        $sql .= ' FOR UPDATE';
    }
    $consulta = $db->prepare($sql);
    $consulta->execute([$token]);
    $tentativa = $consulta->fetch();

    if (!$tentativa) {
        fail('Tentativa não encontrada neste servidor.', 404);
    }
    return $tentativa;
}

// Monta a resposta com a tentativa e as 10 questões.
// O gabarito (correct e explanation) só aparece depois de finalizada.
function montarResposta(PDO $db, array $tentativa): array
{
    $consulta = $db->prepare('SELECT * FROM attempt_questions WHERE attempt_id = ? ORDER BY position');
    $consulta->execute([$tentativa['id']]);

    $questoes = [];
    foreach ($consulta->fetchAll() as $linha) {
        // "snapshot" é uma cópia da questão guardada em JSON
        $q = json_decode($linha['snapshot'], true, 512, JSON_THROW_ON_ERROR);

        $selecionada = null;
        if ($linha['selected'] !== null) {
            $selecionada = (int)$linha['selected'];
        }

        $item = [
            'id'       => (int)$linha['question_id'],
            'position' => (int)$linha['position'],
            'category' => $q['category'],
            'difficulty' => $q['difficulty'],
            'prompt'   => $q['prompt'],
            'options'  => $q['options'],
            'selected' => $selecionada,
            'strokes'  => json_decode($linha['drawing'], true, 512, JSON_THROW_ON_ERROR),
        ];

        // depois de finalizar, mostra o gabarito
        if ($tentativa['finished_at'] !== null) {
            $item['correct'] = $q['correct'];
            $item['explanation'] = $q['explanation'];
            $item['isCorrect'] = ($selecionada === $q['correct']);
        }
        $questoes[] = $item;
    }

    $nota = null;
    if ($tentativa['score'] !== null) {
        $nota = (int)$tentativa['score'];
    }

    return [
        'ok'         => true,
        'token'      => $tentativa['token'],
        'startedAt'  => $tentativa['started_at'],
        'finishedAt' => $tentativa['finished_at'],
        'score'      => $nota,
        'elapsed'    => (int)$tentativa['elapsed_seconds'],
        'questions'  => $questoes,
    ];
}

// Confere se o desenho do quadro é válido e devolve ele em texto JSON.
// Cada traço é: { "width": 1 a 16, "points": [[x, y], ...] } com x e y entre 0 e 1
function validarDesenho($tracos): string
{
    if (!is_array($tracos) || count($tracos) > 500) {
        fail('Limite de traços excedido.');
    }

    $totalPontos = 0;
    foreach ($tracos as $traco) {
        // confere a grossura e a lista de pontos
        if (!is_array($traco) || !isset($traco['width'], $traco['points'])) {
            fail('Desenho inválido.');
        }
        if (!is_numeric($traco['width']) || $traco['width'] < 1 || $traco['width'] > 16) {
            fail('Desenho inválido.');
        }
        if (!is_array($traco['points']) || count($traco['points']) < 1) {
            fail('Desenho inválido.');
        }

        // limite de pontos no quadro todo
        $totalPontos += count($traco['points']);
        if ($totalPontos > 40000) {
            fail('O quadro atingiu o limite de pontos.');
        }

        // cada ponto precisa ser [x, y] entre 0 e 1
        foreach ($traco['points'] as $ponto) {
            if (!is_array($ponto) || count($ponto) !== 2 || !is_numeric($ponto[0]) || !is_numeric($ponto[1])) {
                fail('Ponto de desenho inválido.');
            }
            if ($ponto[0] < 0 || $ponto[0] > 1 || $ponto[1] < 0 || $ponto[1] > 1) {
                fail('Ponto de desenho inválido.');
            }
        }
    }
    return json_encode($tracos, JSON_THROW_ON_ERROR);
}

// Salva as respostas e os desenhos no banco
function salvarRespostas(PDO $db, array $tentativa, array $corpo): void
{
    $respostas = $corpo['answers'] ?? [];
    if (!is_array($respostas) || count($respostas) > 10) {
        fail('Respostas inválidas.');
    }

    // quais questões pertencem a esta tentativa
    $consulta = $db->prepare('SELECT question_id FROM attempt_questions WHERE attempt_id = ?');
    $consulta->execute([$tentativa['id']]);
    $permitidas = array_map('intval', $consulta->fetchAll(PDO::FETCH_COLUMN));

    $atualizar = $db->prepare('UPDATE attempt_questions SET selected = ?, drawing = ? WHERE attempt_id = ? AND question_id = ?');

    $jaVistas = [];
    foreach ($respostas as $resposta) {
        // a questão precisa existir nesta tentativa e não pode se repetir
        if (!is_array($resposta) || !isset($resposta['id']) || !is_int($resposta['id'])) {
            fail('Questão fora desta tentativa.');
        }
        if (!in_array($resposta['id'], $permitidas, true) || in_array($resposta['id'], $jaVistas, true)) {
            fail('Questão fora desta tentativa.');
        }
        $jaVistas[] = $resposta['id'];

        // alternativa: null (sem resposta) ou número de 0 a 3
        $selecionada = $resposta['selected'] ?? null;
        if ($selecionada !== null && (!is_int($selecionada) || $selecionada < 0 || $selecionada > 3)) {
            fail('Alternativa inválida.');
        }

        $desenho = validarDesenho($resposta['strokes'] ?? []);
        $atualizar->execute([$selecionada, $desenho, $tentativa['id'], $resposta['id']]);
    }

    // tempo gasto (só aceita valores maiores que o já salvo)
    $tempo = $corpo['elapsed'] ?? 0;
    if (!is_int($tempo) || $tempo < 0 || $tempo > 31536000) {
        fail('Duração inválida.');
    }
    $db->prepare('UPDATE attempts SET elapsed_seconds = GREATEST(elapsed_seconds, ?) WHERE id = ?')
       ->execute([$tempo, $tentativa['id']]);
}

