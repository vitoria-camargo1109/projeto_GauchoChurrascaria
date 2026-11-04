/* ==========================================================================
   CARDAPIO.JS
   Transforma o cardápio (paginas/cardapio.html) em um livro: cada capítulo é
   uma folha e dá para virar as páginas com os botões, com as setas do
   teclado (← →) ou pelos links do sumário.

   - Carregue este arquivo no <head>, SEM "defer", para não piscar o conteúdo.
   - Sem JavaScript o cardápio continua completo: as folhas aparecem uma
     embaixo da outra e os links do sumário levam até cada uma.
   - O visual do livro e da animação está em css/cardapio_vinhos.css.
   ========================================================================== */

/* Avisa o CSS que o livro está ativo (só uma folha por vez) */
document.documentElement.classList.add("js-livro");

document.addEventListener("DOMContentLoaded", function () {
    const livro = document.getElementById("livro-cardapio");
    const controles = document.getElementById("controles-livro");

    if (!livro || !controles) {
        return;
    }

    const folhas = Array.from(livro.querySelectorAll(".folha"));
    const botaoAnterior = controles.querySelector('button[data-acao="anterior"]');
    const botaoSumario = controles.querySelector('button[data-acao="sumario"]');
    const botaoProximo = controles.querySelector('button[data-acao="proximo"]');
    const indicador = controles.querySelector(".livro-indicador");

    /* Respeita quem pediu "reduzir movimento" no sistema */
    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

    let atual = 0;

    /* Índice da folha a partir do id (#bebidas → 9). Devolve -1 se não existir */
    function indiceDoId(id) {
        return folhas.findIndex(function (folha) {
            return folha.id === id;
        });
    }

    /* Texto que avisa em qual página o leitor está */
    function textoDoIndicador() {
        if (atual === 0) {
            return "Sumário";
        }
        const titulo = folhas[atual].querySelector("h3").textContent;
        return titulo + " · página " + atual + " de " + (folhas.length - 1);
    }

    function atualizarControles() {
        botaoAnterior.disabled = atual === 0;
        botaoSumario.disabled = atual === 0;
        botaoProximo.disabled = atual === folhas.length - 1;
        indicador.textContent = textoDoIndicador();
    }

    /* Mostra a folha "novo", com a animação de virar a página */
    function irPara(novo) {
        if (novo < 0 || novo >= folhas.length || novo === atual) {
            return;
        }

        const direcao = novo > atual ? "virando-proxima" : "virando-anterior";

        folhas[atual].classList.remove("atual");
        atual = novo;

        const folha = folhas[atual];
        folha.classList.remove("virando-proxima", "virando-anterior");
        folha.classList.add("atual");

        if (!reduzirMovimento.matches) {
            folha.classList.add(direcao);
        }

        atualizarControles();

        /* Se o topo do livro saiu da tela, volta para ele */
        if (livro.getBoundingClientRect().top < 0) {
            livro.scrollIntoView({ behavior: reduzirMovimento.matches ? "auto" : "smooth", block: "start" });
        }
    }

    /* Tira a classe da animação quando ela termina */
    livro.addEventListener("animationend", function (evento) {
        evento.target.classList.remove("virando-proxima", "virando-anterior");
    });

    /* Botões anterior, sumário e próxima */
    controles.addEventListener("click", function (evento) {
        const botao = evento.target.closest("button[data-acao]");

        if (!botao) {
            return;
        }
        if (botao.dataset.acao === "anterior") {
            irPara(atual - 1);
        } else if (botao.dataset.acao === "proximo") {
            irPara(atual + 1);
        } else {
            irPara(0);
        }
    });

    /* Links do sumário (#capitulo): abrem a folha em vez de rolar a página */
    livro.addEventListener("click", function (evento) {
        const link = evento.target.closest('a[href^="#"]');

        if (!link) {
            return;
        }

        const destino = indiceDoId(link.getAttribute("href").slice(1));
        if (destino !== -1) {
            evento.preventDefault();
            irPara(destino);
        }
    });

    /* Setas do teclado (menos quando a pessoa está digitando em um campo) */
    document.addEventListener("keydown", function (evento) {
        const campo = evento.target.closest("input, textarea, select");

        if (campo || evento.altKey || evento.ctrlKey || evento.metaKey) {
            return;
        }
        if (evento.key === "ArrowRight") {
            irPara(atual + 1);
        }
        if (evento.key === "ArrowLeft") {
            irPara(atual - 1);
        }
    });

    /* Começa na folha pedida pelo endereço (cardapio.html#bebidas) ou no sumário */
    const inicial = indiceDoId(window.location.hash.slice(1));

    atual = inicial === -1 ? 0 : inicial;
    folhas[atual].classList.add("atual");
    controles.hidden = false;
    atualizarControles();
});