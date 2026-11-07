(function() {
  "use strict";
  var raiz = document.documentElement;
  var corpo = document.body;
  var decSep = corpo && corpo.getAttribute("data-dec") || ",";
  var milSep = decSep === "," ? "." : ",";
  var menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  raiz.classList.add("pg-js");
  var itens = document.querySelectorAll(".pg-rev");
  if (!("IntersectionObserver" in window)) {
    for (var i = 0; i < itens.length; i++) itens[i].classList.add("pg-vis");
  } else {
    for (var j = 0; j < itens.length; j++) {
      var el = itens[j];
      var irmaos = el.parentElement ? el.parentElement.children : [el];
      var pos = Array.prototype.indexOf.call(irmaos, el);
      el.style.setProperty("--pg-atraso", Math.min(pos, 7) * 60 + "ms");
    }
    var olho = new IntersectionObserver(function(entradas) {
      for (var k = 0; k < entradas.length; k++) {
        if (!entradas[k].isIntersecting) continue;
        entradas[k].target.classList.add("pg-vis");
        olho.unobserve(entradas[k].target);
      }
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    for (var m = 0; m < itens.length; m++) olho.observe(itens[m]);
  }
  function formatar(v, dec) {
    var s2 = dec ? v.toFixed(dec) : String(Math.round(v));
    var partes = s2.split(".");
    if (partes[0].length > 4) {
      partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, milSep);
    }
    return partes.length > 1 ? partes[0] + decSep + partes[1] : partes[0];
  }
  var contadores = document.querySelectorAll("[data-conta]");
  function rodar(el2) {
    var alvo = parseFloat(el2.getAttribute("data-conta"));
    if (isNaN(alvo)) return;
    var dec = parseInt(el2.getAttribute("data-dec-casas") || "0", 10);
    var pre = el2.getAttribute("data-pre") || "";
    var pos2 = el2.getAttribute("data-pos") || "";
    if (menosMovimento) {
      el2.textContent = pre + formatar(alvo, dec) + pos2;
      return;
    }
    var inicio = null;
    var dur = 1100;
    function quadro(agora) {
      if (inicio === null) inicio = agora;
      var t = Math.min((agora - inicio) / dur, 1);
      var f = 1 - Math.pow(1 - t, 3);
      el2.textContent = pre + formatar(alvo * f, dec) + pos2;
      if (t < 1) requestAnimationFrame(quadro);
      else el2.textContent = pre + formatar(alvo, dec) + pos2;
    }
    requestAnimationFrame(quadro);
  }
  if (!("IntersectionObserver" in window)) {
    for (var n = 0; n < contadores.length; n++) rodar(contadores[n]);
  } else {
    var olhoNum = new IntersectionObserver(function(entradas) {
      for (var p = 0; p < entradas.length; p++) {
        if (!entradas[p].isIntersecting) continue;
        rodar(entradas[p].target);
        olhoNum.unobserve(entradas[p].target);
      }
    }, { threshold: 0.5 });
    for (var q = 0; q < contadores.length; q++) olhoNum.observe(contadores[q]);
  }
  var lista = document.querySelector("[data-faq-lista]");
  var botao = document.querySelector("[data-faq-mais]");
  if (lista && botao) {
    let colunas = function() {
      var g = window.getComputedStyle(lista).gridTemplateColumns;
      if (!g || g === "none") return 1;
      var cols = g.split(" ").filter(function(x) {
        return x && x !== "0px";
      });
      return cols.length || 1;
    }, aplicar = function() {
      var aVista = colunas() > 1 ? 6 : 5;
      for (var r = 0; r < perguntas.length; r++) {
        if (aberto || r < aVista) perguntas[r].removeAttribute("hidden");
        else {
          perguntas[r].setAttribute("hidden", "");
          perguntas[r].removeAttribute("open");
        }
      }
      var escondidas = Math.max(perguntas.length - aVista, 0);
      if (alvoN) alvoN.textContent = String(escondidas);
      if (botao.firstChild && botao.firstChild.nodeType === 3) {
        botao.firstChild.nodeValue = aberto ? "Ver menos perguntas (−" : botao.getAttribute("data-rotulo") || "Ver mais perguntas (+";
      }
      botao.setAttribute("aria-expanded", aberto ? "true" : "false");
      botao.hidden = escondidas === 0;
    };
    var perguntas = lista.querySelectorAll(".pg-faq__item");
    var alvoN = botao.querySelector("[data-faq-n]");
    var aberto = false;
    botao.addEventListener("click", function() {
      aberto = !aberto;
      aplicar();
    });
    var espera;
    window.addEventListener("resize", function() {
      clearTimeout(espera);
      espera = setTimeout(aplicar, 120);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(aplicar);
    aplicar();
  }
  var LARG_DOBRA = 600;
  var TETO_TELAS = 2.2;
  var ESCADA = [[4, 2], [3, 2], [2, 2], [2, 1]];
  var CANDIDATOS = ".pg-lista, .pg-cartoes, .pg-naoe, .pg-ficha, .pg-numeros, .pg-passos, .pg-tabela tbody";
  var emEspanhol = (raiz.getAttribute("lang") || "").toLowerCase().indexOf("es") === 0;
  var rotMais = corpo && corpo.getAttribute("data-mais") || (emEspanhol ? "Ver más (+" : "Ver mais (+");
  var rotMenos = corpo && corpo.getAttribute("data-menos") || (emEspanhol ? "Ver menos (−" : "Ver menos (−");
  var dobras = [];
  var seqDobra = 0;
  function telasDe(el2) {
    return el2.offsetHeight / (window.innerHeight || 1);
  }
  function pintarDobra(cx) {
    var estreito = window.innerWidth <= LARG_DOBRA;
    for (var i2 = 0; i2 < cx.itens.length; i2++) {
      var it = cx.itens[i2];
      if (estreito && !cx.aberto && i2 >= cx.aVista) {
        it.setAttribute("hidden", "");
      } else if (it.hasAttribute("hidden")) {
        it.removeAttribute("hidden");
        if (it.classList.contains("pg-rev") && !it.classList.contains("pg-vis")) {
          (function(alvo) {
            requestAnimationFrame(function() {
              alvo.classList.add("pg-vis");
            });
          })(it);
        }
      }
    }
    var n2 = Math.max(cx.itens.length - cx.aVista, 0);
    cx.botao.textContent = (cx.aberto ? rotMenos : rotMais) + n2 + ")";
    cx.botao.setAttribute("aria-expanded", cx.aberto ? "true" : "false");
    cx.caixaBotao.hidden = !estreito;
  }
  function criarDobra(caixa, sec, aVista, minEsconder) {
    var itens2 = [];
    for (var i2 = 0; i2 < caixa.children.length; i2++) itens2.push(caixa.children[i2]);
    if (itens2.length - aVista < minEsconder) return null;
    if (!caixa.id) caixa.id = "pg-dobra-" + ++seqDobra;
    caixa.classList.add("pg-dobra");
    var cx = {
      caixa,
      sec,
      aVista,
      itens: itens2,
      aberto: false,
      botao: null,
      caixaBotao: null
    };
    cx.caixaBotao = document.createElement("div");
    cx.caixaBotao.className = "pg-mais pg-mais--bloco";
    cx.botao = document.createElement("button");
    cx.botao.type = "button";
    cx.botao.className = "pg-botao pg-botao--vazio";
    cx.botao.setAttribute("aria-controls", caixa.id);
    cx.caixaBotao.appendChild(cx.botao);
    var ancora = caixa.tagName === "TBODY" ? caixa.closest(".pg-tabela-box") || caixa.parentNode : caixa;
    if (!ancora.parentNode) return null;
    ancora.parentNode.insertBefore(cx.caixaBotao, ancora.nextSibling);
    cx.botao.addEventListener("click", function() {
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
      var jaDobradas = [];
      for (var d2 = 0; d2 < dobras.length; d2++) {
        if (dobras[d2].sec === sec && dobras[d2].aVista > aVista && dobras[d2].itens.length - aVista >= minEsconder) jaDobradas.push(dobras[d2]);
      }
      jaDobradas.sort(function(a2, b) {
        return b.caixa.offsetHeight - a2.caixa.offsetHeight;
      });
      for (var e = 0; e < jaDobradas.length; e++) {
        jaDobradas[e].aVista = aVista;
        pintarDobra(jaDobradas[e]);
        if (telasDe(sec) <= TETO_TELAS) return;
      }
      var novos = [];
      var brutos = sec.querySelectorAll(CANDIDATOS);
      for (var j2 = 0; j2 < brutos.length; j2++) {
        if (brutos[j2].classList.contains("pg-dobra")) continue;
        if (brutos[j2].children.length - aVista < minEsconder) continue;
        novos.push(brutos[j2]);
      }
      novos.sort(function(a2, b) {
        return b.offsetHeight - a2.offsetHeight;
      });
      for (var k = 0; k < novos.length; k++) {
        var cx = criarDobra(novos[k], sec, aVista, minEsconder);
        if (cx) pintarDobra(cx);
        if (telasDe(sec) <= TETO_TELAS) return;
      }
    }
  }
  function dobrarSecoes() {
    if (window.innerWidth > LARG_DOBRA) return;
    var secoes = document.querySelectorAll(".pg-corpo .pg-sec");
    for (var i2 = 0; i2 < secoes.length; i2++) {
      if (telasDe(secoes[i2]) > TETO_TELAS) dobrarSecao(secoes[i2]);
    }
  }
  function reverDobras() {
    for (var i2 = 0; i2 < dobras.length; i2++) pintarDobra(dobras[i2]);
    var algumAberta = false;
    for (var j2 = 0; j2 < dobras.length; j2++) if (dobras[j2].aberto) algumAberta = true;
    if (!algumAberta) dobrarSecoes();
  }
  var esperaDobra;
  window.addEventListener("resize", function() {
    clearTimeout(esperaDobra);
    esperaDobra = setTimeout(reverDobras, 150);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reverDobras);
  dobrarSecoes();
  var caixaIndice = document.querySelector("[data-pg-indice]");
  var LARG_COLUNA = 1280;
  if (caixaIndice) {
    var colunaLarga = function() {
      return window.innerWidth >= LARG_COLUNA;
    };
    var acertarCaixa = function() {
      if (colunaLarga()) caixaIndice.setAttribute("open", "");
    };
    if (!colunaLarga()) caixaIndice.removeAttribute("open");
    var tituloIndice = caixaIndice.querySelector("summary");
    if (tituloIndice) {
      tituloIndice.addEventListener("click", function(ev) {
        if (colunaLarga()) ev.preventDefault();
      });
    }
    var linksIndice = caixaIndice.querySelectorAll("a[data-pg-alvo]");
    var alvosIndice = [];
    for (var a = 0; a < linksIndice.length; a++) {
      var alvoSec = document.getElementById(linksIndice[a].getAttribute("data-pg-alvo"));
      if (alvoSec) alvosIndice.push({ link: linksIndice[a], sec: alvoSec });
      linksIndice[a].addEventListener("click", function() {
        if (!colunaLarga()) caixaIndice.removeAttribute("open");
      });
    }
    var acesoAtual = null;
    var acender = function() {
      var meio = (window.innerHeight || 1) / 2;
      var escolhido = null;
      for (var b = 0; b < alvosIndice.length; b++) {
        if (alvosIndice[b].sec.getBoundingClientRect().top <= meio) escolhido = alvosIndice[b];
        else break;
      }
      if (escolhido === acesoAtual) return;
      if (acesoAtual) acesoAtual.link.removeAttribute("aria-current");
      acesoAtual = escolhido;
      if (!escolhido) return;
      escolhido.link.setAttribute("aria-current", "true");
      var caixaRola = document.getElementById("pg-indice");
      if (caixaRola && caixaRola.scrollHeight > caixaRola.clientHeight) {
        var topoLink = escolhido.link.offsetTop;
        var alturaLink = escolhido.link.offsetHeight;
        if (topoLink < caixaRola.scrollTop) caixaRola.scrollTop = topoLink - 8;
        else if (topoLink + alturaLink > caixaRola.scrollTop + caixaRola.clientHeight) {
          caixaRola.scrollTop = topoLink + alturaLink - caixaRola.clientHeight + 8;
        }
      }
    };
    if ("IntersectionObserver" in window && alvosIndice.length) {
      var olhoIndice = new IntersectionObserver(acender, { rootMargin: "-50% 0px -49% 0px" });
      var vigiados = [];
      for (var c = 0; c < alvosIndice.length; c++) {
        var pai = alvosIndice[c].sec.parentElement;
        var irmaos = pai ? pai.children : [alvosIndice[c].sec];
        for (var d = 0; d < irmaos.length; d++) {
          if (vigiados.indexOf(irmaos[d]) < 0) {
            vigiados.push(irmaos[d]);
            olhoIndice.observe(irmaos[d]);
          }
        }
      }
    }
    var esperaIndice;
    window.addEventListener("resize", function() {
      clearTimeout(esperaIndice);
      esperaIndice = setTimeout(function() {
        acertarCaixa();
        acender();
      }, 150);
    });
    acender();
  }
  var teste = document.createElement("details");
  var temNome = "name" in teste;
  if (!temNome) {
    var todas = document.querySelectorAll(".pg-faq__item[name]");
    for (var s = 0; s < todas.length; s++) {
      todas[s].addEventListener("toggle", function(ev) {
        if (!ev.target.open) return;
        var grupo = ev.target.getAttribute("name");
        for (var t = 0; t < todas.length; t++) {
          if (todas[t] !== ev.target && todas[t].getAttribute("name") === grupo) {
            todas[t].removeAttribute("open");
          }
        }
      });
    }
  }
  document.addEventListener("click", function(ev) {
    var a2 = ev.target.closest && ev.target.closest('a[href^="#"]');
    if (!a2) return;
    var id = a2.getAttribute("href").slice(1);
    if (id && !document.getElementById(id)) a2.setAttribute("href", "/#" + id);
  }, true);
})();
