// THE PRICE YOU PAY
// Estatísticas reais convertidas em tempo de ecrã, num letreiro de segmentos.
// Ficheiros necessários na pasta: texto-pt.txt e texto-en.txt (as cartas)

// ---- DADOS (atualiza aqui quando tiveres números mais recentes) ----
const CASAMENTOS_ANO = 37714;  // INE, 2025
const DIVORCIOS_ANO = 20345;   // INE, 2018 (troca pelo valor mais recente)
const DIAS_AMO_TE_ELE = 88;    // YouGov/eHarmony, 2013
const DIAS_AMO_TE_ELA = 134;
const DECIDIR_MIN = 90;        // segundos reais para decidir se alguém interessa
const DECIDIR_MAX = 240;

// ---- VELOCIDADE DA PROJEÇÃO ----
const MIN_POR_SEG = 3;   // 1 segundo no ecrã = 3 minutos reais
const DIAS_POR_SEG = 4;  // 1 segundo no ecrã = 4 dias reais

// ---- TEMPOS DE ECRÃ (em milissegundos) ----
const MIN_ANO = 365 * 24 * 60;
const T_CASAMENTO = MIN_ANO / CASAMENTOS_ANO / MIN_POR_SEG * 1000;
const T_DIVORCIO = MIN_ANO / DIVORCIOS_ANO / MIN_POR_SEG * 1000;
const T_ELE = DIAS_AMO_TE_ELE / DIAS_POR_SEG * 1000;
const T_CICLO = DIAS_AMO_TE_ELA / DIAS_POR_SEG * 1000;

let textos = [
  ["CARTAS", "PORTUGUESAS"],  // reserva, se não houver texto-pt.txt
  ["LOVE", "LETTERS"]         // reserva, se não houver texto-en.txt
];
let fragmentos = [];
let corAtual = [255, 150, 0];

let nCasamentos = 0;
let nDivorcios = 0;
let proxDecidir = 0;
let proxCasamento = 0;
let proxDivorcio = 0;
let cicloAnterior = 0;
let eleJaDisse = false;

// os 14 segmentos: [x1, y1, x2, y2], de 0 a 1 dentro da caixa de cada letra
const SEGMENTOS = {
  a: [0, 0, 1, 0],       b: [1, 0, 1, 0.5],    c: [1, 0.5, 1, 1],
  d: [0, 1, 1, 1],       e: [0, 0.5, 0, 1],    f: [0, 0, 0, 0.5],
  g1: [0, 0.5, 0.5, 0.5], g2: [0.5, 0.5, 1, 0.5],
  h: [0, 0, 0.5, 0.5],   i: [0.5, 0, 0.5, 0.5], j: [1, 0, 0.5, 0.5],
  k: [0, 1, 0.5, 0.5],   l: [0.5, 0.5, 0.5, 1], m: [1, 1, 0.5, 0.5]
};

// que segmentos acendem em cada caractere
const FONTE = {
  '0': 'a b c d e f', '1': 'b c', '2': 'a b d e g1 g2', '3': 'a b c d g1 g2',
  '4': 'b c f g1 g2', '5': 'a c d f g1 g2', '6': 'a c d e f g1 g2',
  '7': 'a b c', '8': 'a b c d e f g1 g2', '9': 'a b c d f g1 g2',
  'A': 'a b c e f g1 g2', 'B': 'a b c d g2 i l', 'C': 'a d e f',
  'D': 'a b c d i l', 'E': 'a d e f g1 g2', 'F': 'a e f g1 g2',
  'G': 'a c d e f g2', 'H': 'b c e f g1 g2', 'I': 'a d i l',
  'J': 'b c d e', 'K': 'e f g1 j m', 'L': 'd e f', 'M': 'b c e f h j',
  'N': 'b c e f h m', 'O': 'a b c d e f', 'P': 'a b e f g1 g2',
  'Q': 'a b c d e f m', 'R': 'a b e f g1 g2 m', 'S': 'a c d f g1 g2',
  'T': 'a i l', 'U': 'b c d e f', 'V': 'e f j k', 'W': 'b c e f k m',
  'X': 'h j k m', 'Y': 'h j l', 'Z': 'a j k d',
  '-': 'g1 g2', '+': 'g1 g2 i l', '/': 'j k', '!': 'i', '?': 'a b g2 l'
};

function preload() {
  carregar('texto-pt.txt', 0);
  carregar('texto-en.txt', 1);
}

function carregar(ficheiro, idioma) {
  loadStrings(ficheiro, function (l) {
    let palavras = limpar(l.join(' ')).split(/\s+/).filter(function (p) {
      return p !== '';
    });
    if (palavras.length > 0) {
      textos[idioma] = palavras;
    }
  }, function () {});
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeCap(ROUND);
  proxCasamento = T_CASAMENTO * 0.5;
  proxDivorcio = T_DIVORCIO * 0.5;
}

