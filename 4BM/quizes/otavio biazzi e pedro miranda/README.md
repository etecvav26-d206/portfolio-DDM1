# Médias (Matemática) — Quiz para App Inventor

| Dupla                                             | Assunto             |
| ------------------------------------------------- | ------------------- |
| Otávio Giovanelli Biazzi e Pedro Henrique Miranda | Média na Matemática |

**Fluxo:** Material de estudo → Fazer avaliação (10 questões sorteadas de 30, sem repetir) → se desistir, o próximo sorteio traz outras questões.

## Pastas e arquivos

```text
QuizMedia.aia       importar no MIT App Inventor
build_aia.py        gera o .aia de novo depois de editar a pasta codigo_app/

codigo_app/         a tela do app (já vai dentro do .aia)
  index.html          estrutura da página
  app.js              lógica (telas, quiz, quadro de contas, conversa com a API)
  css/base.css        cores, fontes, topo, menu, botões
  css/estudo.css      tela de estudo (aulas, fórmulas, Baldi)
  css/quiz.css        avaliação, quadro, resultado, histórico, info
  gifs/               imagens e gifs do Baldi
  LuckiestGuy.ttf     fonte dos títulos

servidor/           vai para C:\xampp\htdocs\QuizMedia
  api.php             API em PHP (sorteia, salva e corrige a prova)
  config.php          usuário/senha do MySQL
  .htaccess           bloqueia arquivos que não podem ser baixados
  sql/01_banco_e_tabelas.sql   cria o banco e as 3 tabelas
  sql/02_questoes.sql          coloca as 30 questões
  (index.html, app.js, css/, gifs/ são cópias de codigo_app/)
```

## Como colocar para funcionar (XAMPP)

1. Abra o XAMPP e inicie o Apache e o MySQL.
2. Copie a pasta `servidor/` para `C:\xampp\htdocs\QuizMedia`.
3. Crie o banco, nesta ordem (pelo terminal ou pelo phpMyAdmin > Importar):
   ```
   mysql -uroot --default-character-set=utf8mb4 < servidor/sql/01_banco_e_tabelas.sql
   mysql -uroot --default-character-set=utf8mb4 < servidor/sql/02_questoes.sql
   ```
4. Teste em http://localhost/QuizMedia/
5. No celular, use o IP do computador. O endereço da API pode ser mudado na aba **Info** do app (padrão: `http://localhost/QuizMedia/api.php`).

Dica: depois de mexer em `codigo_app/`, copie os arquivos alterados para `servidor/` e rode `python build_aia.py` para atualizar o `.aia`.

## Metodologia

A ideia do app, a proposta de usar o personagem Baldi, o conteúdo das aulas e as 30 questões foram definidos pela dupla. A parte do servidor em PHP partiu do material **AgendaServer** e **agenda.aia** fornecido pelo professor, que foi reaproveitado e adaptado. Durante praticamente todo o desenvolvimento foi utilizada uma ferramenta de Inteligência Artificial como apoio: na lógica do app, no sistema de troca de gifs e nas falas do Baldi, na adaptação da API, no CSS e na organização final do código. A cada parte, a dupla leu e procurou entender o código gerado, perguntou à IA se existiam opções melhores ou mais simples, escolheu o que usar e testou no navegador, no XAMPP e no App Inventor. As ferramentas utilizadas, suas finalidades, etapas e formas de validação estão detalhadas na **DECLARAÇÃO DE USO DE INTELIGÊNCIA ARTIFICIAL** abaixo.

## REFERÊNCIAS

- Material da disciplina: **AgendaServer** (getLista.php, insertFone.php, updateFone.php, setFone.php, dbagenda.sql) e **agenda.aia**, fornecidos pelo professor. Usados como base para a conexão com o MySQL, as respostas em JSON e as consultas da `api.php`.
- Documentação do PHP (PDO): https://www.php.net/manual/pt_BR/book.pdo.php
- MIT App Inventor: https://appinventor.mit.edu/

## DECLARAÇÃO DE USO DE INTELIGÊNCIA ARTIFICIAL

| Ferramenta         | Etapa                     | Finalidade                                                                                                   | Validação                                                                                     |
| ------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Claude (Anthropic) | Desenvolvimento (app.js)  | Ajuda na lógica das telas, do quiz, do quadro de contas, do resultado e do histórico                          | Código lido e explicado entre a dupla, ajustado e testado no navegador e no App Inventor      |
| Claude (Anthropic) | Desenvolvimento (Baldi)   | Ajuda no sistema de troca de gifs do Baldi e na escrita das frases/falas dele                                | Gifs e falas escolhidos e revisados pela dupla; testado em cada situação (acerto, erro, nota) |
| Claude (Anthropic) | Desenvolvimento (PHP/SQL) | Ajuda para adaptar o código do AgendaServer do professor para a API do quiz                                  | API testada pela dupla no XAMPP com o banco `quiz_media`                                      |
| Claude (Anthropic) | Desenvolvimento (CSS)     | Ajuda em parte do CSS das telas (estudo, quiz e resultado)                                                   | Visual conferido e ajustado pela dupla                                                        |
| Claude (Anthropic) | Revisão / organização     | Organizar `base.css`, `estudo.css` e `quiz.css`, removendo regras repetidas                                  | Telas conferidas uma a uma pela dupla depois da organização                                   |
| Claude (Anthropic) | Aprendizagem              | Explicar trechos de código e comparar outras opções de solução                                               | A dupla decidiu qual solução usar e consegue explicar o funcionamento                        |

A IA ajudou em praticamente todas as partes do projeto. As ideias criativas (tema, Baldi, telas e questões) foram da dupla. O nosso trabalho foi entender o que a IA sugeriu, perguntar se existiam opções melhores, escolher, adaptar e testar cada parte.
