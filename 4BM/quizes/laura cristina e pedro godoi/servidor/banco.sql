
CREATE DATABASE IF NOT EXISTS quiz_fisica CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quiz_fisica;

DROP TABLE IF EXISTS perguntas;
CREATE TABLE perguntas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pergunta VARCHAR(300) NOT NULL,
  alt_a VARCHAR(150) NOT NULL,
  alt_b VARCHAR(150) NOT NULL,
  alt_c VARCHAR(150) NOT NULL,
  alt_d VARCHAR(150) NOT NULL,
  resposta CHAR(1) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO perguntas (pergunta, alt_a, alt_b, alt_c, alt_d, resposta) VALUES
  ('A Lei da Inércia corresponde a qual lei de Newton?', 'Primeira', 'Segunda', 'Terceira', 'Lei da Gravitação', 'A'),
  ('Qual é a fórmula da Segunda Lei de Newton?', 'F = m + a', 'F = m / a', 'F = m · a', 'F = a / m', 'C'),
  ('Qual lei é conhecida como Lei da Ação e Reação?', 'Primeira', 'Segunda', 'Terceira', 'Quarta', 'C'),
  ('Qual é a unidade de força no Sistema Internacional?', 'Joule', 'Watt', 'Quilograma', 'Newton', 'D'),
  ('Inércia é a tendência de um corpo de:', 'Aumentar sua velocidade', 'Ficar sempre parado', 'Manter seu estado de repouso ou de movimento', 'Mudar de direção', 'C'),
  ('Quando o ônibus freia bruscamente, os passageiros vão para frente. Isso ocorre por causa:', 'Da inércia', 'Da ação e reação', 'Da ausência de atrito', 'Do peso', 'A'),
  ('Uma força de 10 N atua em um corpo de 2 kg. Qual a aceleração?', '20 m/s²', '5 m/s²', '12 m/s²', '8 m/s²', 'B'),
  ('Um corpo de 5 kg tem aceleração de 3 m/s². Qual a força resultante?', '8 N', '1,7 N', '15 N', '2 N', 'C'),
  ('Se a força resultante sobre um corpo é zero, ele:', 'Está necessariamente parado', 'Acelera', 'Para imediatamente', 'Está em repouso ou em MRU', 'D'),
  ('Uma força de 20 N atua em um corpo de 4 kg. Qual a aceleração?', '80 m/s²', '16 m/s²', '0,2 m/s²', '5 m/s²', 'D'),
  ('Na Terceira Lei, as forças de ação e reação atuam:', 'Em corpos diferentes', 'No mesmo corpo', 'Se anulando', 'Com intensidades diferentes', 'A'),
  ('Ao caminhar, empurramos o chão para trás e ele nos empurra para frente. Qual lei explica isso?', 'Primeira', 'Terceira', 'Segunda', 'Nenhuma delas', 'B'),
  ('Quanto maior a massa de um corpo:', 'Menor a inércia', 'A inércia é zero', 'A inércia é igual', 'Maior a inércia', 'D'),
  ('Qual é a fórmula do peso?', 'P = m · g', 'P = m / g', 'P = g / m', 'P = m + g', 'A'),
  ('Qual o peso de uma pessoa de 60 kg, considerando g = 10 m/s²?', '600 N', '6 N', '60 N', '6000 N', 'A'),
  ('Qual a diferença entre massa e peso?', 'Massa é força e peso é quantidade de matéria', 'São a mesma coisa', 'O peso nunca muda de lugar', 'Massa é quantidade de matéria e peso é uma força', 'D'),
  ('Quem formulou as três leis do movimento?', 'Isaac Newton', 'Albert Einstein', 'Galileu Galilei', 'Johannes Kepler', 'A'),
  ('Em qual obra Newton publicou suas leis?', 'Os Elementos', 'Principia Mathematica', 'A Origem das Espécies', 'Almagesto', 'B'),
  ('Mantendo a massa constante, se a força resultante dobra, a aceleração:', 'Dobra', 'Cai pela metade', 'Não muda', 'Quadruplica', 'A'),
  ('Mantendo a força constante, se a massa dobra, a aceleração:', 'Dobra', 'Não muda', 'Vira zero', 'Cai pela metade', 'D'),
  ('Um foguete se move para frente expulsando gases para trás. Qual lei explica isso?', 'Primeira', 'Terceira', 'Segunda', 'Lei de Ohm', 'B'),
  ('Uma bola se move no espaço sem nenhuma força atuando. O que acontece com ela?', 'Para aos poucos', 'Acelera sempre', 'Desacelera', 'Mantém a velocidade constante', 'D'),
  ('Ao puxar rapidamente a toalha de uma mesa, os pratos ficam quase no lugar. Por quê?', 'Os pratos são leves', 'Por inércia', 'Porque a gravidade some', 'Por causa da reação', 'B'),
  ('A força resultante é:', 'A maior das forças', 'A soma vetorial de todas as forças', 'A menor das forças', 'A média das forças', 'B'),
  ('Duas forças de 6 N e 4 N atuam no mesmo sentido. Qual a resultante?', '2 N', '24 N', '1,5 N', '10 N', 'D'),
  ('Duas forças de 6 N e 4 N atuam em sentidos opostos. Qual a resultante?', '2 N', '10 N', '24 N', '0 N', 'A'),
  ('O cinto de segurança está relacionado a qual lei?', 'Primeira', 'Segunda', 'Terceira', 'Lei de Ohm', 'A'),
  ('Ao empurrar uma parede, você sente que ela empurra de volta porque:', 'A parede não exerce força', 'A força da parede é menor', 'A força da parede é maior', 'A parede exerce força igual e contrária', 'D'),
  ('1 N é a força que dá a um corpo de 1 kg a aceleração de:', '10 m/s²', '1 m/s²', '9,8 m/s²', '0,1 m/s²', 'B'),
  ('Um corpo de 10 kg recebe uma força de 50 N e sofre atrito de 20 N. Qual a aceleração?', '5 m/s²', '7 m/s²', '3 m/s²', '2 m/s²', 'C');