function draw() {
  blendMode(BLEND);
  background(0);
  blendMode(ADD);   // o que se sobrepõe fica mais brilhante

  let agora = millis();

  // 1. decidir se alguém interessa: sai uma frase da carta
  if (agora > proxDecidir) {
    decidir();
    proxDecidir = agora + random(DECIDIR_MIN, DECIDIR_MAX) * 1000 / (MIN_POR_SEG * 60);
  }

  // 2. casamentos e divórcios ao ritmo das estatísticas
  if (agora > proxCasamento) {
    casamento();
    proxCasamento = agora + T_CASAMENTO;
  }
  if (agora > proxDivorcio) {
    divorcio();
    proxDivorcio = agora + T_DIVORCIO;
  }

  // 3. o ciclo de uma relação: ele diz "amo-te", depois ela, e recomeça
  let t = agora % T_CICLO;
  if (t < cicloAnterior) {
    amoTe('ela');
    eleJaDisse = false;
  } else if (!eleJaDisse && t >= T_ELE) {
    amoTe('ele');
    eleJaDisse = true;
  }
  cicloAnterior = t;

  // desenhar os fragmentos, que se escrevem e desaparecem
  for (let i = fragmentos.length - 1; i >= 0; i--) {
    let f = fragmentos[i];
    let idade = agora - f.nasc;

    if (idade > f.vida) {
      fragmentos.splice(i, 1);
    } else {
      corAtual = f.cor;
      desenharTexto(f.txt, f.x, f.y, f.larg, floor(idade / f.vel));
    }
  }

  // contadores fixos, como numa Bolsa
  let larg = min(22, width * 0.02);
  corAtual = [80, 255, 120];
  desenharTexto('CASAMENTOS ' + nCasamentos, width * 0.25, height * 0.06, larg, Infinity);
  corAtual = [255, 60, 40];
  desenharTexto('DIVORCIOS ' + nDivorcios, width * 0.75, height * 0.06, larg, Infinity);

  // o dia da relação atual
  corAtual = [255, 150, 0];
  let dia = floor(t / 1000 * DIAS_POR_SEG);
  desenharTexto('DIA ' + nf(dia, 3), width / 2, height * 0.94, larg * 1.4, Infinity);
}

// ---- EVENTOS ----

function decidir() {
  let palavras = random(textos);
  let n = floor(random(2, 5));
  let inicio = floor(random(max(1, palavras.length - n)));
  let txt = palavras.slice(inicio, inicio + n).join(' ');
  criarFragmento(txt, random(18, 46), [255, 150, 0], 30, 1500);
}

function casamento() {
  nCasamentos++;
  criarFragmento('CASAMENTO +1', 40, [80, 255, 120], 40, 2500);
}

function divorcio() {
  nDivorcios++;
  criarFragmento('DIVORCIO -1', 40, [255, 60, 40], 40, 2500);
}

function amoTe(quem) {
  let dias = DIAS_AMO_TE_ELA;
  let quemTxt = 'ELA';
  if (quem === 'ele') {
    dias = DIAS_AMO_TE_ELE;
    quemTxt = 'ELE';
  }
  criarFragmento(quemTxt + ' DISSE AMO-TE NO DIA ' + dias, 54, [255, 255, 255], 45, 3500);
}

function criarFragmento(txt, larg, cor, vel, folga) {
  let n = limpar(txt).length;
  larg = min(larg, (width * 0.9) / (n * 1.5));
  let total = n * larg * 1.5;

  fragmentos.push({
    txt: txt,
    larg: larg,
    cor: cor,
    vel: vel,                       // milissegundos por letra
    x: random(total / 2 + 20, width - total / 2 - 20),
    y: random(height * 0.12, height * 0.88),
    nasc: millis(),
    vida: n * vel + folga           // tempo a escrever + tempo visível
  });

  if (fragmentos.length > 40) {
    fragmentos.shift();
  }
}

// ---- A FONTE ----

function limpar(txt) {
  return txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

function desenharTexto(txt, cx, cy, larg, visiveis) {
  txt = limpar(txt);
  let alt = larg * 1.8;
  let passo = larg * 1.5;
  let x0 = cx - (txt.length * passo - (passo - larg)) / 2;

  for (let n = 0; n < txt.length; n++) {
    desenharGlifo(txt[n], x0 + n * passo, cy - alt / 2, larg, alt, n < visiveis);
  }
}

function desenharGlifo(c, x, y, w, h, aceso) {
  let esp = w * 0.14;

  if (c === ':') {
    ponto(x + w / 2, y + h * 0.3, esp, aceso);
    ponto(x + w / 2, y + h * 0.7, esp, aceso);
    return;
  }
  if (c === '.' || c === ',') {
    ponto(x + w / 2, y + h, esp, aceso);
    return;
  }

  let ativos = (FONTE[c] || '').split(' ');
  for (let nome in SEGMENTOS) {
    segmento(SEGMENTOS[nome], x, y, w, h, esp, aceso && ativos.includes(nome));
  }
}

function segmento(s, x, y, w, h, esp, aceso) {
  let x1 = x + s[0] * w;
  let y1 = y + s[1] * h;
  let x2 = x + s[2] * w;
  let y2 = y + s[3] * h;

  // encurta as pontas para deixar uma folga entre segmentos
  let comp = dist(x1, y1, x2, y2);
  let ux = (x2 - x1) / comp;
  let uy = (y2 - y1) / comp;
  let folga = w * 0.12;
  x1 += ux * folga;
  y1 += uy * folga;
  x2 -= ux * folga;
  y2 -= uy * folga;

  if (aceso) {
    stroke(corAtual[0], corAtual[1], corAtual[2], 60);    // brilho
    strokeWeight(esp * 3);
    line(x1, y1, x2, y2);
    stroke(min(255, corAtual[0] + 40), min(255, corAtual[1] + 40), min(255, corAtual[2] + 40));
    strokeWeight(esp);
    line(x1, y1, x2, y2);
  } else {
    stroke(corAtual[0] * 0.15, corAtual[1] * 0.15, corAtual[2] * 0.15);   // apagado
    strokeWeight(esp);
    line(x1, y1, x2, y2);
  }
}

function ponto(x, y, esp, aceso) {
  noStroke();
  if (aceso) {
    fill(corAtual[0], corAtual[1], corAtual[2]);
  } else {
    fill(corAtual[0] * 0.15, corAtual[1] * 0.15, corAtual[2] * 0.15);
  }
  rect(x - esp / 2, y - esp / 2, esp, esp);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (key === 's') {
    saveCanvas('the-price-you-pay', 'png');
  }
}