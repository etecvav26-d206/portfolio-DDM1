-- ==========================================================
-- 02_questoes.sql
-- Coloca as 30 questões no banco (tabela questions).
-- Rode DEPOIS do 01_banco_e_tabelas.sql.
--
-- Cada questão tem:
--   id, categoria, dificuldade, enunciado,
--   alternativas (lista em JSON), número da certa (0=A 1=B 2=C 3=D), explicação.
--
-- INSERT IGNORE = se a questão já existe, pula (dá para rodar várias vezes).
-- ==========================================================

USE quiz_media;


-- ----------------------------------------------------------
-- MÉDIA ARITMÉTICA
-- ----------------------------------------------------------

-- Questão 1 (Essencial) - resposta certa: C
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '1',
  'Média aritmética',
  'Essencial',
  'Qual é a média aritmética de 6, 8 e 10?',
  '["6", "7", "8", "9"]',
  '2',
  'Some os valores e divida pela quantidade: (6 + 8 + 10) ÷ 3 = 24 ÷ 3 = 8.'
);

-- Questão 2 (Essencial) - resposta certa: B
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '2',
  'Média aritmética',
  'Essencial',
  'Ana tirou 7, 8, 6 e 9 em quatro provas de mesmo peso. Qual foi sua média?',
  '["7", "7,5", "8", "8,5"]',
  '1',
  'As notas somam 30. Como são quatro provas, a média é 30 ÷ 4 = 7,5.'
);

-- Questão 3 (Essencial) - resposta certa: D
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '3',
  'Média aritmética',
  'Essencial',
  'Em cinco dias, as temperaturas foram 20, 22, 24, 26 e 28 °C. Qual foi a temperatura média?',
  '["22 °C", "23 °C", "25 °C", "24 °C"]',
  '3',
  '(20 + 22 + 24 + 26 + 28) ÷ 5 = 120 ÷ 5 = 24 °C.'
);

-- Questão 4 (Essencial) - resposta certa: A
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '4',
  'Média aritmética',
  'Essencial',
  'Uma loja vendeu 12, 18 e 15 cadernos em três dias. Qual foi a média diária de vendas?',
  '["15 cadernos", "14 cadernos", "16 cadernos", "18 cadernos"]',
  '0',
  'A loja vendeu 45 cadernos. A média diária é 45 ÷ 3 = 15 cadernos.'
);

-- Questão 5 (Essencial) - resposta certa: C
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '5',
  'Média aritmética',
  'Essencial',
  'Qual é a média de 4,5; 6,5 e 7?',
  '["5", "5,5", "6", "6,5"]',
  '2',
  'Some os três valores: 4,5 + 6,5 + 7 = 18. Depois, 18 ÷ 3 = 6.'
);

-- Questão 6 (Essencial) - resposta certa: B
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '6',
  'Média aritmética',
  'Essencial',
  'Cinco amigos têm 12, 13, 14, 15 e 16 anos. Qual é a média das idades?',
  '["13 anos", "14 anos", "15 anos", "16 anos"]',
  '1',
  'As idades somam 70 anos. A média é 70 ÷ 5 = 14 anos.'
);

-- Questão 7 (Essencial) - resposta certa: D
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '7',
  'Média aritmética',
  'Essencial',
  'Qual é a média aritmética de −2, 4 e 10?',
  '["2", "3", "6", "4"]',
  '3',
  'Números negativos também entram na soma: (−2 + 4 + 10) ÷ 3 = 12 ÷ 3 = 4.'
);

-- Questão 8 (Essencial) - resposta certa: A
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '8',
  'Média aritmética',
  'Essencial',
  'Qual é a média aritmética de 0, 5, 10 e 15?',
  '["7,5", "5", "10", "8,5"]',
  '0',
  'O zero conta como um dos quatro valores: (0 + 5 + 10 + 15) ÷ 4 = 30 ÷ 4 = 7,5.'
);

-- Questão 9 (Essencial) - resposta certa: C
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '9',
  'Média aritmética',
  'Essencial',
  'Um atleta percorreu 3, 5, 4, 6 e 7 km em cinco treinos. Qual foi a distância média por treino?',
  '["4 km", "4,5 km", "5 km", "6 km"]',
  '2',
  'A distância total foi 25 km em cinco treinos: 25 ÷ 5 = 5 km.'
);

-- Questão 10 (Essencial) - resposta certa: B
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '10',
  'Média aritmética',
  'Essencial',
  'Qual é a média de 100, 120 e 140?',
  '["110", "120", "130", "140"]',
  '1',
  '(100 + 120 + 140) ÷ 3 = 360 ÷ 3 = 120.'
);

-- ----------------------------------------------------------
-- VALOR DESCONHECIDO
-- ----------------------------------------------------------

