<?php
// Configuração da conexão com o banco de dados.
// No XAMPP o padrão é usuário "root" e senha vazia.
// Em uma hospedagem, troque pelos dados que ela informar.
$host  = 'localhost';
$banco = 'quiz_fisica';
$user  = 'root';
$senha = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$banco;charset=utf8mb4", $user, $senha);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    exit('Erro ao conectar no banco de dados.');
}
