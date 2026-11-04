/* ===== popup de promocao Safirion — v2 =====
   Exibe uma vez por SESSAO: reaparece toda vez que o visitante entra de novo
   (aba nova ou navegador reaberto), mas nao repete enquanto ele navega pelo site.
   Dispara no que vier primeiro: 2s de permanencia ou 35% de rolagem.
   v2: copy da promocao RISKFREE10, CTA para o nosso /cadastro/ (preserva aff e
   rastreio do kv-track) e textos nos 4 idiomas do site. */
(function () {
  "use strict";
  var CADASTRO = "https://trade.safirion.com/pt/register?aff=836698&aff_model=revenue&afftrack=safirion.com.br/";
  var CHAVE = "safirion_promo_v3";
  var ATRASO = 2000, ROLAGEM = 0.35;

  /* idioma pelo <html lang>; cai no portugues se nao reconhecer */
  var TXT = {
    pt: {
      selo: "Promoção", fechar: "Fechar",
      tit: "Negociação sem risco de US$ 10",
      p1: 'Use o código promocional <strong>RISKFREE10</strong> ao depositar para obter uma negociação sem risco.',
      p2: "Se sua próxima negociação real de Opções resultar em perda, reembolsamos até US$ 10 do seu investimento.",
      nota: "A primeira negociação aberta após a ativação será considerada livre de risco.",
      btn: "Criar conta",
      mini: "Sujeito às condições da promoção. Operar produtos alavancados envolve risco de perda."
    },
    en: {
      selo: "Promotion", fechar: "Close",
      tit: "Risk-free trade of US$ 10",
      p1: 'Use promo code <strong>RISKFREE10</strong> when you deposit to get a risk-free trade.',
      p2: "If your next real Options trade results in a loss, we refund up to US$ 10 of your investment.",
      nota: "The first trade opened after activation is considered risk-free.",
      btn: "Create account",
      mini: "Subject to the promotion terms. Trading leveraged products involves risk of loss."
    },
    es: {
      selo: "Promoción", fechar: "Cerrar",
      tit: "Operación sin riesgo de US$ 10",
      p1: 'Usa el código promocional <strong>RISKFREE10</strong> al depositar para obtener una operación sin riesgo.',
      p2: "Si tu próxima operación real de Opciones resulta en pérdida, reembolsamos hasta US$ 10 de tu inversión.",
      nota: "La primera operación abierta tras la activación se considera libre de riesgo.",
      btn: "Crear cuenta",
      mini: "Sujeto a las condiciones de la promoción. Operar productos apalancados implica riesgo de pérdida."
    },
    fr: {
      selo: "Promotion", fechar: "Fermer",
      tit: "Transaction sans risque de 10 US$",
      p1: 'Utilisez le code promo <strong>RISKFREE10</strong> lors de votre dépôt pour obtenir une transaction sans risque.',
      p2: "Si votre prochaine transaction réelle d'Options se solde par une perte, nous remboursons jusqu'à 10 US$ de votre investissement.",
      nota: "La première transaction ouverte après l'activation est considérée sans risque.",
      btn: "Créer un compte",
      mini: "Soumis aux conditions de la promotion. Trader des produits à effet de levier comporte un risque de perte."
    }
  };
  var lang = (document.documentElement.lang || "pt").slice(0, 2).toLowerCase();
  /* as páginas montadas pelo .i18n/montar.js trazem o texto do próprio idioma */
  var T = window.safirionPromoTxt || TXT[lang] || TXT.pt;

  function guardado() {
    try { return sessionStorage.getItem(CHAVE) ? 1 : 0; } catch (e) { return 0; }
  }
  function guardar() {
    try { sessionStorage.setItem(CHAVE, "1"); } catch (e) {}
  }
  /* atalhos de teste: safirionPromo.abrir() / .limpar() / .estado() */
  window.safirionPromo = {
    abrir: function () { abrir(); },
    limpar: function () { try { sessionStorage.removeItem(CHAVE); } catch (e) {} return "liberado"; },
    estado: function () {
      return guardado() ? "ja apareceu nesta sessao" : "liberado";
    }
  };
  if (guardado()) return;

  var cx, alvoAnterior, aberto = false;

  function montar() {
    var el = document.createElement("div");
    el.className = "pp";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "ppTit");
    el.innerHTML =
      '<div class="pp__cx">' +
        '<button class="pp__x" type="button" aria-label="' + T.fechar + '">&#10005;</button>' +
        '<div class="pp__fig">' +
          '<span class="pp__selo">' + T.selo + '</span>' +
          '<img src="/assets/img/popup-promo.webp" alt="" width="760" height="1000" loading="lazy" decoding="async">' +
        '</div>' +
        '<div class="pp__cont">' +
          '<h2 id="ppTit">' + T.tit + '</h2>' +
          '<p>' + T.p1 + '</p>' +
          '<p>' + T.p2 + '</p>' +
          '<p class="pp__nota">' + T.nota + '</p>' +
          '<a class="pp__btn" href="' + CADASTRO + '">' + T.btn + ' <span aria-hidden="true">&rsaquo;</span></a>' +
          '<p class="pp__mini">' + T.mini + '</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function abrir() {
    if (aberto) return;
    aberto = true;
    alvoAnterior = document.activeElement;
    cx = montar();
    cx.setAttribute("data-aberto", "");
    document.body.classList.add("pp-travado");
    requestAnimationFrame(function () { cx.setAttribute("data-visivel", ""); });
    cx.querySelector(".pp__x").focus();

    cx.querySelector(".pp__x").addEventListener("click", function () { fechar(); });
    cx.querySelector(".pp__btn").addEventListener("click", function () { guardar(); });
    cx.addEventListener("click", function (e) { if (e.target === cx) fechar(); });
    document.addEventListener("keydown", tecla);
  }

  function tecla(e) {
    if (!aberto) return;
    if (e.key === "Escape") { fechar(); return; }
    if (e.key !== "Tab") return;
    var f = cx.querySelectorAll("button, a[href]");
    var pri = f[0], ult = f[f.length - 1];
    if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
    else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
  }

  function fechar() {
    if (!aberto) return;
    aberto = false;
    guardar();
    document.removeEventListener("keydown", tecla);
    cx.removeAttribute("data-visivel");
    document.body.classList.remove("pp-travado");
    setTimeout(function () { if (cx && cx.parentNode) cx.parentNode.removeChild(cx); }, 320);
    if (alvoAnterior && alvoAnterior.focus) alvoAnterior.focus();
  }

  var t = setTimeout(disparar, ATRASO);
  function aoRolar() {
    var h = document.documentElement;
    var lido = (h.scrollTop || document.body.scrollTop) / ((h.scrollHeight - h.clientHeight) || 1);
    if (lido >= ROLAGEM) disparar();
  }
  function disparar() {
    clearTimeout(t);
    window.removeEventListener("scroll", aoRolar);
    abrir();
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
})();
