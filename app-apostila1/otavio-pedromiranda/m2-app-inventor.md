## Instituição
Etec Vasco Antonio Venchiarutti

## Curso
Técnico em Informática para Internet

## Turma
2D

## Autores
- Otávio Giovanelli Biazzi
- Pedro Henrique Miranda

---

# Considerações Iniciais

No início do desenvolvimento dos projetos, tivemos uma certa dificuldade para nos
adaptar à plataforma App Inventor, pois a interface parecia um pouco travada e
pouco intuitiva. Porém, com o decorrer das atividades, percebemos que esse era o
comportamento padrão da ferramenta. Após esse período de adaptação, conseguimos
realizar os projetos de forma tranquila e produtiva.

# Projeto 1 – Primeiro Aplicativo (pg. 27)

### Descrição

- **Objetivo:** Criar o primeiro aplicativo no App Inventor utilizando um botão e uma
  legenda, seguindo o conceito clássico de "Hello World" (Olá Mundo). O app exibe
  uma mensagem de boas-vindas ao clicar no botão, apresenta uma imagem do globo
  terrestre e possui botões para limpar a mensagem e fechar a aplicação.
- **Funcionamento:** Ao clicar no botão "Clique Aqui!", a legenda exibe a mensagem
  "Olá Mundo" em vermelho. O botão "Limpar" apaga a mensagem e o botão "Fechar"
  encerra o aplicativo. Uma imagem de fundo (globo terrestre) é exibida na tela
  utilizando o componente Pintura.
- **Modificações realizadas:**
  - Foi adicionada uma **Legenda 2**, que mantém as propriedades originais
    da Legenda 1 do exemplo da apostila.
  - A **Legenda 1** foi personalizada com o texto em **tamanho maior** e
    formatado em **negrito**, diferenciando-a visualmente da Legenda 2.

### Print das telas do Design
<img width="1919" height="892" alt="image" src="https://github.com/user-attachments/assets/4b526486-6463-485a-9038-50e11ff91b62" />

### Print das telas dos Blocos
<img width="1919" height="896" alt="image" src="https://github.com/user-attachments/assets/2a52ec17-12e2-407e-9396-49f0fab65edc" />

# Projeto 2 – Segundo Aplicativo (pg. 46)

### Descrição

- **Objetivo:** Desenvolver um aplicativo de pintura que utiliza conceitos de desenho,
  cores e imagem. O app permite ao usuário escolher uma cor (vermelho, verde, azul
  ou amarelo) e desenhar linhas sobre uma imagem de fundo arrastando o dedo na tela,
  além de limpar o desenho.
- **Funcionamento:** O aplicativo possui quatro botões de cores alinhados
  horizontalmente. Ao selecionar uma cor e arrastar o dedo sobre a área de pintura
  (que exibe uma imagem do globo terrestre como fundo), linhas são desenhadas na
  cor escolhida. O botão "Limpar" apaga todos os desenhos feitos.
- **Modificações realizadas:**
  - Foram adicionadas **novas opções de cores** além das previstas na apostila.
  - A **imagem padrão foi substituída** por uma imagem personalizada.

### Print das telas do Design
<img width="1918" height="893" alt="image" src="https://github.com/user-attachments/assets/33f5293a-50e4-458a-be97-97ef83a58d0c" />

### Print das telas dos Blocos
<img width="1917" height="895" alt="image" src="https://github.com/user-attachments/assets/40cd2689-6f6c-4e17-9435-fbf8ef71c65d" />

# Projeto 3 – Terceiro Aplicativo (pg. 56)

### Descrição

- **Objetivo:** Criar um aplicativo que simula o funcionamento de um liquidificador,
  aprimorando os conceitos de inserção de imagem, reprodução de som e vibração do
  dispositivo. Ao clicar na imagem do liquidificador, o celular emite o som de um
  liquidificador funcionando e vibra simultaneamente.
- **Funcionamento:** O aplicativo exibe a imagem de um liquidificador ocupando a tela
  inteira como botão. Ao tocar na imagem, o componente Som reproduz um arquivo
  MP3 com o barulho de liquidificador e aciona a vibração do celular por
  4500 milissegundos.
- **Modificações realizadas:**
  - Foi adicionada uma **notificação extra** que informa ao usuário quando o
    liquidificador está **ligado**, melhorando o feedback da aplicação.

### Print das telas do Design
<img width="1919" height="850" alt="image" src="https://github.com/user-attachments/assets/29d18a47-170a-413e-ae35-a910d57cb1d6" />

### Print das telas dos Blocos
<img width="1919" height="894" alt="image" src="https://github.com/user-attachments/assets/96bb432a-c166-4bea-a469-5f48e28e6fbf" />

# Projeto 4 – Quarto Aplicativo (pg. 64)

### Descrição

