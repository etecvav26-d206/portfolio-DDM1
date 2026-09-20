# Relatório – Papas do Mal

## Instituição

`ETEC Vasco Antônio Venchiarutti`

## Curso

`Informática para Internet`

## Disciplina

`DDM – Desenvolvimento para Dispositivos Móveis`

## Turma

`2ºD`

## Integrantes

- `Otávio Giovanelli Biazzi`
- `Pedro Henrique Miranda`
- `Laura Cristina Gonçalves da Cruz`
- `Pedro Henrique Dalle Molle Godoi`

---

# Apresentação do jogo

**Papas do Mal** é um jogo autoral de sobrevivência e suspense desenvolvido no MIT App Inventor. O jogador permanece em um escritório durante a noite e precisa acompanhar a movimentação de três personagens pelo estabelecimento.

## Objetivo

O objetivo é sobreviver da meia-noite até as 6 horas da manhã. Para isso, o jogador deve observar as câmeras, acompanhar a posição dos inimigos e utilizar a porta e a lanterna no momento correto.

O projeto foi pensado para aplicar os conhecimentos adquiridos nos jogos do estudo de caso, principalmente o uso de Canvas, sprites, eventos, variáveis, procedimentos, sons e temporizadores.

## Estrutura inicial

A primeira versão definiu o menu, a tela principal e o começo do fluxo da partida. Também foram organizadas as variáveis que representam o horário, os estados da câmera, da porta e da lanterna, além da posição dos personagens.

---

# Interface e identidade visual

O jogo utiliza a orientação horizontal para aproveitar melhor o espaço da tela. A interface principal simula o ponto de vista do jogador dentro do escritório, enquanto o sistema de câmeras permite observar diferentes ambientes.

Os cenários incluem salão, palco, corredores, banheiro, cozinha e escritório. Cada local possui uma imagem de fundo própria, e os personagens são representados por sprites que aparecem conforme suas posições são atualizadas.

Na tela inicial, o botão `INICIAR` começa a sequência de introdução. Durante a partida, o jogador pode abrir o mapa das câmeras, escolher um ambiente, fechar o monitor, ir até a porta e voltar ao escritório.

## Organização dos controles

- botões posicionados sobre o mapa para selecionar as câmeras;
- controle para abrir e fechar o monitor;
- botão para ir até a porta;
- botão de retorno ao escritório;
- controle para abrir ou fechar a porta;
- lanterna para verificar se existe algum inimigo próximo.

## Print da interface

![Interface do jogo Papas do Mal](imagens/papas-interface.png)

---

# Mecânicas do jogo

## Sistema de horário

A noite começa às `12 AM` e termina às `6 AM`. O procedimento `desenhar_horario` mostra o horário no Canvas, enquanto os temporizadores controlam a passagem do tempo. Ao alcançar 6 AM, a partida é encerrada com a sequência de vitória.

## Câmeras

A variável `camera` identifica o ambiente selecionado, e `camera_aberta` informa se o monitor está em uso. Ao tocar nos pontos do mapa, o fundo muda para o cenário correspondente e o procedimento `mostrar_inimigos` exibe somente os personagens presentes naquela câmera.

Esse sistema permite acompanhar Papas, Rato e Vaca antes que eles se aproximem do escritório.

## Movimentação dos inimigos

Os procedimentos `papas_mover`, `rato_mover` e `vaca_mover` controlam o avanço de cada personagem. O `Clock_IA` executa as decisões em intervalos definidos e utiliza valores aleatórios para variar a movimentação.

As posições são mantidas em variáveis globais. Conforme um inimigo avança, ele aparece em lugares diferentes, como palco, salão, corredores, banheiro ou porta.

## Porta e lanterna

Na área da porta, o jogador pode acender a luz para verificar se existe um inimigo próximo. Também pode fechar a porta para impedir a entrada. Os estados são armazenados nas variáveis `lanterna` e `porta_fechada`.

Se um personagem permanecer na porta e ela continuar aberta, o temporizador de jumpscare pode encerrar a partida. Fechar a porta no momento correto faz o inimigo recuar e permite continuar a noite.

## Sons e transições

