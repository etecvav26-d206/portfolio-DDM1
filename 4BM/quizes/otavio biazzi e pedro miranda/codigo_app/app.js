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

