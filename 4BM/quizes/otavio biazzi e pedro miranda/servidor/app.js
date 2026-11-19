/*
  APP.JS - toda a lógica da tela do app (Médias, Matemática)

  Como o app funciona:
  1. O aluno lê o material de estudo.
  2. Clica em "Fazer avaliação" e o servidor (api.php) sorteia 10 questões.
  3. O aluno responde, pode fazer contas no quadro e finaliza.
  4. O servidor corrige e devolve a nota.

  O que está salvo no celular fica no objeto "state" (localStorage / App Inventor).
*/
'use strict';

// Tudo fica dentro dessa função para as variáveis não vazarem para a página
(() => {

// ============================================================
// 1. VARIÁVEIS GLOBAIS
// ============================================================

// atalho para document.querySelector
const $ = (seletor) => document.querySelector(seletor);

const main = $('#main');                 // onde as telas são desenhadas
const CHAVE = 'quizmedia.v2';            // nome usado para salvar no localStorage

// Endereço padrão da API (o api.php no XAMPP)
let ENDERECO_PADRAO = 'http://localhost/QuizMedia/api.php';
if (location.protocol.startsWith('http') && location.host) {
  ENDERECO_PADRAO = location.origin + '/QuizMedia/api.php';
}

// Se a página está dentro do App Inventor, existe window.AppInventor
const dentroDoApp = !!(window.AppInventor && window.AppInventor.setWebViewString);

// Dados que são guardados no aparelho
let state = {
  version: 2,
  config: { api: ENDERECO_PADRAO },  // endereço da API
  active: null,                      // avaliação em andamento (ou null)
  history: [],                       // avaliações já finalizadas
  avoid: [],                         // ids das questões da última tentativa desistida
  updated: 0                         // quando foi salvo por último
};

let view = 'estudo';     // tela atual: estudo, quiz, review, result, historico, settings
let current = 0;         // número da questão aberta (0 a 9)
let review = null;       // avaliação que está sendo revisada
let drawing = false;     // o quadro está ligado?
let brushWidth = 3;      // grossura do pincel
let stroke = null;       // traço que está sendo desenhado agora

let booted = false;      // o app já iniciou?
let busy = false;        // está fazendo uma operação? (evita clique duplo)
let finishing = false;   // está finalizando a avaliação?
let syncBusy = false;    // está enviando respostas ao servidor?
let syncTimer;           // timer para enviar as respostas
let toastTimer;          // timer para esconder o aviso
let online = null;       // servidor conectado? (null = ainda não sabemos)
let questionCount = 0;   // quantas questões existem no banco

// Variáveis da conversa com o App Inventor
let pendingNative = null;
let nativeSerial = 0;
let nativeQueue = Promise.resolve();
let restoreDone = false;

// Troca caracteres perigosos do texto antes de colocar no HTML
function esc(texto) {
  const trocas = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(texto ?? '').replace(/[&<>"']/g, (c) => trocas[c]);
}

// ============================================================
// 2. SALVAR E CARREGAR DADOS
// ============================================================

// Manda uma mensagem para o App Inventor (o bloco WebViewer recebe)
function nativeSend(mensagem) {
  window.AppInventor.setWebViewString(JSON.stringify(mensagem));
}

// Salva o "state" no navegador e no App Inventor
function persist() {
  state.updated = Date.now();
  const texto = JSON.stringify(state);
  let salvou = false;

  try {
    localStorage.setItem(CHAVE, texto);
    salvou = true;
  } catch (erro) {
    // localStorage pode estar cheio ou bloqueado
  }

  if (dentroDoApp) {
    nativeSend({ action: 'store', payload: texto });
    salvou = true;
  }

  if (!salvou) toast('Armazenamento cheio. Mantenha o servidor conectado.');
}

// Confere se os dados salvos têm o formato certo
function validState(dados) {
  if (!dados || dados.version !== 2) return false;
  if (!dados.config || typeof dados.config.api !== 'string') return false;
  if (!Array.isArray(dados.history)) return false;
  if (dados.active) {
    if (!Array.isArray(dados.active.questions) || dados.active.questions.length !== 10) return false;
  }
  return true;
}

// Usa os dados salvos (se forem válidos e mais novos que os atuais)
function adopt(salvo) {
  try {
    const dados = typeof salvo === 'string' ? JSON.parse(salvo) : salvo;
    if (validState(dados) && (dados.updated || 0) >= (state.updated || 0)) {
      state = dados;
      state.avoid = state.avoid || [];
      // se o endereço salvo era "localhost", volta ao padrão (no celular não funciona)
      if (/\/\/localhost[:\/]/.test(state.config.api)) state.config.api = ENDERECO_PADRAO;
    }
  } catch (erro) {
    // dados quebrados: ignora
  }
}

// O App Inventor chama esta função e entrega os dados salvos
window.QMRestore = (salvo) => {
  if (restoreDone) return;
  restoreDone = true;
  adopt(salvo);
  boot();
};

// ============================================================
// 3. CONVERSA COM A API (api.php)
// ============================================================

// O App Inventor chama esta função com a resposta do servidor
window.QMNativeReceive = (id, codigo, texto) => {
  if (!pendingNative || pendingNative.id !== id) return;
  const pedido = pendingNative;
  pendingNative = null;
  clearTimeout(pedido.timeout);

  if (!codigo) {
    pedido.reject(new Error('Sem conexão. Confira o endereço e o XAMPP.'));
    return;
  }
  try {
    const dados = JSON.parse(texto);
    if (codigo >= 400 || !dados.ok) throw new Error(dados.message || 'O servidor recusou a operação.');
    pedido.resolve(dados);
  } catch (erro) {
    const msg = erro.message.includes('JSON') ? 'A API retornou uma resposta inválida.' : erro.message;
    pedido.reject(new Error(msg));
  }
};

// Envia um pedido pelo App Inventor (um de cada vez, em fila)
function requestNative(url, metodo, corpo) {
  const enviar = () => new Promise((resolve, reject) => {
    const id = ++nativeSerial;
    const timeout = setTimeout(() => {
      if (pendingNative && pendingNative.id === id) pendingNative = null;
      reject(new Error('O servidor demorou. Confira o XAMPP.'));
    }, 20000);
    pendingNative = { id, resolve, reject, timeout };
    nativeSend({ action: 'request', id, url, method: metodo, body: JSON.stringify(corpo || {}) });
  });
  const resultado = nativeQueue.then(enviar);
  nativeQueue = resultado.catch(() => {});
  return resultado;
}

// Arruma o endereço digitado em Info (coloca http:// e /api.php se faltar)
function normalizeApi(valor) {
  let texto = valor.trim();
  if (!/^https?:\/\//i.test(texto)) texto = 'http://' + texto;

  let url;
  try {
    url = new URL(texto);
  } catch (erro) {
    throw new Error('Digite um endereço válido.');
  }
  if (url.username || url.password || url.hash || url.search) {
    throw new Error('Use o endereço da API sem parâmetros.');
  }
  if (url.pathname === '/') {
    url.pathname = '/QuizMedia/api.php';
  } else if (!url.pathname.endsWith('.php')) {
    url.pathname = url.pathname.replace(/\/$/, '') + '/api.php';
  }
  return url.href;
}

// Chama a API. Sem "corpo" é GET, com "corpo" é POST.
// Exemplo: await api('start', { exclude: [] })
async function api(acao, corpo = null, base = state.config.api) {
  const url = base + '?action=' + acao;

  // Dentro do App Inventor quem faz o pedido é o próprio app
  if (dentroDoApp) return requestNative(url, corpo ? 'POST' : 'GET', corpo);

  // No navegador usamos fetch, com limite de 12 segundos
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), 12000);
  try {
    const resposta = await fetch(url, {
      method: corpo ? 'POST' : 'GET',
      headers: corpo ? { 'Content-Type': 'application/json' } : {},
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: controle.signal,
      cache: 'no-store'
    });

    let dados;
    try {
      dados = await resposta.json();
    } catch (erro) {
      throw new Error('A API não retornou JSON. Confira o endereço.');
    }
    if (!resposta.ok || !dados.ok) throw new Error(dados.message || 'O servidor recusou a operação.');
    return dados;
  } catch (erro) {
    if (erro.name === 'AbortError') throw new Error('O servidor demorou. Confira o XAMPP.');
    if (erro instanceof TypeError) throw new Error('Sem conexão com o servidor. Confira o XAMPP.');
    throw erro;
  } finally {
    clearTimeout(limite);
  }
}

// ============================================================
// 4. FUNÇÕES AUXILIARES DE INTERFACE
// ============================================================

// Mostra uma mensagem rápida na parte de baixo da tela
function toast(texto) {
  const caixa = $('#toast');
  caixa.textContent = texto;
  caixa.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => caixa.classList.remove('show'), 4000);
}

// Quantas questões já têm resposta
function answerCount(avaliacao) {
  return avaliacao.questions.filter((q) => q.selected !== null).length;
}

// Segundos desde que a avaliação começou
function elapsed(avaliacao) {
  const segundos = Math.floor((Date.now() - avaliacao.localStarted) / 1000);
  return Math.max(0, Math.min(31536000, segundos));
}

// Formata a data do histórico (ex.: 17 de nov., 14:30)
function fmtDate(valor) {
  try {
    return new Date(valor).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch (erro) {
    return '';
  }
}

// Monta uma fração em HTML (numerador em cima, denominador embaixo)
function frac(cima, baixo) {
  return `<span class="frac"><span>${cima}</span><span>${baixo}</span></span>`;
}

// Desenha o menu de baixo (Estudar / Avaliação / Histórico / Info)
function renderTabs() {
  const menu = $('#tabs');

  // durante a prova o menu some
  const esconder = view === 'quiz' || view === 'review' || view === 'result';
  menu.classList.toggle('hidden', esconder);
  document.body.style.paddingBottom = esconder ? '24px' : '';

  // qual botão fica marcado
  let marcado = '';
  if (view === 'estudo' || view === 'historico' || view === 'settings') marcado = view;

  const botoes = [
    ['estudo', 'Estudar'],
    ['avaliacao', 'Avaliação'],
    ['historico', 'Histórico'],
    ['settings', 'Info']
  ];
  menu.innerHTML = botoes.map(([chave, nome]) => {
    const acao = chave === 'avaliacao' ? 'tab-quiz' : chave;
    const atual = marcado === chave ? 'aria-current="page"' : '';
    return `<button data-action="${acao}" ${atual}>${nome}</button>`;
  }).join('');
}

// Troca de tela
function setView(proxima, rolar = true) {
  endStroke();
  drawing = false;
  view = proxima;
  render();
  if (rolar) window.scrollTo(0, 0);
}

// Desenha a tela certa de acordo com a variável "view"
function render() {
  renderTabs();
  if (view === 'estudo') renderEstudo();
  else if (view === 'quiz' || view === 'review') renderQuiz();
  else if (view === 'result') renderResult();
  else if (view === 'historico') renderHistorico();
  else if (view === 'settings') renderSettings();
}

// ============================================================
// 5. FALAS E IMAGENS DO BALDI
//    Cada situação tem uma lista de [imagem, fala]
// ============================================================
const FALAS = {
  // esperando o aluno escolher
  espera: [
    ['gifs/baldi.png', 'Escolha uma alternativa!'],
    ['gifs/baldi-pensa.webp', 'Pense bem antes de responder.'],
    ['gifs/baldi-tvfala.webp', 'Vamos, estou esperando.'],
    ['gifs/baldi-sorrindo.webp', 'Não adianta olhar pro teto.'],
    ['gifs/baldi-gira.webp', 'É só fazer a conta, você consegue.'],
    ['gifs/baldi-falando.webp', 'Use o quadro para fazer as contas.']
  ],
  // aluno marcou uma alternativa
  marcou: [
    ['gifs/baldi.png', 'Resposta marcada.'],
    ['gifs/baldi-pensa.webp', 'Confere a conta antes de seguir.'],
    ['gifs/baldi-tvfala.webp', 'Você pode mudar se quiser.'],
    ['gifs/baldi-gira.webp', 'Já fez a conta no quadro?'],
    ['gifs/baldi-sorrindo.webp', 'Pode ir para a próxima quando quiser.'],
    ['gifs/baldi-pensa.webp', 'Tem certeza dessa resposta?']
  ],
  // na revisão, questão certa
  certa: [
    ['gifs/baldi-danca.webp', 'Certo! Muito bem.'],
    ['gifs/baldi-feliz.webp', 'Isso aí! Mais uma certa.'],
    ['gifs/baldi-certo.webp', 'Excelente! Continue assim.'],
    ['gifs/baldi-danca.webp', 'Perfeito! Você estudou.'],
    ['gifs/baldi-feliz.webp', 'Mandou bem nessa!']
  ],
  // na revisão, questão errada
  errada: [
    ['gifs/baldi-frown.webp', 'Errado! Leia a resolução.'],
    ['gifs/baldi-balanca.webp', 'Quase! Veja onde errou.'],
    ['gifs/baldi-erro3.webp', 'Ops, essa não era a resposta.'],
    ['gifs/baldi-regua.webp', 'Hmm... hora de estudar mais.'],
    ['gifs/baldi-brabo.webp', 'Essa não! Veja a resolução.']
  ],
  // resultado final: nota 10
  dez: [
    ['gifs/baldi-festa.webp', 'Perfeito! Até coloquei chapéu de festa!'],
    ['gifs/baldi-danca.webp', 'Nota máxima! Nem precisei da régua.'],
    ['gifs/baldi-feliz.webp', 'Dez! Você é bom nisso.']
  ],
  // resultado final: nota de 6 a 9
  boa: [
    ['gifs/baldi-ok.webp', 'Parabéns! Você mereceu.'],
    ['gifs/baldi-feliz.webp', 'Muito bem! Quase perfeito.'],
    ['gifs/baldi-danca.webp', 'Mandou bem nessa avaliação!']
  ],
  // resultado final: nota de 1 a 5
  media: [
    ['gifs/baldi-regua.webp', 'Estude mais um pouco, ou eu pego a régua.'],
    ['gifs/baldi-brabo.webp', 'Dá pra melhorar. Leia o material de novo.'],
    ['gifs/baldi-balanca.webp', 'Quase lá, mas ainda faltou.'],
    ['gifs/baldi-frown.webp', 'Foi mal, hein? Estude de novo.']
  ],
  // resultado final: nota 0
  zero: [
    ['gifs/baldi-frown.webp', 'Você errou tudo! Volte ao material.'],
    ['gifs/baldi-brabo.webp', 'Zero? Vai ter muita réguada!'],
    ['gifs/baldi-erro3.webp', 'Nenhum acerto... vamos estudar!']
  ]
};

// Escolhe uma fala da lista. O número "n" só serve para variar a escolha.
function baldiRow(tipo, n) {
  const lista = FALAS[tipo];
  const [imagem, fala] = lista[n % lista.length];
  return `<div class="baldi-row"><img src="${imagem}" alt="Baldi"><p class="bubble">${fala}</p></div>`;
}

// ============================================================
// 6. TELA DE ESTUDO (material sobre média)
// ============================================================
function renderEstudo() {
  const emAndamento = state.active;

  main.innerHTML = `
    <section class="hero">
      <img class="baldi-hero" src="gifs/baldi.png" alt="Baldi segurando a régua">
      <h1>Aprenda <mark>média</mark> e depois faça a avaliação.</h1>
      <p>Leia o material abaixo. Quando se sentir pronto, faça a avaliação: 10 questões sorteadas de um banco de 30, sem repetir.</p>
    </section>
    <p class="bubble full">Estude direito, senão vai tomar réguada!</p>

    <article class="lesson">
      <header><h2>O que é a média</h2></header>
      <div class="lesson-body">
        <p>A média é um único número que representa um conjunto de valores. Ela diz qual seria o valor de todos se eles fossem iguais.</p>
        <p>Exemplo do dia a dia: a média das suas notas, a temperatura média da semana, o gasto médio por dia.</p>
      </div>
    </article>

    <article class="lesson">
      <header><h2>Média aritmética</h2></header>
      <div class="lesson-body">
        <p>Todos os valores têm a mesma importância. Some tudo e divida pela quantidade de valores.</p>
        <div class="formula">M = ${frac('x₁ + x₂ + … + xₙ', 'n')}<small>n = quantidade de valores</small></div>
        <div class="example">
          <h3>Exemplo</h3>
          <p>Média de 6, 8 e 10:</p>
          <ol class="steps"><li>Soma: 6 + 8 + 10 = 24</li><li>Quantidade: 3</li><li>Média: 24 ÷ 3 = 8</li></ol>
        </div>
        <details><summary>Tente: média de 5, 7, 9 e 11</summary><div class="ans">5 + 7 + 9 + 11 = 32 e 32 ÷ 4 = 8.</div></details>
      </div>
    </article>

    <article class="lesson">
      <header><h2>Média ponderada</h2></header>
      <div class="lesson-body">
        <p>Aqui cada valor tem um peso. Multiplique cada valor pelo seu peso, some, e divida pela soma dos pesos.</p>
        <div class="formula">M = ${frac('x₁·p₁ + x₂·p₂ + …', 'p₁ + p₂ + …')}<small>p = peso de cada valor</small></div>
        <div class="example">
          <h3>Exemplo</h3>
          <p>Nota 6 com peso 2 e nota 8 com peso 3:</p>
          <ol class="steps"><li>6 · 2 = 12 e 8 · 3 = 24</li><li>Soma dos produtos: 36</li><li>Soma dos pesos: 5</li><li>Média: 36 ÷ 5 = 7,2</li></ol>
        </div>
        <details><summary>Tente: nota 5 (peso 1) e nota 9 (peso 3)</summary><div class="ans">(5·1 + 9·3) ÷ (1+3) = 32 ÷ 4 = 8.</div></details>
      </div>
    </article>

    <article class="lesson">
      <header><h2>Valor desconhecido</h2></header>
      <div class="lesson-body">
        <p>Quando o problema dá a média e esconde um valor, faça o caminho de volta: soma = média × quantidade. Depois subtraia os valores que você já conhece.</p>
        <div class="example">
          <h3>Exemplo</h3>
          <p>Duas notas são 7 e 8. Qual deve ser a terceira para a média ser 8?</p>
          <ol class="steps"><li>Soma necessária: 8 · 3 = 24</li><li>Já tem: 7 + 8 = 15</li><li>Falta: 24 − 15 = 9</li></ol>
        </div>
        <details><summary>Tente: média 6 em 4 provas; notas 5, 6 e 4</summary><div class="ans">Soma necessária 6·4 = 24. Já tem 15. Falta 9.</div></details>
      </div>
    </article>

    <article class="lesson">
      <header><h2>Interpretando a média</h2></header>
      <div class="lesson-body">
        <p>A média não é o valor do meio e nem precisa ser um dos valores da lista. Valores muito altos ou baixos puxam a média.</p>
        <div class="example"><h3>Exemplo</h3><p>2, 2, 2 e 10 têm média (2+2+2+10) ÷ 4 = 4. Três dos quatro valores são menores que a média.</p></div>
      </div>
    </article>

    <section class="cheat">
      <h2>Resumo para a avaliação</h2>
      <ul>
        <li>Aritmética: soma ÷ quantidade.</li>
        <li>Ponderada: soma dos (valor × peso) ÷ soma dos pesos.</li>
        <li>Valor que falta: média × quantidade − soma que já existe.</li>
        <li>Confira se a conta faz sentido: a média fica entre o menor e o maior valor.</li>
      </ul>
    </section>

    <section class="cta">
      <h2>${emAndamento ? 'Avaliação em andamento' : 'Pronto para a avaliação?'}</h2>
      <button class="btn primary block" data-action="${emAndamento ? 'resume' : 'start'}">${emAndamento ? 'Continuar avaliação' : 'Fazer avaliação'}</button>
    </section>`;
}

// Pergunta ao servidor quantas questões existem (health)
async function checkHealth() {
  const base = state.config.api;
  try {
    const resposta = await api('health', null, base);
    if (base !== state.config.api) return;   // o endereço mudou no meio do caminho
    online = resposta.questionCount >= 10;
    questionCount = resposta.questionCount;
  } catch (erro) {
    if (base !== state.config.api) return;
    online = false;
  }
  const caixa = $('#home-server');
  if (caixa) {
    caixa.innerHTML = online
      ? `<i class="dot on"></i>Banco conectado · ${questionCount} questões`
      : '<i class="dot off"></i>Servidor fora do ar · confira o XAMPP';
  }
}

// ============================================================
// 7. AVALIAÇÃO (as 10 questões)
// ============================================================

// A avaliação que está na tela: a em andamento ou a em revisão
function avaliacaoAtual() {
  return view === 'review' ? review : state.active;
}

// Começa uma avaliação nova (pede 10 questões ao servidor)
async function startQuiz() {
  if (busy) return;
  if (state.active) { setView('quiz'); return; }   // já tem uma em andamento

  busy = true;
  const botao = $('[data-action="start"]');
  if (botao) {
    botao.disabled = true;
    botao.innerHTML = '<span class="loading"></span> Sorteando…';
  }

  try {
    const base = state.config.api;
    // "exclude" = questões da tentativa desistida, para não repetir
    const dados = await api('start', { exclude: state.avoid || [] }, base);

    // confere se vieram 10 questões diferentes
    const idsDiferentes = new Set(dados.questions.map((q) => q.id));
    if (dados.questions.length !== 10 || idsDiferentes.size !== 10) {
      throw new Error('Sorteio inválido recebido do servidor.');
    }

    state.active = { ...dados, api: base, localStarted: Date.now(), revision: 0, syncedRevision: 0, index: 0 };
    state.avoid = [];
    current = 0;
    online = true;
    persist();
    setView('quiz');
  } catch (erro) {
    toast(erro.message);
    online = false;
    if (view === 'estudo') renderEstudo();
  } finally {
    busy = false;
  }
}

// Desistir: guarda os ids para o próximo sorteio trazer outras questões
function giveUp() {
  if (view !== 'quiz' || !state.active || finishing) return;
  endStroke();
  clearTimeout(syncTimer);
  state.avoid = state.active.questions.map((q) => q.id);
  state.active = null;
  persist();
  setView('estudo');
}

// Desenha a tela de uma questão (serve para a prova e para a revisão)
function renderQuiz() {
  const avaliacao = avaliacaoAtual();
  if (!avaliacao) { setView('estudo'); return; }

  // na prova, a questão aberta fica salva em "index"
  if (view === 'quiz') current = avaliacao.index || 0;
  current = Math.min(9, Math.max(0, current));

  const q = avaliacao.questions[current];
  const revisando = view === 'review';

  // botões do topo
  const topo = revisando
    ? '<button class="btn small" data-action="result">Sair da revisão</button>'
    : '<button class="btn small" data-action="estudo">Sair</button><button class="btn small pen" data-action="giveup">Desistir</button>';

  // bolinhas numeradas (1 a 10)
  const mapa = avaliacao.questions.map((item, i) => {
    let classe = i === current ? 'current ' : '';
    if (revisando) classe += item.isCorrect ? 'correct' : 'wrong';
    else if (item.selected !== null) classe += 'answered';
    const atual = i === current ? 'aria-current="step"' : '';
    return `<button class="${classe}" data-action="jump" data-index="${i}" aria-label="Questão ${i + 1}" ${atual}>${i + 1}</button>`;
  }).join('');

  // qual fala do Baldi aparece
  let tipoFala;
  if (revisando) tipoFala = q.isCorrect ? 'certa' : 'errada';
  else tipoFala = q.selected === null ? 'espera' : 'marcou';
  const numeroFala = current * 7 + (q.selected ?? 0) * 3 + 1;

  // alternativas A, B, C, D
  const letras = 'ABCD';
  const alternativas = q.options.map((texto, i) => {
    let classe = q.selected === i ? ' selected' : '';
    let legenda = '';
    if (revisando && i === q.correct) { classe = ' correct'; legenda = 'certa'; }
    else if (revisando && q.selected === i) { classe = ' wrong'; legenda = 'sua resposta'; }
    return `<button class="option${classe}" data-action="answer" data-index="${i}" aria-pressed="${q.selected === i}" ${revisando ? 'disabled' : ''}>
      <span class="letter">${letras[i]}</span><span>${esc(texto)}</span><span>${legenda}</span></button>`;
  }).join('');

  // botão da direita: Próxima / Finalizar / Resultado
  let acaoFim = 'next', textoFim = 'Próxima';
  if (current === 9) {
    acaoFim = revisando ? 'result' : 'finish';
    textoFim = revisando ? 'Resultado' : 'Finalizar';
  }

  main.innerHTML = `
    <div class="qhead">${topo}</div>
    <nav class="qmap" aria-label="Questões">${mapa}</nav>
    ${baldiRow(tipoFala, numeroFala)}
    <div class="progress"><span>Questão ${current + 1} de 10</span></div>

    <article class="qcard">
      <h1 id="qt">${esc(q.prompt)}</h1>
      <div class="options" role="group" aria-labelledby="qt">${alternativas}</div>
      ${revisando ? `<div class="explain"><strong>Resolução</strong>${esc(q.explanation)}</div>` : ''}
    </article>

    <section class="board-box">
      <div class="board-top">
        <h2>Quadro de contas</h2>
        ${revisando ? '' : '<button class="btn small" data-action="toggle-board" aria-pressed="false">Ativar quadro</button>'}
      </div>
      <div class="board-tools">
        <label>Pincel <input type="range" id="brush" min="1" max="12" value="${brushWidth}" ${revisando ? 'disabled' : ''}><output id="brush-value">${brushWidth}</output></label>
        <button class="btn small" data-action="clear-board" ${revisando ? 'disabled' : ''}>Limpar</button>
      </div>
      <div class="canvas-wrap" id="canvas-wrap">
        <canvas id="board" aria-label="Quadro da questão ${current + 1}"></canvas>
        <div class="canvas-note hidden" id="canvas-note"></div>
      </div>
    </section>

    <div class="qnav">
      <button class="btn" data-action="previous" ${current === 0 ? 'disabled' : ''}>Anterior</button>
      <button class="btn primary" data-action="${acaoFim}">${textoFim}</button>
    </div>
    ${revisando ? '<button class="btn block exit" data-action="result">Sair da revisão</button>' : ''}`;

  initCanvas();
}

// ============================================================
// 8. ENVIAR RESPOSTAS AO SERVIDOR (sincronizar)
// ============================================================

// Chamada sempre que algo muda (resposta ou desenho)
function changed() {
  const a = state.active;
  if (!a) return;
  a.revision++;          // marca que há algo novo para enviar
  persist();
  clearTimeout(syncTimer);
  syncTimer = setTimeout(sync, 900);   // espera 0,9 s e envia
}

// Monta o que será enviado ao servidor
function saveBody(a) {
  return {
    token: a.token,
    elapsed: elapsed(a),
    answers: a.questions.map((q) => ({ id: q.id, selected: q.selected, strokes: q.strokes }))
  };
}

// Envia as respostas ao servidor (ação "save")
async function sync() {
  clearTimeout(syncTimer);
  const a = state.active;
  if (!a || syncBusy || finishing || a.revision === a.syncedRevision) return;

  syncBusy = true;
  const revisao = a.revision;
  try {
    await api('save', saveBody(a), a.api);
    online = true;
    if (state.active && state.active.token === a.token) {
      a.syncedRevision = revisao;
      persist();
      // se mudou de novo enquanto enviava, envia outra vez
      if (a.revision !== revisao) syncTimer = setTimeout(sync, 300);
    }
  } catch (erro) {
    // sem internet: as respostas continuam salvas no aparelho, tenta de novo em 15 s
    online = false;
    syncTimer = setTimeout(sync, 15000);
  } finally {
    syncBusy = false;
  }
}

// O aluno clicou em uma alternativa
function chooseAnswer(i) {
  if (view !== 'quiz' || finishing) return;
  endStroke();
  const q = state.active.questions[current];
  if (q.selected === i) return;
  q.selected = i;
  changed();
  drawing = false;
  renderQuiz();
}

// Vai para a questão número i
function navigate(i) {
  if (finishing || i < 0 || i > 9) return;
  endStroke();
  drawing = false;
  current = i;
  if (view === 'quiz') {
    state.active.index = i;
    persist();
    sync();
  }
  renderQuiz();
  window.scrollTo(0, 0);
}

// ============================================================
// 9. QUADRO DE CONTAS (canvas)
//    Cada traço é { width, points: [[x, y], ...] } com x e y entre 0 e 1,
//    assim o desenho se ajusta a qualquer tamanho de tela.
// ============================================================
let resizeObserver, canvas, ctx;

// Prepara o quadro depois que a questão foi desenhada na tela
function initCanvas() {
  if (resizeObserver) resizeObserver.disconnect();
  canvas = $('#board');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  // redesenha se o tamanho mudar
  resizeObserver = new ResizeObserver(() => redraw());
  resizeObserver.observe(canvas);

  // dedo/mouse encostou: começa um traço
  canvas.addEventListener('pointerdown', (e) => {
    if (!drawing || view !== 'quiz' || finishing || stroke || e.isPrimary === false) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const q = state.active.questions[current];
    let usados = 0;
    for (const t of q.strokes) usados += t.points.length;
    if (q.strokes.length >= 500 || usados >= 39500) {
      toast('Quadro cheio. Desfaça traços ou limpe.');
      return;
    }

    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    stroke = { width: brushWidth, points: [point(e)], pointer: e.pointerId, remaining: 40000 - usados };
    q.strokes.push({ width: stroke.width, points: stroke.points });
    $('#canvas-note').classList.add('hidden');
    redraw();
  });

  // dedo/mouse andou: aumenta o traço
  canvas.addEventListener('pointermove', (e) => {
    if (!stroke || stroke.pointer !== e.pointerId) return;
    e.preventDefault();
    const pontos = stroke.points;
    const novo = point(e);
    const ultimo = pontos[pontos.length - 1];
    if (pontos.length >= Math.min(2000, stroke.remaining)) return;               // traço grande demais
    if (Math.hypot(novo[0] - ultimo[0], novo[1] - ultimo[1]) < 0.0012) return;   // quase não mexeu
    pontos.push(novo);
    drawSegment(ultimo, novo, stroke.width);
  });

  // soltou o dedo: termina o traço
  for (const nome of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(nome, () => endStroke());
  }
  redraw();
}

// Converte a posição do dedo em [x, y] entre 0 e 1
function point(e) {
  const caixa = canvas.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (e.clientX - caixa.left) / caixa.width));
  const y = Math.min(1, Math.max(0, (e.clientY - caixa.top) / caixa.height));
  return [Number(x.toFixed(5)), Number(y.toFixed(5))];
}

// Desenha uma linha entre dois pontos
function drawSegment(a, b, grossura) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = grossura * w / 350;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(a[0] * w, a[1] * h);
  ctx.lineTo(b[0] * w, b[1] * h);
  ctx.stroke();
}

