/* ==========================================================================
   ANIMACOES.JS
   Faz os blocos da página inicial (index.html) aparecerem aos poucos
   quando entram na tela, ao rolar a página.

   - Carregue este arquivo no <head>, SEM "defer", para não piscar o conteúdo.
   - Sem JavaScript nada é escondido: a página aparece normalmente.
   - Para quem pediu "reduzir movimento" no sistema, os blocos só aparecem
     suavemente (fade), sem deslizar.
   - O visual da animação está em css/base.css, na seção 5.9.
   ========================================================================== */

const prefereSemMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window) {

    /* Avisa o CSS que as animações estão ativas */
    document.documentElement.classList.add("js-animacoes");

    /* Quem reduz movimento no sistema vê só o fade, sem deslocamento */
    if (prefereSemMovimento) {
        document.documentElement.classList.add("movimento-reduzido");
    }

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

        /* Rede de segurança: se a pessoa pular para o meio ou o fim da página
           (link de âncora, atualizar a página já rolada, rolagem muito rápida),
           os blocos que ficaram para trás também precisam aparecer. */
        let verificando = false;

        function revelarOsJaPassados() {
            verificando = false;
            blocos.forEach(function (bloco) {
                if (!bloco.classList.contains("visivel") &&
                    bloco.getBoundingClientRect().top < window.innerHeight) {
                    bloco.classList.add("visivel");
                    observador.unobserve(bloco);
                }
            });
        }

        window.addEventListener("scroll", function () {
            if (!verificando) {
                verificando = true;
                window.requestAnimationFrame(revelarOsJaPassados);
            }
        }, { passive: true });

        window.addEventListener("load", revelarOsJaPassados);
    });
}