-- Questão 11 (Intermediário) - resposta certa: D
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '11',
  'Valor desconhecido',
  'Intermediário',
  'A média de três números é 9. Dois deles são 7 e 8. Qual é o terceiro?',
  '["9", "10", "11", "12"]',
  '3',
  'A soma deve ser 3 × 9 = 27. O terceiro número é 27 − 7 − 8 = 12.'
);

-- Questão 12 (Intermediário) - resposta certa: A
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '12',
  'Valor desconhecido',
  'Intermediário',
  'Pedro tirou 6 e 8 nas primeiras provas. Que nota precisa na terceira para ter média 7, com pesos iguais?',
  '["7", "6", "8", "9"]',
  '0',
  'Para média 7 em três provas, a soma deve ser 21. Logo, 21 − 6 − 8 = 7.'
);

-- Questão 13 (Intermediário) - resposta certa: C
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '13',
  'Valor desconhecido',
  'Intermediário',
  'A média de quatro números é 12. Três deles são 10, 11 e 13. Qual é o quarto?',
  '["12", "13", "14", "15"]',
  '2',
  'A soma dos quatro números é 4 × 12 = 48. Assim, o quarto é 48 − 10 − 11 − 13 = 14.'
);

-- Questão 14 (Intermediário) - resposta certa: B
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '14',
  'Valor desconhecido',
  'Intermediário',
  'A média de cinco notas é 8. Quatro delas são 7, 8, 9 e 6. Qual é a quinta nota?',
  '["9", "10", "8", "7"]',
  '1',
  'A soma precisa ser 5 × 8 = 40. As quatro notas somam 30. Falta a nota 10.'
);

-- Questão 15 (Intermediário) - resposta certa: D
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '15',
  'Valor desconhecido',
  'Intermediário',
  'A média das idades de três irmãos é 15 anos. Dois têm 12 e 16 anos. Qual é a idade do terceiro?',
  '["15 anos", "16 anos", "18 anos", "17 anos"]',
  '3',
  'As idades somam 3 × 15 = 45 anos. O terceiro tem 45 − 12 − 16 = 17 anos.'
);

-- ----------------------------------------------------------
-- MÉDIA PONDERADA
-- ----------------------------------------------------------

-- Questão 16 (Intermediário) - resposta certa: A
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '16',
  'Média ponderada',
  'Intermediário',
  'Uma prova tem peso 2 e um trabalho tem peso 3. Com notas 6 e 8, respectivamente, qual é a média ponderada?',
  '["7,2", "7", "7,5", "7,6"]',
  '0',
  'Multiplique cada nota pelo peso: (6 × 2 + 8 × 3) ÷ (2 + 3) = 36 ÷ 5 = 7,2.'
);

-- Questão 17 (Intermediário) - resposta certa: C
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '17',
  'Média ponderada',
  'Intermediário',
  'As notas 5, 7 e 9 têm pesos 1, 2 e 1, respectivamente. Qual é a média ponderada?',
  '["6", "6,5", "7", "7,5"]',
  '2',
  '(5 × 1 + 7 × 2 + 9 × 1) ÷ (1 + 2 + 1) = 28 ÷ 4 = 7.'
);

-- Questão 18 (Intermediário) - resposta certa: B
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '18',
  'Média ponderada',
  'Intermediário',
  'Uma avaliação tem nota 8 e peso 3; outra tem nota 6 e peso 1. Qual é a média ponderada?',
  '["7", "7,5", "8", "6,5"]',
  '1',
  '(8 × 3 + 6 × 1) ÷ (3 + 1) = 30 ÷ 4 = 7,5.'
);

-- Questão 19 (Intermediário) - resposta certa: D
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '19',
  'Média ponderada',
  'Intermediário',
  'Duas turmas fizeram a mesma prova. A primeira tem 20 alunos e média 6; a segunda, 30 alunos e média 8. Qual é a média dos 50 alunos?',
  '["7", "7,5", "6,8", "7,2"]',
  '3',
  'O peso é o número de alunos: (20 × 6 + 30 × 8) ÷ 50 = 360 ÷ 50 = 7,2.'
);

-- Questão 20 (Intermediário) - resposta certa: A
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '20',
  'Média ponderada',
  'Intermediário',
  'Você comprou 2 kg de arroz a R$ 4/kg e 3 kg a R$ 6/kg. Qual foi o preço médio por quilo?',
  '["R$ 5,20", "R$ 5,00", "R$ 5,50", "R$ 4,80"]',
  '0',
  'O custo foi 2 × 4 + 3 × 6 = R$ 26 para 5 kg. O preço médio foi 26 ÷ 5 = R$ 5,20/kg.'
);

