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

  DECLARAÇÃO DE USO DE INTELIGÊNCIA ARTIFICIAL

  Ferramenta: Claude (Anthropic)
  Etapa: Desenvolvimento
  Finalidade: A base (conexão com o banco, respostas em JSON e as consultas de
  inserir, atualizar e listar) veio do material AgendaServer / agenda.aia
  fornecido pelo professor. A IA ajudou a adaptar esse código para o quiz.
  Validação: A dupla entendeu o código e testou a API no XAMPP com o banco quiz_media.
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

// ============================================================
// 3. PROGRAMA PRINCIPAL
//    Tudo dentro do try: se der erro no banco, cai nos catch do final.
// ============================================================
try {
    // ---------- conexão com o banco (dados em config.php) ----------
    $config = require __DIR__ . '/config.php';
    $dsn = 'mysql:host=' . $config['host'] . ';port=' . $config['port']
         . ';dbname=' . $config['database'] . ';charset=utf8mb4';
    $db = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    $metodo = $_SERVER['REQUEST_METHOD'];   // GET ou POST
    $action = $_GET['action'] ?? 'health';  // o que o app está pedindo

    // ---------- GET health: testa se o banco responde ----------
    if ($metodo === 'GET' && $action === 'health') {
        $total = (int)$db->query('SELECT COUNT(*) FROM questions WHERE active = 1')->fetchColumn();
        reply([
            'ok' => true,
            'name' => 'Quiz Média',
            'version' => '1.0.0',
            'questionCount' => $total,
            'quizSize' => 10,
        ]);
    }

    // ---------- GET session: busca uma tentativa pelo token ----------
    if ($metodo === 'GET' && $action === 'session') {
        $tentativa = buscarTentativa($db, $_GET['token'] ?? '');
        reply(montarResposta($db, $tentativa));
    }

    // daqui para baixo só aceitamos POST
    if ($metodo !== 'POST') {
        fail('Rota ou método não permitido.', 405);
    }
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 10000000) {
        fail('Requisição muito grande.', 413);
    }

    // lê o JSON enviado pelo app
    $texto = file_get_contents('php://input');
    try {
        $corpo = json_decode($texto ?: '{}', true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $e) {
        fail('JSON inválido.');
    }
    if (!is_array($corpo)) {
        fail('Objeto JSON esperado.');
    }

    // ---------- POST start: sorteia 10 questões ----------
    if ($action === 'start') {
        $db->beginTransaction();

        // "exclude" = ids das questões da tentativa desistida (para não repetir)
        $excluir = [];
        if (is_array($corpo['exclude'] ?? null)) {
            foreach (array_slice($corpo['exclude'], 0, 30) as $id) {
                if ((int)$id > 0) {
                    $excluir[] = (int)$id;
                }
            }
            $excluir = array_values(array_unique($excluir));
        }

        // primeiro tenta sortear fora da lista de excluídas
        $sorteadas = [];
        if (count($excluir) > 0) {
            $interrogacoes = implode(',', array_fill(0, count($excluir), '?'));
            $consulta = $db->prepare("SELECT * FROM questions WHERE active = 1 AND id NOT IN ($interrogacoes) ORDER BY RAND() LIMIT 10");
            $consulta->execute($excluir);
            $sorteadas = $consulta->fetchAll();
        }

        // se não deu 10 questões, sorteia de todas
        if (count($sorteadas) < 10) {
            $sorteadas = $db->query('SELECT * FROM questions WHERE active = 1 ORDER BY RAND() LIMIT 10')->fetchAll();
        }
        if (count($sorteadas) !== 10) {
            fail('O banco precisa de pelo menos 10 questões ativas.', 503);
        }

        // cria a tentativa com um token aleatório
        $token = bin2hex(random_bytes(24));
        $db->prepare('INSERT INTO attempts (token) VALUES (?)')->execute([$token]);
        $idTentativa = (int)$db->lastInsertId();

        // grava as 10 questões na tentativa (com uma cópia "snapshot")
        $inserir = $db->prepare('INSERT INTO attempt_questions (attempt_id, question_id, position, snapshot) VALUES (?, ?, ?, ?)');
        foreach ($sorteadas as $posicao => $q) {
            $copia = [
                'prompt'      => $q['prompt'],
                'category'    => $q['category'],
                'difficulty'  => $q['difficulty'],
                'options'     => json_decode($q['options_json'], true, 512, JSON_THROW_ON_ERROR),
                'correct'     => (int)$q['correct_index'],
                'explanation' => $q['explanation'],
            ];
            $inserir->execute([
                $idTentativa,
                $q['id'],
                $posicao + 1,
                json_encode($copia, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            ]);
        }
        $db->commit();

        reply(montarResposta($db, buscarTentativa($db, $token)), 201);
    }

    // ---------- POST native_finish: usado pelo App Inventor ----------
    // O App Inventor manda listas curtas (mais fáceis nos blocos).
    // Aqui convertemos para o formato normal e seguimos como "finish".
    //   resposta = [idQuestao, alternativa (-1 se vazia), [linhas do desenho]]
    //   linha    = [x1, y1, x2, y2, grossura]
    if ($action === 'native_finish') {
        $listas = $corpo['answers'] ?? null;
        if (!is_array($listas) || count($listas) !== 10) {
            fail('Respostas inválidas.');
        }

        $convertidas = [];
        foreach ($listas as $item) {
            if (!is_array($item) || count($item) !== 3 || !is_array($item[2]) || count($item[2]) > 20000) {
                fail('Resposta ou desenho inválido.');
            }

            // junta as linhas seguidas em traços
            $tracos = [];
            foreach ($item[2] as $linha) {
                if (!is_array($linha) || count($linha) !== 5) {
                    fail('Traço inválido.');
                }
                $ultimo = count($tracos) - 1;
                $continua = false;
                if ($ultimo >= 0 && $tracos[$ultimo]['width'] == $linha[4]) {
                    $pontos = $tracos[$ultimo]['points'];
                    if (end($pontos) == [$linha[0], $linha[1]]) {
                        $continua = true;
                    }
                }
                if ($continua) {
                    $tracos[$ultimo]['points'][] = [$linha[2], $linha[3]];
                } else {
                    $tracos[] = ['width' => $linha[4], 'points' => [[$linha[0], $linha[1]], [$linha[2], $linha[3]]]];
                }
            }

            $convertidas[] = [
                'id'       => $item[0],
                'selected' => ($item[1] === -1) ? null : $item[1],
                'strokes'  => $tracos,
            ];
        }
        $corpo['answers'] = $convertidas;
        $corpo['elapsed'] = 0;
        $action = 'finish';
    }

    // ---------- POST save / finish: salva e (se for finish) corrige ----------
    if ($action === 'save' || $action === 'finish') {
        $db->beginTransaction();
        $tentativa = buscarTentativa($db, (string)($corpo['token'] ?? ''), true);

        // se já foi finalizada, não deixa mexer de novo
        if ($tentativa['finished_at'] !== null) {
            $db->commit();
            if ($action === 'finish') {
                reply(montarResposta($db, $tentativa));   // devolve o resultado que já existe
            }
            fail('Esta tentativa já foi finalizada.', 409);
        }

        salvarRespostas($db, $tentativa, $corpo);

        if ($action === 'finish') {
            // conta os acertos comparando com o gabarito guardado no snapshot
            $consulta = $db->prepare('SELECT selected, snapshot FROM attempt_questions WHERE attempt_id = ?');
            $consulta->execute([$tentativa['id']]);

            $acertos = 0;
            foreach ($consulta->fetchAll() as $linha) {
                if ($linha['selected'] === null) {
                    fail('Responda às 10 questões antes de finalizar.', 422);
                }
                $q = json_decode($linha['snapshot'], true);
                if ((int)$linha['selected'] === $q['correct']) {
                    $acertos++;
                }
            }
            $db->prepare('UPDATE attempts SET score = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?')
               ->execute([$acertos, $tentativa['id']]);
        }
        $db->commit();

        if ($action === 'finish') {
            reply(montarResposta($db, buscarTentativa($db, $tentativa['token'])));
        }
        reply(['ok' => true, 'saved' => true]);
    }

    // nenhuma ação conhecida
    fail('Rota não encontrada.', 404);

} catch (PDOException $e) {
    // erro do banco (MySQL desligado, tabela inexistente...)
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();   // desfaz o que estava pela metade
    }
    error_log('QuizMedia database: ' . $e->getMessage());
    fail('Não foi possível acessar o banco. Verifique o MySQL do XAMPP e importe os arquivos da pasta sql.', 503);
} catch (Throwable $e) {
    // qualquer outro erro
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log('QuizMedia: ' . $e->getMessage());
    fail('O servidor não conseguiu concluir a operação.', 500);
}
