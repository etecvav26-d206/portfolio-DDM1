<?php
// API do Quiz: sorteia 10 perguntas do banco, sem repetir as já usadas.
// Uso: api.php?acao=sortear&excluir=1,5,9   (excluir é opcional)
// Resposta (texto puro), uma pergunta por linha:
//   pergunta;A;B;C;D;resposta;id
header('Content-Type: text/plain; charset=utf-8');
require 'config.php';

if (($_GET['acao'] ?? '') !== 'sortear') {
    http_response_code(400);
    exit('Use ?acao=sortear');
}

// Lê os ids já usados e garante que são só números
$excluir = [];
if (!empty($_GET['excluir'])) {
    foreach (explode(',', $_GET['excluir']) as $id) {
        if (ctype_digit(trim($id))) { $excluir[] = (int) trim($id); }
    }
}

function sortear(PDO $pdo, array $excluir) {
    $sql = 'SELECT id, pergunta, alt_a, alt_b, alt_c, alt_d, resposta FROM perguntas';
    if ($excluir) {
        $marcas = implode(',', array_fill(0, count($excluir), '?'));
        $sql .= " WHERE id NOT IN ($marcas)";
    }
    $sql .= ' ORDER BY RAND() LIMIT 10';
    $st = $pdo->prepare($sql);
    $st->execute($excluir);
    return $st->fetchAll(PDO::FETCH_ASSOC);
}

$linhas = sortear($pdo, $excluir);
// Se sobraram menos de 10 perguntas novas, sorteia de todas de novo
if (count($linhas) < 10) { $linhas = sortear($pdo, []); }

foreach ($linhas as $l) {
    // troca ";" por "," para não quebrar a separação dos campos
    $campos = array_map(fn($c) => str_replace([';', "\n", "\r"], [',', ' ', ' '], $c),
        [$l['pergunta'], $l['alt_a'], $l['alt_b'], $l['alt_c'], $l['alt_d'], $l['resposta'], $l['id']]);
    echo implode(';', $campos) . "\n";
}