-- Questão 21 (Intermediário) - resposta certa: C
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '21',
  'Média ponderada',
  'Intermediário',
  'Três avaliações têm notas 4, 6 e 8 e pesos 1, 2 e 3. Qual é a média ponderada? Arredonde para duas casas decimais.',
  '["6,00", "6,50", "6,67", "7,00"]',
  '2',
  '(4 × 1 + 6 × 2 + 8 × 3) ÷ 6 = 40 ÷ 6 = 6,666… Arredondando: 6,67.'
);

-- Questão 22 (Desafio) - resposta certa: B
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '22',
  'Média ponderada',
  'Desafio',
  'A primeira prova vale 40% da média e a segunda, 60%. Com notas 5 e 10, qual é a média final?',
  '["7,5", "8", "8,5", "7"]',
  '1',
  'Calcule 5 × 0,40 + 10 × 0,60 = 2 + 6 = 8.'
);

-- Questão 23 (Desafio) - resposta certa: D
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '23',
  'Média ponderada',
  'Desafio',
  'Um aluno tirou 6 em uma prova de peso 1. Que nota precisa em outra de peso 2 para ter média ponderada 8?',
  '["8", "8,5", "10", "9"]',
  '3',
  '(6 × 1 + x × 2) ÷ 3 = 8. Portanto, 6 + 2x = 24; 2x = 18; x = 9.'
);

-- ----------------------------------------------------------
-- RACIOCÍNIO COM MÉDIAS
-- ----------------------------------------------------------

-- Questão 24 (Intermediário) - resposta certa: A
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '24',
  'Raciocínio com médias',
  'Intermediário',
  'Quatro números têm média 10. Se acrescentarmos o número 20, qual será a nova média?',
  '["12", "10", "11", "15"]',
  '0',
  'A soma original é 4 × 10 = 40. Com o novo número, a soma é 60 para cinco números: 60 ÷ 5 = 12.'
);

-- Questão 25 (Intermediário) - resposta certa: C
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '25',
  'Raciocínio com médias',
  'Intermediário',
  'Cinco números têm média 8. Retirando o número 12, qual será a média dos quatro restantes?',
  '["6", "6,5", "7", "7,5"]',
  '2',
  'A soma original é 5 × 8 = 40. Retirando 12, restam 28 para quatro números. A média é 28 ÷ 4 = 7.'
);

-- Questão 26 (Essencial) - resposta certa: B
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '26',
  'Raciocínio com médias',
  'Essencial',
  'A média de um conjunto é 6. Se somarmos 3 a cada valor, qual será a nova média?',
  '["6", "9", "12", "18"]',
  '1',
  'Quando somamos 3 a todos os valores, a média também aumenta 3: 6 + 3 = 9.'
);

-- Questão 27 (Essencial) - resposta certa: D
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '27',
  'Raciocínio com médias',
  'Essencial',
  'Um conjunto tem média 4. Se multiplicarmos todos os valores por 2, qual será a nova média?',
  '["4", "6", "10", "8"]',
  '3',
  'Multiplicar cada valor por 2 também multiplica a média por 2: 4 × 2 = 8.'
);

-- Questão 28 (Desafio) - resposta certa: A
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '28',
  'Raciocínio com médias',
  'Desafio',
  'Uma equipe de 4 pessoas tem idade média de 20 anos. Outra equipe de 6 pessoas tem média de 25 anos. Qual é a média das 10 pessoas?',
  '["23 anos", "22,5 anos", "24 anos", "21 anos"]',
  '0',
  'Use as quantidades como pesos: (4 × 20 + 6 × 25) ÷ 10 = 230 ÷ 10 = 23 anos.'
);

-- Questão 29 (Desafio) - resposta certa: C
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '29',
  'Raciocínio com médias',
  'Desafio',
  'Em uma lista, o número 10 foi registrado por engano como 30. A média ficou 4 unidades maior. Quantos números há na lista?',
  '["4", "6", "5", "10"]',
  '2',
  'O erro aumentou a soma em 30 − 10 = 20. Como a média aumentou 4, a quantidade é 20 ÷ 4 = 5.'
);

-- ----------------------------------------------------------
-- CONCEITO DE MÉDIA
-- ----------------------------------------------------------

-- Questão 30 (Essencial) - resposta certa: B
INSERT IGNORE INTO questions (id, category, difficulty, prompt, options_json, correct_index, explanation) VALUES (
  '30',
  'Conceito de média',
  'Essencial',
  'Qual procedimento calcula a média aritmética de um conjunto de números?',
  '["Escolher o valor central da lista ordenada.", "Somar todos os valores e dividir pela quantidade de valores.", "Escolher o valor que mais se repete.", "Somar o maior e o menor valor, sempre."]',
  '1',
  'A média aritmética é a soma dos valores dividida pela quantidade. O valor central é a mediana; o mais frequente é a moda.'
);
