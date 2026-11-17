<?php
/*
  CONFIG.PHP - dados para conectar no banco de dados MySQL

  Estes valores são os padrões do XAMPP.
  Se você colocou senha no MySQL, mude o campo 'password'.
*/
declare(strict_types=1);

return [
    'host'     => '127.0.0.1',    // o MySQL roda no mesmo computador
    'port'     => 3306,           // porta padrão do MySQL
    'database' => 'quiz_media',   // nome do banco (criado em sql/01_banco_e_tabelas.sql)
    'username' => 'root',         // usuário padrão do XAMPP
    'password' => '',             // XAMPP começa sem senha
];