O projeto utiliza música de menu, narração introdutória, som de vitória e imagens de jumpscare. Os efeitos de transição são controlados com sprites de fade e pelo procedimento `atualizar_fade`, que altera gradualmente a imagem exibida.

## Print dos blocos

![Blocos do jogo Papas do Mal](imagens/papas-blocos.png)

---

# Organização da programação

Para evitar repetir grandes conjuntos de blocos, a lógica foi dividida em procedimentos com responsabilidades específicas.

| Procedimento | Responsabilidade |
| --- | --- |
| `mostrar_menu` | Preparar a tela inicial do jogo. |
| `jogo` | Configurar os elementos e estados usados durante a partida. |
| `esconder_tudo` | Ocultar sprites antes de montar uma nova visualização. |
| `ocultar_interface` | Retirar controles que não pertencem à tela atual. |
| `mostrar_inimigos` | Exibir os personagens de acordo com a câmera escolhida. |
| `papas_mover` | Atualizar a posição de Papas. |
| `rato_mover` | Atualizar a posição do Rato. |
| `vaca_mover` | Atualizar a posição da Vaca. |
| `desenhar_horario` | Apresentar o horário atual no Canvas. |
| `atualizar_fade` | Controlar as transições visuais. |
| `fiim_de_jogo` | Exibir a derrota e interromper a partida. |
| `vitoria` | Mostrar o encerramento da noite às 6 AM. |

## Temporizadores utilizados

| Temporizador | Função |
| --- | --- |
| `Clock_Main` | Atualizar os elementos principais da partida. |
| `Clock_tempo` | Controlar a passagem das horas. |
| `Clock_IA` | Movimentar os inimigos. |
| `Clock_jumpscare` | Verificar a permanência de um inimigo na porta. |
| `Clock_intro` | Organizar a introdução da noite. |
| `Clock_Transicao` | Executar o efeito de fade. |
| `Clock_Vitoria` | Controlar a sequência final de vitória. |

# Testes e correções

Durante os testes, verificamos principalmente:

- abertura e fechamento do monitor de câmeras;
- troca correta do cenário ao selecionar uma câmera;
- visibilidade dos inimigos em cada ambiente;
- funcionamento da porta e da lanterna;
- progressão do horário entre 12 AM e 6 AM;
- interrupção dos temporizadores no fim da partida;
- sequência de jumpscare e retorno ao menu;
- execução da tela e do som de vitória.

As correções concentraram-se no fluxo entre as telas e nos estados que precisavam ser restaurados ao iniciar uma nova partida. Isso evitou que elementos da rodada anterior continuassem visíveis ou ativos.

---

# Tecnologias e recursos utilizados

- MIT App Inventor;
- programação por blocos;
- Canvas e ImageSprite;
- eventos de toque;
- variáveis globais;
- procedimentos;
- números aleatórios;
- temporizadores;
- reprodução de áudio;
- detecção de estados e condições;
- Git e GitHub para versionamento.

# Evolução do projeto

O desenvolvimento foi dividido em cinco versões. Começamos pela estrutura do jogo e pelo fluxo principal, depois ajustamos telas e elementos visuais. Na sequência, organizamos sons, horário, câmeras e movimentação dos personagens. A quarta etapa foi dedicada às correções de fluxo e aos testes. Por fim, revisamos o projeto e preparamos a versão entregue.

Esse processo foi importante porque permitiu testar cada parte antes de considerar o jogo finalizado. Também deixou o histórico do repositório mais claro, mostrando a participação dos integrantes em momentos diferentes.

# Considerações finais

O desenvolvimento do **Papas do Mal** reuniu os principais conhecimentos trabalhados no bimestre. O projeto exigiu planejamento da interface, criação das regras, controle de vários estados ao mesmo tempo e testes das condições de vitória e derrota.

O maior desafio foi coordenar câmeras, inimigos, porta, lanterna, horário e transições sem deixar os elementos entrarem em conflito. A divisão da lógica em procedimentos e temporizadores ajudou a manter o funcionamento organizado.

Como resultado, criamos um jogo autoral completo, com identidade visual própria, progressão de tempo, estratégia de observação e diferentes respostas às ações do jogador.

---

*Relatório desenvolvido para fins educacionais na disciplina de Desenvolvimento para Dispositivos Móveis.*
