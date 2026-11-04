/* Efeitos das 57 páginas de SEO da rede Safirion. Sem dependência.
   Animação e efeito são entrega, não enfeite (doutrina, seção 2):
     1. revelar ao entrar na tela, escalonado em 60ms por irmão
     2. contador animado em todo número que prova algo
     3. "ver mais perguntas (+N)" com UM controle e N por CONTAGEM
     4. abrir uma pergunta fecha a outra (reserva para quem não tem <details name>)

   O conteúdo nunca depende deste arquivo para aparecer: a classe `.pg-js` só
   entra no <html> aqui, e sem ela o CSS não esconde nada.

   Separador decimal: vem de `data-dec` no <body> — "," no Brasil, "." no Peru
   (S/ 1,234.56). Nunca escrito à mão no HTML de cada página. */

(function () {
  'use strict';

  var raiz = document.documentElement;
  var corpo = document.body;
  var decSep = (corpo && corpo.getAttribute('data-dec')) || ',';
  var milSep = decSep === ',' ? '.' : ',';
  var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  raiz.classList.add('pg-js');

  /* ---- 1. revelar ao entrar na tela ------------------------------------ */

  var itens = document.querySelectorAll('.pg-rev');

  if (!('IntersectionObserver' in window)) {
    for (var i = 0; i < itens.length; i++) itens[i].classList.add('pg-vis');
  } else {
    // escalonamento por posição dentro do pai: irmãos entram em sequência
    for (var j = 0; j < itens.length; j++) {
      var el = itens[j];
      var irmaos = el.parentElement ? el.parentElement.children : [el];
      var pos = Array.prototype.indexOf.call(irmaos, el);
      el.style.setProperty('--pg-atraso', Math.min(pos, 7) * 60 + 'ms');
    }
    var olho = new IntersectionObserver(function (entradas) {
      for (var k = 0; k < entradas.length; k++) {
        if (!entradas[k].isIntersecting) continue;
        entradas[k].target.classList.add('pg-vis');
        olho.unobserve(entradas[k].target);
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    for (var m = 0; m < itens.length; m++) olho.observe(itens[m]);
  }

  /* ---- 2. contador animado -------------------------------------------- */

  function formatar(v, dec) {
    var s = dec ? v.toFixed(dec) : String(Math.round(v));
    var partes = s.split('.');
    // milhar só a partir de 5 dígitos: "2026" não leva separador, "12.500" leva
    if (partes[0].length > 4) {
      partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, milSep);
    }
    return partes.length > 1 ? partes[0] + decSep + partes[1] : partes[0];
  }

  var contadores = document.querySelectorAll('[data-conta]');

  function rodar(el) {
    var alvo = parseFloat(el.getAttribute('data-conta'));
    if (isNaN(alvo)) return;
    var dec = parseInt(el.getAttribute('data-dec-casas') || '0', 10);
    var pre = el.getAttribute('data-pre') || '';
    var pos = el.getAttribute('data-pos') || '';
    if (menosMovimento) {
      el.textContent = pre + formatar(alvo, dec) + pos;
      return;
    }
    var inicio = null;
    var dur = 1100;
    function quadro(agora) {
      if (inicio === null) inicio = agora;
      var t = Math.min((agora - inicio) / dur, 1);
      var f = 1 - Math.pow(1 - t, 3);            // easeOutCubic
      el.textContent = pre + formatar(alvo * f, dec) + pos;
      if (t < 1) requestAnimationFrame(quadro);
      else el.textContent = pre + formatar(alvo, dec) + pos;
    }
    requestAnimationFrame(quadro);
  }

  if (!('IntersectionObserver' in window)) {
    for (var n = 0; n < contadores.length; n++) rodar(contadores[n]);
  } else {
    var olhoNum = new IntersectionObserver(function (entradas) {
      for (var p = 0; p < entradas.length; p++) {
        if (!entradas[p].isIntersecting) continue;
        rodar(entradas[p].target);
        olhoNum.unobserve(entradas[p].target);
      }
    }, { threshold: 0.5 });
    for (var q = 0; q < contadores.length; q++) olhoNum.observe(contadores[q]);
  }

  /* ---- 3. "ver mais perguntas (+N)" ----------------------------------
     Um controle só, centralizado, e o N sai de contagem: escrito à mão ele
     desatualiza, e a sexta pergunta entra ou sai do grupo conforme o número
     de colunas (doutrina, seção 9). */

  var lista = document.querySelector('[data-faq-lista]');
  var botao = document.querySelector('[data-faq-mais]');

  if (lista && botao) {
    var perguntas = lista.querySelectorAll('.pg-faq__item');
    var alvoN = botao.querySelector('[data-faq-n]');
    var aberto = false;

    function colunas() {
      var g = window.getComputedStyle(lista).gridTemplateColumns;
      if (!g || g === 'none') return 1;
      var cols = g.split(' ').filter(function (x) { return x && x !== '0px'; });
      return cols.length || 1;
    }

    function aplicar() {
      var aVista = colunas() > 1 ? 6 : 5;
      for (var r = 0; r < perguntas.length; r++) {
        if (aberto || r < aVista) perguntas[r].removeAttribute('hidden');
        else {
          perguntas[r].setAttribute('hidden', '');
          perguntas[r].removeAttribute('open');
        }
      }
      var escondidas = Math.max(perguntas.length - aVista, 0);
      if (alvoN) alvoN.textContent = String(escondidas);
      if (botao.firstChild && botao.firstChild.nodeType === 3) {
        botao.firstChild.nodeValue = aberto ? 'Ver menos perguntas (−' : (botao.getAttribute('data-rotulo') || 'Ver mais perguntas (+');
      }
      botao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      botao.hidden = escondidas === 0;
    }

    botao.addEventListener('click', function () { aberto = !aberto; aplicar(); });

    var espera;
    window.addEventListener('resize', function () {
      clearTimeout(espera);
      espera = setTimeout(aplicar, 120);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(aplicar);
    aplicar();
  }

  /* ---- 4b. dobra de bloco longo no celular ----------------------------
     "Lista longa no celular: mostre 4 itens e um ver mais" (skill
     responsivo-de-cara) e "nenhuma seção com mais de 2,5 telas de altura no
     celular". Em página de texto longo quem estoura é UM bloco de muitos itens
     dentro da seção, então a dobra é escolhida por MEDIDA: só entra na seção
     que passa de 2,2 telas, e no bloco mais alto dela, um por vez, até caber.
     Do tablet para cima (acima de 600px) nada fica escondido. */

  var LARG_DOBRA = 600;
  var TETO_TELAS = 2.2;        // folga contra o teto de 2,5
  // Escada de aperto, em pares [itens à vista, mínimo a esconder]: começa em 4
  // à vista (o número da skill) e só desce quando a seção CONTINUA estourando
  // com tudo dobrado. Medido em 29/10/2026: "As alíquotas do ganho de capital"
  // tem tabela de 4 linhas (nada a esconder com 4 à vista) + texto + 6 cartões,
  // e com um bloco só dobrado ficava em 2,52 telas — 0,02 acima do teto.
  //
  // Esconder UM item só não paga um botão, então o piso normal é 2. O último
  // degrau abre essa exceção porque existe seção em que nenhum bloco tem mais
  // de 3 itens: "Dez operações por dia, um mês" (spread) tem 3 passos e uma
  // tabela de 3 linhas, que no celular viram 3 cartões altos — 2,61 telas, e
  // nada dobrável pelo piso de 2. Um item escondido ali vale o botão.
  var ESCADA = [[4, 2], [3, 2], [2, 2], [2, 1]];
  var CANDIDATOS = '.pg-lista, .pg-cartoes, .pg-naoe, .pg-ficha, .pg-numeros,' +
                   ' .pg-passos, .pg-tabela tbody';

  var emEspanhol = (raiz.getAttribute('lang') || '').toLowerCase().indexOf('es') === 0;
  var rotMais = (corpo && corpo.getAttribute('data-mais')) ||
                (emEspanhol ? 'Ver más (+' : 'Ver mais (+');
  var rotMenos = (corpo && corpo.getAttribute('data-menos')) ||
                 (emEspanhol ? 'Ver menos (−' : 'Ver menos (−');

  var dobras = [];
  var seqDobra = 0;

  function telasDe(el) { return el.offsetHeight / (window.innerHeight || 1); }

  function pintarDobra(cx) {
    var estreito = window.innerWidth <= LARG_DOBRA;
    for (var i = 0; i < cx.itens.length; i++) {
      var it = cx.itens[i];
      if (estreito && !cx.aberto && i >= cx.aVista) {
        it.setAttribute('hidden', '');
      } else if (it.hasAttribute('hidden')) {
        it.removeAttribute('hidden');
        // o item saiu de display:none agora: a classe de revelar só anima no
        // quadro seguinte, e sem ela o item ficaria em opacity 0 até rolar
        if (it.classList.contains('pg-rev') && !it.classList.contains('pg-vis')) {
          (function (alvo) {
            requestAnimationFrame(function () { alvo.classList.add('pg-vis'); });
          })(it);
        }
      }
    }
    var n = Math.max(cx.itens.length - cx.aVista, 0);
    cx.botao.textContent = (cx.aberto ? rotMenos : rotMais) + n + ')';
    cx.botao.setAttribute('aria-expanded', cx.aberto ? 'true' : 'false');
    cx.caixaBotao.hidden = !estreito;
  }

  function criarDobra(caixa, sec, aVista, minEsconder) {
    var itens = [];
    for (var i = 0; i < caixa.children.length; i++) itens.push(caixa.children[i]);
    if (itens.length - aVista < minEsconder) return null;

    if (!caixa.id) caixa.id = 'pg-dobra-' + (++seqDobra);
    caixa.classList.add('pg-dobra');

    var cx = { caixa: caixa, sec: sec, aVista: aVista, itens: itens,
               aberto: false, botao: null, caixaBotao: null };

    cx.caixaBotao = document.createElement('div');
    cx.caixaBotao.className = 'pg-mais pg-mais--bloco';
    cx.botao = document.createElement('button');
    cx.botao.type = 'button';
    cx.botao.className = 'pg-botao pg-botao--vazio';
    cx.botao.setAttribute('aria-controls', caixa.id);
    cx.caixaBotao.appendChild(cx.botao);

    // o botão de uma tabela vai FORA da caixa da tabela: `tbody` não aceita
    // irmão que não seja linha
    var ancora = caixa.tagName === 'TBODY'
      ? (caixa.closest('.pg-tabela-box') || caixa.parentNode)
      : caixa;
    if (!ancora.parentNode) return null;
    ancora.parentNode.insertBefore(cx.caixaBotao, ancora.nextSibling);

    cx.botao.addEventListener('click', function () {
      cx.aberto = !cx.aberto;
      pintarDobra(cx);
    });

    dobras.push(cx);
    return cx;
  }

  function dobrarSecao(sec) {
    for (var p = 0; p < ESCADA.length; p++) {
      var aVista = ESCADA[p][0];
      var minEsconder = ESCADA[p][1];

      // 1º aperta o que já está dobrado nesta seção, do bloco mais alto
      var jaDobradas = [];
      for (var d = 0; d < dobras.length; d++) {
        if (dobras[d].sec === sec && dobras[d].aVista > aVista &&
            dobras[d].itens.length - aVista >= minEsconder) jaDobradas.push(dobras[d]);
      }
      jaDobradas.sort(function (a, b) { return b.caixa.offsetHeight - a.caixa.offsetHeight; });
      for (var e = 0; e < jaDobradas.length; e++) {
        jaDobradas[e].aVista = aVista;
        pintarDobra(jaDobradas[e]);
        if (telasDe(sec) <= TETO_TELAS) return;
      }

      // 2º dobra bloco novo neste nível, sempre o mais alto primeiro
      var novos = [];
      var brutos = sec.querySelectorAll(CANDIDATOS);
      for (var j = 0; j < brutos.length; j++) {
        if (brutos[j].classList.contains('pg-dobra')) continue;
        if (brutos[j].children.length - aVista < minEsconder) continue;
        novos.push(brutos[j]);
      }
      novos.sort(function (a, b) { return b.offsetHeight - a.offsetHeight; });
      for (var k = 0; k < novos.length; k++) {
        var cx = criarDobra(novos[k], sec, aVista, minEsconder);
        if (cx) pintarDobra(cx);
        if (telasDe(sec) <= TETO_TELAS) return;
      }
    }
  }

  function dobrarSecoes() {
    if (window.innerWidth > LARG_DOBRA) return;
    var secoes = document.querySelectorAll('.pg-corpo .pg-sec');
    for (var i = 0; i < secoes.length; i++) {
      if (telasDe(secoes[i]) > TETO_TELAS) dobrarSecao(secoes[i]);
    }
  }

  function reverDobras() {
    for (var i = 0; i < dobras.length; i++) pintarDobra(dobras[i]);
    var algumAberta = false;
    for (var j = 0; j < dobras.length; j++) if (dobras[j].aberto) algumAberta = true;
    // seção aberta pela pessoa estoura de propósito: não se dobra outro bloco
    if (!algumAberta) dobrarSecoes();
  }

  var esperaDobra;
  window.addEventListener('resize', function () {
    clearTimeout(esperaDobra);
    esperaDobra = setTimeout(reverDobras, 150);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reverDobras);
  dobrarSecoes();

  /* ---- 4. abrir uma pergunta fecha a outra ---------------------------- */

  // Reserva para navegador sem `<details name>` (Safari antigo): o atributo
  // existe no HTML; aqui só se cobre quem o ignora.
  var teste = document.createElement('details');
  var temNome = 'name' in teste;
  if (!temNome) {
    var todas = document.querySelectorAll('.pg-faq__item[name]');
    for (var s = 0; s < todas.length; s++) {
      todas[s].addEventListener('toggle', function (ev) {
        if (!ev.target.open) return;
        var grupo = ev.target.getAttribute('name');
        for (var t = 0; t < todas.length; t++) {
          if (todas[t] !== ev.target && todas[t].getAttribute('name') === grupo) {
            todas[t].removeAttribute('open');
          }
        }
      });
    }
  }
})();
