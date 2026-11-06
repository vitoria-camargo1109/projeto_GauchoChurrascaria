/* ==========================================================================
   MENU.JS
   Menu hambúrguer para tablet e celular (até 1200px).

   - Carregue este arquivo no <head>, SEM "defer", para não piscar.
   - O botão ☰ é criado aqui, então o HTML não precisa de nenhum botão.
   - Sem JavaScript os links aparecem sempre, um embaixo do outro.
   - O visual está em css/header_footer.css, seção 6.
   ========================================================================== */

/* Avisa o CSS que o menu hambúrguer está ativo (é ele que esconde os links) */
document.documentElement.classList.add("js-menu");

document.addEventListener("DOMContentLoaded", function () {
    const menu = document.querySelector('nav[aria-label="Menu principal"]');
    const titulo = menu ? menu.querySelector("h1") : null;

    if (!menu || !titulo) {
        return;
    }

    /* Cria o botão logo depois do título do menu */
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "menu-botao";
    botao.setAttribute("aria-label", "Abrir menu");
    botao.setAttribute("aria-expanded", "false");
    botao.innerHTML = '<i class="bi bi-list" aria-hidden="true"></i>';
    titulo.after(botao);

    const icone = botao.querySelector("i");

    /* Abre ou fecha o menu e atualiza o ícone (☰ ou X) e o texto para leitores de tela */
    function definirAberto(aberto) {
        menu.classList.toggle("aberto", aberto);
        botao.setAttribute("aria-expanded", String(aberto));
        botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
        icone.className = aberto ? "bi bi-x-lg" : "bi bi-list";
    }

    botao.addEventListener("click", function () {
        definirAberto(!menu.classList.contains("aberto"));
    });

    /* Esc fecha o menu e devolve o foco para o botão */
    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape" && menu.classList.contains("aberto")) {
            definirAberto(false);
            botao.focus();
        }
    });

    /* Clicar fora do menu também fecha */
    document.addEventListener("click", function (evento) {
        if (!menu.contains(evento.target)) {
            definirAberto(false);
        }
    });

    /* Se a tela crescer (ex.: girar o tablet), fecha o menu */
    window.matchMedia("(min-width: 1201px)").addEventListener("change", function () {
        definirAberto(false);
    });
});