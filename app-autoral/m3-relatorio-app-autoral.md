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

---

## Screen 2 – Pomodoro

### Design
A segunda tela seguiu o mesmo padrão visual da primeira, para manter consistencia no aplicativo. Foram utilizados:

- Uma Label principal para exibir o tempo restante
- Uma Label para indicar o modo atual
- Uma Label para mostrar a quantidade de ciclos
- Três botões: **Iniciar**, **Pausar** e **Resetar**
- Um botão para voltar para a primeira tela
- Uma **OrganizaçãoHorizontal**
- Um componente **Clock**
- Um componente **Notifier**

### Blocos
Na lógica do pomodoro, foram utilizadas variáveis para controlar minutos, segundos, modo atual e ciclos completos. Também foram reaproveitados procedimentos de formatação e atualização do tempo.

O temporizador foi configurado para funcionar em contagem regressiva. Quando o tempo chega a zero, o aplicativo troca automaticamente entre os modos **foco** e **descanso**, atualiza os valores do tempo e usa o **Notifier** para avisar o usuario sobre a mudança.

### Resultado
A Screen 2 ficou funcionando corretamente como pomodoro, com contagem regressiva, troca automática de modo, contador de ciclos e navegação de volta para a primeira tela.

---

## Ajustes finais
Após a implementação das duas telas, foram feitos ajustes visuais e funcionais no aplicativo. Foram revisadas cores, tamanhos de fonte, alinhamento dos componentes e funcionamento dos blocos. Também foram realizados testes para verificar o comportamento dos botões, a navegação entre telas e a alternância automática do pomodoro.

---

## Descrição

### Objetivo do aplicativo
O **PomoCrono** é um aplicativo que reúne um cronômetro e um timer pomodoro em um único projeto. O objetivo é permitir tanto a medição de tempo de atividades em geral quanto o uso da técnica pomodoro para estudo e produtividade.

### Como o aplicativo funciona
O aplicativo possui duas telas principais:

- **Screen 1:** cronômetro com contagem progressiva
- **Screen 2:** pomodoro com contagem regressiva de foco e descanso

Na primeira tela, o usuário pode iniciar, pausar e resetar o cronômetro. Na segunda, pode controlar o pomodoro, visualizar o modo atual e acompanhar os ciclos concluídos. O app permite navegar entre as duas telas a qualquer momento.

### Conceitos utilizados
Durante o desenvolvimento do projeto, foram utilizados diversos conceitos trabalhados na apostila:

- Construção de interface no modo Design
- Labels para exibição de informações
- Botões com propriedades personalizadas
- OrganizaçãoHorizontal
- Componente Clock
- Componente Notifier
- Variáveis globais
- Procedimentos
- Condicionais
- Blocos de texto e concatenação
- Navegação entre telas

### Divisão de tarefas
- **Otávio Giovanelli Biazzi:** blocos e lógica
- **Pedro Henrique Miranda:** blocos e lógica
- **Laura Cristina Cruz:** design e organização visual
- **Pedro Godoi:** design e organização visual

---

## Prints das telas do Design

### Screen 1 – Cronômetro
<img width="1916" height="896" alt="Screen 1 Design" src="https://github.com/user-attachments/assets/f90d9908-08cf-4ceb-815c-3b1e29f4a908" />

### Screen 2 – Pomodoro
<img width="1919" height="891" alt="Screen 2 Design" src="https://github.com/user-attachments/assets/86f34bc7-9f82-4e66-8a31-81c35500e08c" />

---

## Prints das telas dos Blocos

### Screen 1 – Blocos
<img width="1918" height="892" alt="Screen 1 Blocos" src="https://github.com/user-attachments/assets/d73ed351-a865-4dbe-9b6f-ec04cff2bd77" />

### Screen 2 – Blocos
<img width="1919" height="888" alt="Screen 2 Blocos" src="https://github.com/user-attachments/assets/66aba9f2-5e32-4fe9-b04c-5fd26dfcddc5" />