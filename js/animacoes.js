/* ==========================================================================
   ANIMACOES.JS
   Faz os blocos da página inicial (index.html) aparecerem aos poucos
   quando entram na tela, ao rolar a página.

   - Carregue este arquivo no <head>, SEM "defer", para não piscar o conteúdo.
   - Sem JavaScript (ou para quem pediu "reduzir movimento" no sistema)
     nada é escondido: a página aparece normalmente.
   - O visual da animação está em css/base.css, na seção 5.9.
   ========================================================================== */

const prefereSemMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefereSemMovimento && "IntersectionObserver" in window) {

    /* Avisa o CSS que as animações estão ativas */
    document.documentElement.classList.add("js-animacoes");

    document.addEventListener("DOMContentLoaded", function () {
        const secoes = document.querySelectorAll(".pagina-inicial main > section");
        const blocos = [];

        secoes.forEach(function (secao) {
            Array.from(secao.children).forEach(function (filho) {
                /* A lista de atalhos entra item por item; os demais blocos entram inteiros */
                if (filho.matches('nav[aria-label="Atalhos"]')) {
                    filho.querySelectorAll("li").forEach(function (item, posicao) {
                        item.style.setProperty("--atraso", posicao * 0.12 + "s");
                        blocos.push(item);
                    });
                } else {
                    blocos.push(filho);
                }
            });
        });

        /* Quando um bloco aparece na tela, ganha a classe "visivel" (uma vez só) */
        const observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visivel");
                    observador.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

        blocos.forEach(function (bloco) {
            bloco.classList.add("revelar");
            observador.observe(bloco);
        });
    });
}