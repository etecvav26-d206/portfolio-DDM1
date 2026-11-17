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

