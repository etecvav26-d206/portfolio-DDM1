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
