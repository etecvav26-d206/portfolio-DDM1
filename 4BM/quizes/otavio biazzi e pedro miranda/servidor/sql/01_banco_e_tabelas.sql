-- ==========================================================
-- 01_banco_e_tabelas.sql
-- Cria o banco de dados e as 3 tabelas do app de Médias.
--
-- COMO USAR (nesta ordem):
--   1) Rode este arquivo (01_banco_e_tabelas.sql)
--   2) Rode o 02_questoes.sql
--
-- Pelo terminal do XAMPP:
--   mysql -uroot --default-character-set=utf8mb4 < 01_banco_e_tabelas.sql
--   mysql -uroot --default-character-set=utf8mb4 < 02_questoes.sql
-- Ou pelo phpMyAdmin: aba "Importar" e escolher o arquivo.
-- ==========================================================


-- ----------------------------------------------------------
-- BANCO DE DADOS
-- utf8mb4 serve para guardar acentos e símbolos (÷, ², °C...)
-- ----------------------------------------------------------
CREATE DATABASE IF NOT EXISTS quiz_media
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- usa o banco que acabamos de criar
USE quiz_media;


-- ----------------------------------------------------------
-- TABELA 1: questions
-- Guarda as 30 questões do banco (o "banco de questões").
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
  id            INT UNSIGNED PRIMARY KEY,     -- número da questão (1 a 30)
  category      VARCHAR(80)  NOT NULL,        -- assunto (ex.: Média aritmética)
  difficulty    VARCHAR(30)  NOT NULL,        -- dificuldade (ex.: Essencial)
  prompt        TEXT         NOT NULL,        -- o enunciado da pergunta
  options_json  TEXT         NOT NULL,        -- as 4 alternativas, em formato JSON
  correct_index TINYINT UNSIGNED NOT NULL,    -- qual alternativa é a certa (0=A, 1=B, 2=C, 3=D)
  explanation   TEXT         NOT NULL,        -- explicação mostrada na revisão
  active        TINYINT(1)   NOT NULL DEFAULT 1,  -- 1 = pode ser sorteada, 0 = desligada

  -- garante que a resposta certa é de 0 a 3
  CONSTRAINT chk_correct CHECK (correct_index BETWEEN 0 AND 3)
) ENGINE=InnoDB;


-- ----------------------------------------------------------
-- TABELA 2: attempts
-- Cada linha é uma avaliação (tentativa) feita por um aluno.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS attempts (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,  -- número da tentativa (automático)
  token           CHAR(48) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,  -- código secreto que identifica a tentativa
  started_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- quando começou
  finished_at     TIMESTAMP NULL DEFAULT NULL,                  -- quando terminou (vazio = em andamento)
  score           TINYINT UNSIGNED NULL,                        -- nota final (0 a 10)
  elapsed_seconds INT UNSIGNED NOT NULL DEFAULT 0               -- segundos gastos na prova
) ENGINE=InnoDB;


-- ----------------------------------------------------------
-- TABELA 3: attempt_questions
-- Liga cada tentativa às 10 questões sorteadas
-- e guarda a resposta e o desenho do aluno em cada uma.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS attempt_questions (
  attempt_id  BIGINT UNSIGNED NOT NULL,     -- de qual tentativa é (tabela attempts)
  question_id INT UNSIGNED NOT NULL,        -- qual questão é (tabela questions)
  position    TINYINT UNSIGNED NOT NULL,    -- posição na prova (1 a 10)
  snapshot    MEDIUMTEXT NOT NULL,          -- cópia da questão no momento do sorteio (JSON)
  selected    TINYINT UNSIGNED NULL,        -- alternativa marcada (0 a 3, vazio = sem resposta)
  drawing     MEDIUMTEXT NOT NULL DEFAULT '[]',  -- desenho do quadro de contas (JSON)

  -- a mesma questão não repete na mesma tentativa
  PRIMARY KEY (attempt_id, question_id),
  -- duas questões não ocupam a mesma posição
  UNIQUE KEY unique_position (attempt_id, position),

  -- se apagar a tentativa, apaga as questões dela também
  FOREIGN KEY (attempt_id)  REFERENCES attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id),

  -- a alternativa marcada só pode ser vazia ou de 0 a 3
  CONSTRAINT chk_selected CHECK (selected IS NULL OR selected BETWEEN 0 AND 3)
) ENGINE=InnoDB;
