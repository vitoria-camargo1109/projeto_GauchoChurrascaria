/* ==========================================================================
   DEPOIMENTOS.JS
   Botões "anterior" e "próximo" do carrossel de depoimentos (index.html).

   Sem JavaScript o carrossel continua funcionando: dá para rolar com o dedo,
   o mouse ou o teclado. Os botões ficam escondidos (atributo "hidden") e só
   aparecem quando este script roda.
   ========================================================================== */

   const lista = document.getElementById("lista-depoimentos");
   const controles = document.getElementById("controles-depoimentos");
   
   if (lista && controles) {
       const botaoAnterior = controles.querySelector('button[data-direcao="-1"]');
       const botaoProximo = controles.querySelector('button[data-direcao="1"]');
   
       /* Respeita quem pediu "reduzir movimento" no sistema */
       const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
   
       /* Quanto rolar: a largura de um card + o espaço entre os cards */
       function larguraDoPasso() {
           const cartao = lista.querySelector("li");
           const espaco = parseFloat(getComputedStyle(lista).columnGap) || 0;
           return cartao.getBoundingClientRect().width + espaco;
       }
   
       /* Desativa o botão quando chega no começo ou no fim da fileira */
       function atualizarBotoes() {
           const fim = lista.scrollWidth - lista.clientWidth;
           botaoAnterior.disabled = lista.scrollLeft <= 1;
           botaoProximo.disabled = lista.scrollLeft >= fim - 1;
       }
   
       /* Evento de clique nos dois botões */
       controles.addEventListener("click", function (evento) {
           const botao = evento.target.closest("button[data-direcao]");
           if (!botao) {
               return;
           }
   
           lista.scrollBy({
               left: Number(botao.dataset.direcao) * larguraDoPasso(),
               behavior: reduzirMovimento.matches ? "auto" : "smooth"
           });
       });
   
       /* Destaca o card que está mais perto do centro da fileira */
       function atualizarDestaque() {
           const limites = lista.getBoundingClientRect();
           const centro = limites.left + limites.width / 2;
           let maisPerto = null;
           let menorDistancia = Infinity;
   
           lista.querySelectorAll("article").forEach(function (cartao) {
               const caixa = cartao.getBoundingClientRect();
               const distancia = Math.abs(caixa.left + caixa.width / 2 - centro);
   
               cartao.classList.remove("em-destaque");
               if (distancia < menorDistancia) {
                   menorDistancia = distancia;
                   maisPerto = cartao;
               }
           });
   
           if (maisPerto) {
               maisPerto.classList.add("em-destaque");
           }
       }
   
       function atualizarTudo() {
           atualizarBotoes();
           atualizarDestaque();
       }
   
       lista.addEventListener("scroll", atualizarTudo, { passive: true });
       window.addEventListener("resize", atualizarTudo);
   
       controles.hidden = false;
       atualizarTudo();
   }