// Apaga e desenha tudo de novo
function redraw() {
  if (!canvas || !ctx) return;
  const avaliacao = avaliacaoAtual();
  if (!avaliacao) return;

  // ajusta a resolução para telas nítidas (celular)
  const escala = Math.min(window.devicePixelRatio || 1, 3);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.round(w * escala);
  canvas.height = Math.round(h * escala);
  ctx.setTransform(escala, 0, 0, escala, 0, 0);
  ctx.clearRect(0, 0, w, h);

  for (const traco of avaliacao.questions[current].strokes) {
    // traço com um ponto só vira uma bolinha
    if (traco.points.length === 1) {
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(traco.points[0][0] * w, traco.points[0][1] * h, traco.width * w / 700, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 1; i < traco.points.length; i++) {
      drawSegment(traco.points[i - 1], traco.points[i], traco.width);
    }
  }
}

// Termina o traço atual e avisa que mudou
function endStroke() {
  if (!stroke) return;
  stroke = null;
  if (state.active && view === 'quiz') changed();
}

// Liga/desliga o quadro (desligado deixa a tela rolar normalmente)
function toggleBoard() {
  if (view !== 'quiz' || finishing) return;
  endStroke();
  drawing = !drawing;
  const botao = $('[data-action="toggle-board"]');
  if (!botao) return;
  botao.setAttribute('aria-pressed', String(drawing));
  botao.textContent = drawing ? 'Concluir' : 'Ativar quadro';
  $('#canvas-wrap').classList.toggle('editing', drawing);
}

// Apaga o desenho da questão atual
function clearBoard() {
  if (view !== 'quiz' || finishing) return;
  endStroke();
  const q = state.active.questions[current];
  if (!q.strokes.length) return;
  q.strokes = [];
  changed();
  redraw();
}

// ============================================================
// 10. FINALIZAR, RESULTADO, HISTÓRICO E INFO
// ============================================================

// Envia tudo ao servidor, que corrige e devolve a nota
async function finishQuiz() {
  if (finishing || !state.active) return;
  endStroke();
  const a = state.active;
  const respondidas = answerCount(a);

  // só finaliza com as 10 respondidas
  if (respondidas < 10) {
    navigate(a.questions.findIndex((q) => q.selected === null));
    toast(`Faltam ${10 - respondidas} questões.`);
    return;
  }

  finishing = true;
  busy = true;
  clearTimeout(syncTimer);
  const botao = $('[data-action="finish"]');
  if (botao) {
    botao.disabled = true;
    botao.innerHTML = '<span class="loading"></span>';
  }

  try {
    const resultado = await api('finish', saveBody(a), a.api);
    review = { ...resultado, api: a.api, localStarted: a.localStarted, completedLocal: Date.now() };

    // guarda no histórico (no máximo 8, sem repetir)
    const outras = state.history.filter((h) => h.token !== review.token);
    state.history = [review, ...outras].slice(0, 8);
    state.active = null;
    persist();
    current = 0;
    online = true;
    setView('result');
  } catch (erro) {
    toast(erro.message + ' Suas respostas continuam salvas.');
    if (view === 'quiz') renderQuiz();
  } finally {
    finishing = false;
    busy = false;
  }
}

// Tela de resultado
function renderResult() {
  if (!review) { setView('estudo'); return; }
  const nota = review.score;

  // fala do Baldi conforme a nota
  let tipo = 'zero';
  if (nota === 10) tipo = 'dez';
  else if (nota > 5) tipo = 'boa';
  else if (nota > 0) tipo = 'media';

  const idPrimeira = review.questions[0] ? review.questions[0].id : 0;

  const lista = review.questions.map((q, i) => `
    <button class="row ${q.isCorrect ? 'good' : 'bad'}" data-action="review-question" data-index="${i}">
      <span class="badge">${i + 1}</span>
      <span><p>${esc(q.prompt)}</p><small>${q.isCorrect ? 'Acertou' : 'Errou'}</small></span>
    </button>`).join('');

  main.innerHTML = `
    <div class="qhead"><button class="btn small" data-action="estudo">Voltar ao início</button></div>
    ${baldiRow(tipo, nota + idPrimeira)}
    <div class="score"><strong>${nota}</strong><span>/ 10</span></div>
    <div class="metrics">
      <div><b>${nota}</b><small>acertos</small></div>
      <div><b>${nota * 10}%</b><small>aproveitamento</small></div>
    </div>
    <div class="actions">
      <button class="btn primary block" data-action="review-all">Rever respostas e contas</button>
      <button class="btn block" data-action="new">Nova avaliação</button>
    </div>
    <h2 class="section-title">Questões</h2>
    ${lista}`;
}

// Tela de histórico
function renderHistorico() {
  let conteudo;
  if (state.history.length) {
    conteudo = state.history.map((a, i) => `
      <button class="row" data-action="history" data-index="${i}">
        <span class="badge">${a.score}</span>
        <span><p>${a.score} de 10 certas</p><small>${fmtDate(a.completedLocal)}</small></span>
      </button>`).join('');
  } else {
    conteudo = '<div class="empty">Nenhuma avaliação finalizada ainda.</div>';
  }
  main.innerHTML = `<h1>Histórico</h1>${conteudo}`;
}

// Tela de informações (dupla, assunto e endereço da API)
function renderSettings() {
  main.innerHTML = `
    <h1>Info</h1>
    <table class="table">
      <tr><th>Dupla</th><td>Otávio Giovanelli Biazzi<br>Pedro Henrique Miranda</td></tr>
      <tr><th>Assunto</th><td>Média na Matemática</td></tr>
    </table>
    <label class="field" for="api-url">Endereço</label>
    <input class="input" id="api-url" type="url" inputmode="url" autocapitalize="off" spellcheck="false" value="${esc(state.config.api)}">
    <button class="btn primary block" data-action="save-settings" style="margin-top:12px">Salvar</button>
    <div id="connection-result" class="result-msg hidden" role="status"></div>`;
}

// Salva o endereço da API e testa a conexão
async function saveSettings() {
  if (busy) return;
  const campo = $('#api-url');
  const caixa = $('#connection-result');
  const botao = $('[data-action="save-settings"]');

  let base;
  try {
    base = normalizeApi(campo.value);
  } catch (erro) {
    toast(erro.message);
    return;
  }

  state.config.api = base;
  persist();
  campo.value = base;
  busy = true;
  botao.disabled = true;
  botao.innerHTML = '<span class="loading"></span>';
  caixa.className = 'result-msg hidden';

  try {
    const resposta = await api('health', null, base);
    online = resposta.questionCount >= 10;
    questionCount = resposta.questionCount;
    caixa.className = 'result-msg ' + (online ? 'good' : 'bad');
    caixa.textContent = online ? 'Conectado.' : 'Faltam questões no banco.';
  } catch (erro) {
    online = false;
    caixa.className = 'result-msg bad';
    caixa.textContent = erro.message;
  } finally {
    busy = false;
    if (botao.isConnected) {
      botao.disabled = false;
      botao.textContent = 'Salvar';
    }
  }
}

// ============================================================
// 11. EVENTOS (cliques e outros)
// ============================================================

// Um único "ouvinte" de clique para o app todo.
// Cada botão tem data-action="nome" e aqui decidimos o que fazer.
document.addEventListener('click', (e) => {
  const botao = e.target.closest('[data-action]');
  if (!botao || botao.disabled) return;
  if (finishing) { toast('Aguarde a correção.'); return; }

  const acao = botao.dataset.action;
  const i = Number(botao.dataset.index);   // número do botão (questão, histórico...)

  if (acao === 'estudo') { setView('estudo'); sync(); checkHealth(); }
  else if (acao === 'tab-quiz') {
    if (state.active) { current = state.active.index || 0; setView('quiz'); sync(); }
    else startQuiz();
  }
  else if (acao === 'historico') setView('historico');
  else if (acao === 'settings') setView('settings');
  else if (acao === 'save-settings') saveSettings();
  else if (acao === 'start') startQuiz();
  else if (acao === 'resume') { current = state.active.index || 0; setView('quiz'); sync(); }
  else if (acao === 'giveup') giveUp();
  else if (acao === 'answer') chooseAnswer(i);
  else if (acao === 'jump') navigate(i);
  else if (acao === 'next') navigate(current + 1);
  else if (acao === 'previous') navigate(current - 1);
  else if (acao === 'toggle-board') toggleBoard();
  else if (acao === 'clear-board') clearBoard();
  else if (acao === 'finish') finishQuiz();
  else if (acao === 'result') setView('result');
  else if (acao === 'history') { review = state.history[i]; current = 0; setView('result'); }
  else if (acao === 'review-all') { current = 0; setView('review'); }
  else if (acao === 'review-question') { current = i; setView('review'); }
  else if (acao === 'new') {
    if (state.active) { current = state.active.index || 0; setView('quiz'); }
    else { setView('estudo'); startQuiz(); }
  }
});

// Mexeu no controle da grossura do pincel
document.addEventListener('input', (e) => {
  if (e.target.id === 'brush') {
    brushWidth = Number(e.target.value);
    $('#brush-value').textContent = brushWidth;
  }
});

// Saiu do app ou trocou de aba: salva. Voltou: envia o que faltou.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    endStroke();
    if (state.active) persist();
  } else {
    sync();
  }
});
window.addEventListener('pagehide', () => {
  endStroke();
  if (state.active) persist();
});

