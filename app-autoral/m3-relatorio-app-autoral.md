# Projeto Autoral - App Inventor

## Instituição
Etec Vasco Antonio Venchiarutti

## Curso
Técnico em Informatica para Internet

## Turma
2D

## Autores
- Otávio Giovanelli Biazzi
- Pedro Henrique Miranda
- Laura Cristina Cruz
- Pedro Godoi

---

## Projeto

### Título
PomoCrono

### Considerações iniciais
Se reunimos para pensar em uma ideia. Inicialmente veio a proposta de criar um jogo no estilo Cidade Dorme / Impostor, em que varios celulares se conectariam e cada jogador receberia uma função diferente. Porém, percebemos que seria uma ideia dificil de desenvolver, principalmente pela sincronização entre varios aparelhos ao mesmo tempo. Por isso, decidimos trocar a proposta.

### Nova ideia
A ideia escolhida foi desenvolver o **PomoCrono**, um aplicativo com duas telas: uma de cronômetro e outra de pomodoro. A proposta permite aplicar diversos conceitos estudados na apostila, como uso de botões, organização horizontal, navegação entre telas, variaveis, procedimentos, condicionais, blocos de texto, componente Clock e Notifier.

---

## Screen 1 – Cronômetro

### Design
A primeira tela foi montada com foco em simplicidade e organização visual. Foram utilizados os seguintes componentes:

- Uma Label principal para exibir o tempo no formato `00:00:00`
- Três botões: **Iniciar**, **Pausar** e **Resetar**
- Um botão para navegar até a segunda tela
- Um componente **Clock**
- Uma **OrganizaçãoHorizontal** para alinhar os botões lado a lado

### Blocos
Na lógica da primeira tela, foram utilizadas variáveis globais para armazenar horas, minutos e segundos. Também foram criados procedimentos para:

- formatar números com zero à esquerda
- atualizar o display do cronômetro
- controlar a contagem do tempo

O componente **Clock** foi configurado para disparar a cada 1000 milissegundos, incrementando o tempo e atualizando a Label principal. Os botões permitem iniciar, pausar e resetar a contagem. Também foi implementada a navegação para a segunda tela.

### Resultado
A Screen 1 ficou funcionando como um cronômetro completo, com contagem progressiva no formato `HH:MM:SS`, botões de controle e navegação para a tela do pomodoro.