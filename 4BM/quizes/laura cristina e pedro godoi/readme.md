# Leis de Newton (Física) — Quiz para App Inventor

**Dupla:** Laura Cristina e Pedro Godoi  
**Assunto:** Leis de Newton (Física)  

## Fluxo do Aplicativo
Material de estudo → Fazer avaliação (10 questões sorteadas de 30, sem repetir) → se desistir, o próximo sorteio traz outras questões.

* Relatório com prints do app: [relatorio.md](relatorio.md)

---

## Pastas e Arquivos do Projeto

* `QuizMedia.aia` — Arquivo para importar no MIT App Inventor
* `build_aia.py` — Gera o `.aia` de novo depois de editar a pasta `codigo_app/`

### `codigo_app/` (Estrutura da tela do app)
* `index.html` — Estrutura da página
* `app.js` — Lógica (telas, quiz, quadro de contas, conversa com a API)
* `css/base.css` — Cores, fontes, topo, menu, botões
* `css/estudo.css` — Tela de estudo (aulas e fórmulas de Física)
* `css/quiz.css` — Avaliação, quadro, resultado, histórico, info
* `gifs/` — Imagens e animações
* `LuckiestGuy.ttf` — Fonte dos títulos

### `servidor/` (Vai para a pasta `C:\xampp\htdocs\QuizMedia`)
* `api.php` — API em PHP (sorteia, salva e corrige a prova)
* `config.php` — Usuário e senha do MySQL
* `.htaccess` — Bloqueia arquivos que não podem ser baixados
* `sql/01_banco_e_tabelas.sql` — Cria o banco e as tabelas
* `sql/02_questoes.sql` — Cadastra as questões de Física
*(Nota: index.html, app.js, css/ e gifs/ são cópias de codigo_app/)*

---

## Como Colocar para Funcionar (XAMPP)

1. Abra o XAMPP e inicie o **Apache** e o **MySQL**.
2. Copie a pasta `servidor/` para `C:\xampp\htdocs\QuizMedia`.
3. Crie o banco pelo terminal ou phpMyAdmin (`Importar`):
   * `mysql -uroot --default-character-set=utf8mb4 < servidor/sql/01_banco_e_tabelas.sql`
   * `mysql -uroot --default-character-set=utf8mb4 < servidor/sql/02_questoes.sql`
4. Teste no navegador em: `http://localhost/QuizMedia/`
5. No celular, utilize o IP do computador. O endereço da API pode ser alterado na aba Info do app (padrão: `http://localhost/QuizMedia/api.php`).

> **Dica:** Depois de alterar qualquer arquivo em `codigo_app/`, copie os arquivos atualizados para a pasta `servidor/` e execute `python build_aia.py` para atualizar o `.aia`.

---

## Metodologia

A ideia central do aplicativo, a proposta visual, o conteúdo das aulas de Física (Leis de Newton) e as questões foram definidos inteiramente pela dupla. A estrutura de servidor em PHP partiu do material fornecido pelo professor, que foi reaproveitado e adaptado para a nossa necessidade.

Durante o desenvolvimento, utilizamos ferramentas de Inteligência Artificial como apoio técnico na lógica, estruturação da API, CSS e organização do código. Cada trecho gerado foi lido, testado e validado pela dupla no navegador, no XAMPP e no App Inventor.

---

## Referências

* **Material da disciplina:** Códigos e estruturas fornecidos pelo professor (usados como base para conexão MySQL, formato JSON e consultas da API).
* **Documentação do PHP (PDO):** [https://www.php.net/manual/pt_BR/book.pdo.php](https://www.php.net/manual/pt_BR/book.pdo.php)
* **MIT App Inventor:** [https://appinventor.mit.edu/](https://appinventor.mit.edu/)

---

## Declaração de Uso de Inteligência Artificial

| Ferramenta | Etapa | Finalidade | Validação |
| :--- | :--- | :--- | :--- |
| **Inteligência Artificial** | Desenvolvimento (`app.js`) | Auxílio na lógica das telas, do quiz, do resultado e do histórico. | Código lido e explicado entre a dupla, ajustado e testado no navegador e no App Inventor. |
| **Inteligência Artificial** | Desenvolvimento (PHP/SQL) | Ajuda para adaptar a lógica de conexão para a API do quiz. | API testada pela dupla no XAMPP com o banco de dados. |
| **Inteligência Artificial** | Desenvolvimento (CSS) | Auxílio na estilização das telas (estudo, quiz e resultado). | Visual conferido e ajustado pela dupla. |
| **Inteligência Artificial** | Revisão / Organização | Organização e limpeza de arquivos CSS repetidos. | Telas conferidas uma a uma pela dupla. |
| **Inteligência Artificial** | Aprendizagem | Explicar trechos de código e comparar opções de solução. | A dupla decidiu qual solução usar e compreende o funcionamento. |