// A internet voltou
window.addEventListener('online', () => {
  sync();
  if (view === 'estudo') checkHealth();
});

// Botão "voltar" do celular (o App Inventor chama esta função)
window.QMBack = () => {
  if (finishing) return;
  if (drawing) { toggleBoard(); return; }
  if (view === 'review') { setView('result'); }
  else if (view !== 'estudo') { setView('estudo'); sync(); }
  else { toast('Seu progresso está salvo.'); }
};

// ============================================================
// 12. INÍCIO DO APP
// ============================================================
function boot() {
  if (booted) return;
  booted = true;
  view = 'estudo';
  render();
  checkHealth();
  // se ficou algo sem enviar da última vez, envia agora
  if (state.active && state.active.revision !== state.active.syncedRevision) {
    syncTimer = setTimeout(sync, 1500);
  }
}

// Tenta carregar o que estava salvo no navegador
try { adopt(localStorage.getItem(CHAVE)); } catch (erro) { /* sem localStorage */ }

if (dentroDoApp) {
  // pede ao App Inventor os dados salvos; se ele não responder em 3,5 s, inicia assim mesmo
  nativeSend({ action: 'load' });
  setTimeout(() => {
    if (!booted) { restoreDone = true; boot(); }
  }, 3500);
} else {
  restoreDone = true;
  boot();
}

})();
