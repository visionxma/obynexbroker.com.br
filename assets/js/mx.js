/* mx.js — o comportamento comum a todo molde de clone das rotas da rede Safirion (31/10/2026).
   Sem dependência. O efeito PRÓPRIO da LP de origem vai no `molde.js` de cada molde; aqui só o que
   toda rota precisa:
     1. revelar ao entrar na tela (.mx-rev → .mx-vis), 60ms de escalonamento entre irmãos
     2. contador animado em [data-conta] dentro do molde
     3. FAQ: 5 à vista (6 em 2 colunas) + UM botão "ver mais (+N)", N por contagem; abrir uma fecha a outra
     4. âncora `#id` que só existe na home leva à home
   O conteúdo nunca depende deste arquivo para aparecer: `.mx-js` só entra no <html> aqui.
   O `molde.js` de cada molde roda ANTES deste (é embutido; este é `defer`): não conta com ele. */
(function () {
  'use strict';
  var raiz = document.documentElement;
  var corpo = document.body;
  var decSep = (corpo && corpo.getAttribute('data-dec')) || ',';
  var milSep = decSep === ',' ? '.' : ',';
  var menos = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  raiz.classList.add('mx-js');

  /* 1. revelar */
  var itens = document.querySelectorAll('.mx-raiz .mx-rev');
  if (!('IntersectionObserver' in window)) {
    for (var i = 0; i < itens.length; i++) itens[i].classList.add('mx-vis');
  } else {
    for (var j = 0; j < itens.length; j++) {
      var el = itens[j];
      var irmaos = el.parentElement ? el.parentElement.children : [el];
      el.style.setProperty('--mx-atraso', Math.min(Array.prototype.indexOf.call(irmaos, el), 7) * 60 + 'ms');
    }
    var olho = new IntersectionObserver(function (es) {
      for (var k = 0; k < es.length; k++) {
        if (!es[k].isIntersecting) continue;
        es[k].target.classList.add('mx-vis');
        olho.unobserve(es[k].target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    for (var m = 0; m < itens.length; m++) olho.observe(itens[m]);
  }

  /* 2. contador */
  function formatar(v, dec) {
    var s = dec ? v.toFixed(dec) : String(Math.round(v));
    var p = s.split('.');
    if (p[0].length > 4) p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, milSep);
    return p.length > 1 ? p[0] + decSep + p[1] : p[0];
  }
  var contadores = document.querySelectorAll('.mx-raiz [data-conta]');
  function contar(el) {
    var alvo = parseFloat(el.getAttribute('data-conta'));
    var dec = parseInt(el.getAttribute('data-dec-casas') || '0', 10);
    var pre = el.getAttribute('data-pre') || '';
    var pos = el.getAttribute('data-pos') || '';
    var final = el.textContent;
    if (menos || !isFinite(alvo)) return;
    var t0 = null, dur = 1100;
    function passo(t) {
      if (t0 === null) t0 = t;
      var f = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - f, 3);
      el.textContent = pre + formatar(alvo * e, dec) + pos;
      if (f < 1) requestAnimationFrame(passo); else el.textContent = final;
    }
    requestAnimationFrame(passo);
  }
  if ('IntersectionObserver' in window && contadores.length) {
    var olhoN = new IntersectionObserver(function (es) {
      for (var k = 0; k < es.length; k++) {
        if (!es[k].isIntersecting) continue;
        contar(es[k].target);
        olhoN.unobserve(es[k].target);
      }
    }, { threshold: 0.4 });
    for (var n = 0; n < contadores.length; n++) olhoN.observe(contadores[n]);
  }

  /* 3. FAQ — 5 à vista numa coluna, 6 quando a lista está em 2 ou 3 colunas (doutrina, seção 9);
     o número do botão é conta e se refaz no resize, porque a 6ª pergunta entra ou sai com as colunas */
  function colunasDa(lista) {
    var cs = getComputedStyle(lista);
    if (cs.display.indexOf('grid') < 0) return 1;
    var t = (cs.gridTemplateColumns || '').trim();
    return !t || t === 'none' ? 1 : t.split(/\s+/).length;
  }
  var listas = document.querySelectorAll('.mx-raiz [data-mx-faq-lista]');
  for (var a = 0; a < listas.length; a++) (function (lista) {
    var caixa = lista.parentElement;
    var botao = caixa ? caixa.querySelector('[data-mx-faq-mais]') : null;
    var perguntas = lista.querySelectorAll('[data-mx-faq-item]');
    if (botao) {
      var aberto = false;
      var base = parseInt(lista.getAttribute('data-mx-faq-visiveis') || '5', 10);
      var moldura = botao.parentElement && botao.parentElement !== caixa ? botao.parentElement : botao;
      var aplicar = function () {
        var visiveis = colunasDa(lista) > 1 ? 6 : base;
        var sobra = perguntas.length - visiveis;
        moldura.hidden = sobra <= 0;
        for (var q = 0; q < perguntas.length; q++) perguntas[q].hidden = !aberto && q >= visiveis;
        var nEl = botao.querySelector('[data-mx-faq-n]');
        if (nEl) nEl.textContent = String(Math.max(sobra, 0));
        // o rótulo pode estar num filho marcado (botão da origem com ícone ao lado do texto)
        var rotEl = botao.querySelector('[data-mx-faq-t]') || botao;
        if (rotEl.firstChild && rotEl.firstChild.nodeType === 3) {
          rotEl.firstChild.nodeValue = aberto ? botao.getAttribute('data-rotulo-menos') : botao.getAttribute('data-rotulo');
        }
        botao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      };
      botao.addEventListener('click', function () { aberto = !aberto; aplicar(); });
      var pedido = 0;
      window.addEventListener('resize', function () {
        if (pedido) return;
        pedido = requestAnimationFrame(function () { pedido = 0; aplicar(); });
      });
      aplicar();
    }
    // abrir uma fecha a outra (reserva para navegador sem <details name>)
    if (!('name' in document.createElement('details'))) {
      lista.addEventListener('toggle', function (ev) {
        var d = ev.target;
        if (!d.open) return;
        for (var q = 0; q < perguntas.length; q++) if (perguntas[q] !== d) perguntas[q].open = false;
      }, true);
    }
  })(listas[a]);

  /* 4. âncora da home que a rota não tem: o menu "App" do chassi (`app-menu.v1.js`, o mesmo da
     home) cria links para seções que só existem lá; o clique leva à seção na home (igual ao
     conteudo.js das guias antigas). O link nasce depois, por outro script: a troca é no clique. */
  document.addEventListener('click', function (ev) {
    var link = ev.target.closest && ev.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    if (id && !document.getElementById(id)) link.setAttribute('href', '/#' + id);
  }, true);

  /* 5. texto curto que não cabe encolhe a letra, nunca parte a palavra (01/11/2026; ampliado no mesmo
     dia). Em 360 px os cartões ficam lado a lado (doutrina, seção 1) e "supervisada", "rentabilidad"
     passavam de 101 px a 16 px: o `overflow-wrap: anywhere` partia a palavra a seco ("supervisad|a").
     A 320 o mesmo acontecia em título de cartão ("Computador", "Superfinanciera?"), em valor e rótulo
     de número ("THUNDER", "Encerramento") e em título de relacionado ("WELCOME100"). Aqui a maior
     palavra de cada texto curto (título, número, rótulo de número) se mede no próprio lugar e o GRUPO
     de irmãos desce junto para a mesma escala (títulos irmãos iguais), só o necessário, com piso de
     13 px. Grupo = o primeiro ancestral, até 5 níveis, com 2+ filhos iguais ao ramo que leva ao texto
     (os cartões da mesma grade); título solto fica sozinho. O `.kx-num-v` fica de fora: o molde.js do
     kesef-lp já o ajusta por `--kx-em`. Texto corrido não entra: abaixo de 360 ele hifeniza (CSS).
     Sem JS vale o `anywhere` do CSS. Refaz ao mudar a largura (ResizeObserver, nunca por quadro). */
  var curtos = document.querySelectorAll('.mx-raiz :is(h1, h2, h3, h4):not(.mx-b-cartao__titulo), .mx-raiz :is(.mx-b-cartao__titulo > span, .lp-num-v, .lp-num-t)');
  if (curtos.length && 'ResizeObserver' in window) {
    var assinatura = function (el) { return el.tagName + '.' + (String(el.className).split(' ')[0] || ''); };
    var listaDe = function (el) {
      var ramo = el;
      for (var i = 0; i < 5 && ramo.parentElement; i++) {
        var pai = ramo.parentElement, a = assinatura(ramo), iguais = 0;
        for (var c = 0; c < pai.children.length; c++) if (assinatura(pai.children[c]) === a) iguais++;
        if (iguais > 1) return pai;
        ramo = pai;
      }
      return el;
    };
    var grupos = [];
    for (var t = 0; t < curtos.length; t++) {
      var lista = listaDe(curtos[t]), sig = assinatura(curtos[t]), g = null;
      for (var q = 0; q < grupos.length; q++) if (grupos[q].lista === lista && grupos[q].sig === sig) g = grupos[q];
      if (!g) { g = { lista: lista, sig: sig, itens: [] }; grupos.push(g); }
      g.itens.push(curtos[t]);
    }
    var caber = function (g) {
      var escala = 1, s, bases = [];
      for (s = 0; s < g.itens.length; s++) g.itens[s].style.fontSize = '';
      for (s = 0; s < g.itens.length; s++) {
        var el = g.itens[s], cs = getComputedStyle(el);
        bases.push(parseFloat(cs.fontSize) || 16);
        var livre = el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
        if (livre <= 0) continue;
        var palavras = (el.textContent || '').split(/\s+/);
        var regua = document.createElement('span');
        regua.style.cssText = 'position:absolute;left:0;top:0;white-space:nowrap;visibility:hidden;pointer-events:none';
        el.appendChild(regua);
        for (var p = 0; p < palavras.length; p++) {
          if (!palavras[p]) continue;
          regua.textContent = palavras[p];
          var larg = regua.getBoundingClientRect().width;
          if (larg > livre) escala = Math.min(escala, livre / larg);
        }
        regua.remove();
      }
      if (escala >= 1) return;
      for (s = 0; s < g.itens.length; s++) {
        g.itens[s].style.fontSize = Math.max(13, Math.floor(bases[s] * escala * 0.98 * 10) / 10) + 'px';
      }
    };
    var ligarCurtos = function () {
      grupos.forEach(function (g) {
        var ultima = 0;
        new ResizeObserver(function (es) {
          var w = Math.round(es[0].contentRect.width);
          if (w === ultima) return;
          ultima = w;
          caber(g);
        }).observe(g.lista);
      });
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ligarCurtos);
    else ligarCurtos();
  }
})();