- **Objetivo:** Desenvolver um aplicativo que utiliza o recurso da câmera do
  celular para capturar fotografias e exibi-las na tela. O app possui um botão
  para tirar foto, que aciona a câmera do dispositivo, e após a captura a imagem
  é exibida diretamente na interface do aplicativo. Também conta com um botão
  para fechar a aplicação.
- **Funcionamento:** O aplicativo possui uma área de exibição de imagem (componente
  Imagem) e dois botões organizados horizontalmente: "Tirar Foto" e "Fechar".
  Ao clicar em "Tirar Foto", o componente Câmera é acionado e abre a câmera do
  dispositivo. Após a foto ser tirada, o bloco `quando Câmera1.DepoisDeFotografar`
  captura a imagem e a exibe no componente Imagem1 utilizando o bloco
  `ajustar Imagem1.Imagem para obter imagem`. O botão "Fechar" encerra a tela
  utilizando o bloco `fechar tela`.
- **Modificações realizadas:**
  - Foi adicionada uma **funcionalidade de desenho sobre a foto tirada**,
    permitindo que o usuário faça anotações, rabiscos ou desenhos diretamente
    sobre a imagem capturada pela câmera, utilizando o componente Pintura
    em conjunto com a câmera.

### Print das telas do Design
<img width="1919" height="892" alt="image" src="https://github.com/user-attachments/assets/eccbc4bf-bde4-483c-b681-f66827a316d7" />

### Print das telas dos Blocos
<img width="1916" height="896" alt="image" src="https://github.com/user-attachments/assets/6c617995-f5df-40cf-832e-aa3dcea27568" />


# Projeto 5 – Quinto Aplicativo (pg. 69)

### Descrição

- **Objetivo:** Criar um aplicativo com múltiplas telas de navegação, aprendendo
  a realizar a transição entre diferentes telas (Screens) dentro de uma mesma
  aplicação no App Inventor. O app demonstra como utilizar o bloco
  `abrir outra tela nomeDaTela` para criar um sistema de navegação funcional.
- **Funcionamento:** O aplicativo possui uma tela inicial (Screen1) com uma legenda
  "TELA INICIAL" e três botões coloridos organizados horizontalmente — "Tela1"
  (azul), "Tela2" (verde) e "Tela3" — que direcionam o usuário para as
  respectivas telas. A Tela1 possui fundo azul e um botão "VoltarInicio" que
  retorna à Screen1. A Tela2 possui uma imagem de fundo e dois botões:
  "Voltar Tela Início" (retorna à Screen1) e "Voltar Tela 1" (navega para a
  Tela1). A Tela3 foi adicionada como melhoria ao projeto original, contendo
  botões de navegação para as demais telas. A navegação entre todas as telas é
  feita utilizando o bloco de controle `abrir outra tela` com um bloco de texto
  contendo o nome da tela de destino.
- **Modificações realizadas:**
  - Foi adicionada uma **Tela 3**, expandindo a navegação do aplicativo para
    além do que era proposto na apostila (que continha apenas Screen1, Tela1
    e Tela2). A nova tela oferece mais conteúdo e opções de navegação ao
    usuário, com botões para retornar às demais telas do aplicativo.

---

### Print das telas do Design

**Tela Inicial (Screen1):**
<img width="1919" height="891" alt="image" src="https://github.com/user-attachments/assets/fe541fa4-1cac-4f49-aed0-64c5abe00354" />

**Tela 1:**
<img width="1919" height="896" alt="image" src="https://github.com/user-attachments/assets/6d96fdcf-eccd-43e9-bd8d-8889e73beee5" />

**Tela 2:**
<img width="1919" height="897" alt="image" src="https://github.com/user-attachments/assets/04302735-0268-494b-b127-62e40f9cddc8" />

**Tela 3 (adicionada como melhoria):**
<img width="1919" height="893" alt="image" src="https://github.com/user-attachments/assets/db4ad2e9-e876-436f-9ac1-b951225c2f4d" />

---

### Print das telas dos Blocos

**Blocos da Tela Inicial (Screen1):**
<img width="1919" height="896" alt="image" src="https://github.com/user-attachments/assets/455d6fd9-1734-42ad-b4ae-21d007fc29f0" />


**Blocos da Tela 1:**
<img width="1919" height="893" alt="image" src="https://github.com/user-attachments/assets/d9c7e9bd-0815-4a9f-a12a-7fa981d05b37" />

**Blocos da Tela 2:**
<img width="1919" height="897" alt="image" src="https://github.com/user-attachments/assets/fbec4483-1852-424b-82d9-ce5fa1821e96" />


**Blocos da Tela 3 (adicionada como melhoria):**
<img width="1919" height="896" alt="image" src="https://github.com/user-attachments/assets/1418b8a9-7991-4124-9e26-8d68cd71afc0" />
