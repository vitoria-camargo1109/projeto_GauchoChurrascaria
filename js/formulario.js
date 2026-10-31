/* ==========================================================================
   FORMULARIO.JS
   Deixa os formulários mais práticos, sem depender dele para funcionar:
   sem JavaScript os campos nativos do HTML continuam valendo.

   1. Telefone: máscara automática, (11) 91234-5678 ou (11) 1234-5678
      (para usar em outro campo: <input type="tel" data-mascara="telefone">)
   2. Reserva: a data pode ser digitada (dd/mm/aaaa, com as barras automáticas)
      ou escolhida em um calendário do próprio site, para qualquer dia a partir
      de hoje; o horário vira uma lista; a quantidade de pessoas ganha botões − e +
   3. Mensagens de erro em português

   O visual do calendário e do contador está em css/base.css, seção 4.11.
   ========================================================================== */

/* Configurações da reserva */
const PRIMEIRO_HORARIO = 11 * 60;   /* 11:00, em minutos */
const ULTIMO_HORARIO = 22 * 60 + 30;/* 22:30, em minutos (o restaurante fecha às 23h) */
const INTERVALO = 30;               /* minutos entre um horário e outro */
const MAXIMO_PESSOAS = 20;

const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];   /* cabeçalho do calendário (começa no domingo) */
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
               "agosto", "setembro", "outubro", "novembro", "dezembro"];


/* ---------- Funções de apoio ---------- */

function doisDigitos(numero) {
    return String(numero).padStart(2, "0");
}

/* Data no formato AAAA-MM-DD, no horário do computador (não em UTC) */
function formatarData(data) {
    return data.getFullYear() + "-" + doisDigitos(data.getMonth() + 1) + "-" + doisDigitos(data.getDate());
}

/* Data como o usuário digita: dd/mm/aaaa */
function formatarDataBR(data) {
    return doisDigitos(data.getDate()) + "/" + doisDigitos(data.getMonth() + 1) + "/" + data.getFullYear();
}

/* Texto "dd/mm/aaaa" → Date. Devolve null se estiver incompleto ou se o dia não existir (ex.: 31/02) */
function lerData(texto) {
    const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
    if (!partes) {
        return null;
    }
    const data = new Date(Number(partes[3]), Number(partes[2]) - 1, Number(partes[1]));
    const confere = data.getDate() === Number(partes[1]) && data.getMonth() === Number(partes[2]) - 1;
    return confere ? data : null;
}

/* Hoje, sem horário (meia-noite) */
function hoje() {
    const agora = new Date();
    return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

/* Hoje já não tem horários livres (depois do último horário da reserva)? */
function hojeAcabou() {
    const agora = new Date();
    return agora.getHours() * 60 + agora.getMinutes() >= ULTIMO_HORARIO;
}

/* Dia que não pode ser escolhido: já passou, ou é hoje e não há mais horários */
function diaBloqueado(dia) {
    const inicio = hoje();
    return dia < inicio || (dia.getTime() === inicio.getTime() && hojeAcabou());
}

/* Minutos desde meia-noite → "HH:MM" */
function formatarHorario(minutos) {
    return doisDigitos(Math.floor(minutos / 60)) + ":" + doisDigitos(minutos % 60);
}

/* Cria uma lista de escolha (<select>) no lugar do campo nativo, mantendo id, name e required */
function trocarPorLista(campo, opcoes) {
    const lista = document.createElement("select");
    lista.id = campo.id;
    lista.name = campo.name;
    lista.required = true;

    const vazia = document.createElement("option");
    vazia.value = "";
    vazia.textContent = "Selecione...";
    lista.appendChild(vazia);

    opcoes.forEach(function (opcao) {
        const item = document.createElement("option");
        item.value = opcao.valor;
        item.textContent = opcao.texto;
        lista.appendChild(item);
    });

    campo.replaceWith(lista);
    return lista;
}


/* ---------- 1. Máscara do telefone ---------- */

function formatarTelefone(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);   /* só dígitos, no máximo 11 */

    if (numeros.length === 0) {
        return "";
    }
    if (numeros.length <= 2) {
        return "(" + numeros;
    }
    if (numeros.length <= 6) {
        return "(" + numeros.slice(0, 2) + ") " + numeros.slice(2);
    }
    if (numeros.length <= 10) {                               /* fixo: (11) 1234-5678 */
        return "(" + numeros.slice(0, 2) + ") " + numeros.slice(2, 6) + "-" + numeros.slice(6);
    }
    return "(" + numeros.slice(0, 2) + ") " + numeros.slice(2, 7) + "-" + numeros.slice(7);   /* celular */
}


/* ---------- 2. Reserva: dia, horário e quantidade de pessoas ---------- */

/* Máscara da data: 25122026 → 25/12/2026 */
function formatarCampoData(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);

    if (numeros.length <= 2) {
        return numeros;
    }
    if (numeros.length <= 4) {
        return numeros.slice(0, 2) + "/" + numeros.slice(2);
    }
    return numeros.slice(0, 2) + "/" + numeros.slice(2, 4) + "/" + numeros.slice(4);
}

/* Campo de data: texto com máscara + botão que abre um calendário do próprio site */
function montarCampoData(campo) {
    const envoltorio = document.createElement("span");
    const botao = document.createElement("button");
    const painel = document.createElement("span");
    const topo = document.createElement("span");
    const anterior = document.createElement("button");
    const proximo = document.createElement("button");
    const titulo = document.createElement("span");
    const tabela = document.createElement("table");
    const corpo = document.createElement("tbody");
    let mesVisivel = hoje();

    campo.type = "text";
    campo.inputMode = "numeric";
    campo.placeholder = "dd/mm/aaaa";
    campo.maxLength = 10;
    campo.pattern = "[0-9]{2}/[0-9]{2}/[0-9]{4}";
    campo.autocomplete = "off";

    envoltorio.className = "campo-data";
    botao.type = "button";
    botao.className = "botao-calendario";
    botao.setAttribute("aria-label", "Abrir calendário");
    botao.setAttribute("aria-expanded", "false");
    botao.innerHTML = '<i class="bi bi-calendar3" aria-hidden="true"></i>';

    painel.className = "calendario";
    painel.hidden = true;
    painel.setAttribute("role", "dialog");
    painel.setAttribute("aria-label", "Escolher a data da reserva");

    topo.className = "calendario-topo";
    anterior.type = "button";
    anterior.textContent = "‹";
    anterior.setAttribute("aria-label", "Mês anterior");
    proximo.type = "button";
    proximo.textContent = "›";
    proximo.setAttribute("aria-label", "Próximo mês");
    titulo.setAttribute("aria-live", "polite");
    topo.append(anterior, titulo, proximo);

    const cabecalho = tabela.createTHead().insertRow();
    SEMANA.forEach(function (letra) {
        const celula = document.createElement("th");
        celula.scope = "col";
        celula.textContent = letra;
        cabecalho.appendChild(celula);
    });
    tabela.appendChild(corpo);

    painel.append(topo, tabela);
    campo.replaceWith(envoltorio);
    envoltorio.append(campo, botao, painel);

    /* Desenha o mês que está sendo mostrado */
    function desenhar() {
        const ano = mesVisivel.getFullYear();
        const mes = mesVisivel.getMonth();
        const selecionada = lerData(campo.value);
        const inicio = hoje();
        const primeiro = new Date(ano, mes, 1);
        const diasNoMes = new Date(ano, mes + 1, 0).getDate();
        let dia = 1 - primeiro.getDay();                      /* começa no domingo da primeira semana */

        titulo.textContent = MESES[mes] + " " + ano;
        anterior.disabled = ano === inicio.getFullYear() && mes <= inicio.getMonth();
        corpo.innerHTML = "";

        while (dia <= diasNoMes) {
            const linha = corpo.insertRow();
            for (let coluna = 0; coluna < 7; coluna++, dia++) {
                const celula = linha.insertCell();
                if (dia < 1 || dia > diasNoMes) {
                    continue;                                 /* espaço vazio antes do dia 1 e depois do último */
                }
                const data = new Date(ano, mes, dia);
                const botaoDia = document.createElement("button");
                botaoDia.type = "button";
                botaoDia.textContent = dia;
                botaoDia.disabled = diaBloqueado(data);
                botaoDia.dataset.data = formatarDataBR(data);
                if (data.getTime() === inicio.getTime()) {
                    botaoDia.classList.add("hoje");
                }
                if (selecionada && data.getTime() === selecionada.getTime()) {
                    botaoDia.classList.add("escolhido");
                    botaoDia.setAttribute("aria-current", "date");
                }
                celula.appendChild(botaoDia);
            }
        }
    }

    function abrir() {
        mesVisivel = lerData(campo.value) || hoje();
        mesVisivel = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth(), 1);
        desenhar();
        painel.hidden = false;
        botao.setAttribute("aria-expanded", "true");
        const foco = corpo.querySelector(".escolhido") || corpo.querySelector("button:not(:disabled)");
        if (foco) {
            foco.focus();
        }
    }

    function fechar(devolverFoco) {
        painel.hidden = true;
        botao.setAttribute("aria-expanded", "false");
        if (devolverFoco) {
            botao.focus();
        }
    }

    botao.addEventListener("click", function () {
        if (painel.hidden) { abrir(); } else { fechar(true); }
    });

    anterior.addEventListener("click", function () {
        mesVisivel = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() - 1, 1);
        desenhar();
    });

    proximo.addEventListener("click", function () {
        mesVisivel = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() + 1, 1);
        desenhar();
    });

    /* Clicar em um dia preenche o campo */
    corpo.addEventListener("click", function (evento) {
        const escolhido = evento.target.closest("button");
        if (!escolhido || escolhido.disabled) {
            return;
        }
        campo.value = escolhido.dataset.data;
        campo.dispatchEvent(new Event("input", { bubbles: true }));
        fechar(true);
    });

    /* Esc fecha o calendário; clicar fora também */
    painel.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") { fechar(true); }
    });

    document.addEventListener("click", function (evento) {
        if (!painel.hidden && !envoltorio.contains(evento.target)) {
            fechar(false);
        }
    });

    /* Máscara enquanto digita */
    campo.addEventListener("input", function () {
        campo.value = formatarCampoData(campo.value);
    });

    return campo;
}

function montarHorarios(campoHorario) {
    const opcoes = [];

    for (let minutos = PRIMEIRO_HORARIO; minutos <= ULTIMO_HORARIO; minutos += INTERVALO) {
        opcoes.push({ valor: formatarHorario(minutos), texto: formatarHorario(minutos) });
    }

    return trocarPorLista(campoHorario, opcoes);
}

/* Se a reserva for para hoje, os horários que já passaram ficam desativados */
function atualizarHorarios(campoData, listaHorario) {
    const agora = new Date();
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
    const dia = lerData(campoData.value);
    const ehHoje = dia !== null && dia.getTime() === hoje().getTime();

    Array.from(listaHorario.options).forEach(function (opcao) {
        if (opcao.value === "") {
            return;
        }
        const partes = opcao.value.split(":");
        opcao.disabled = ehHoje && Number(partes[0]) * 60 + Number(partes[1]) <= minutosAgora;
    });

    if (listaHorario.selectedOptions[0].disabled) {
        listaHorario.value = "";
    }
}

/* Quantidade de pessoas: campo de texto só com números + botões − e + */
function montarContador(campo) {
    const contador = document.createElement("span");
    const menos = document.createElement("button");
    const mais = document.createElement("button");

    campo.type = "text";            /* tira as setinhas nativas; os botões fazem o papel delas */
    campo.inputMode = "numeric";
    campo.pattern = "[0-9]{1,2}";
    campo.maxLength = 2;

    contador.className = "contador";
    menos.type = "button";
    menos.textContent = "−";
    menos.setAttribute("aria-label", "Diminuir quantidade de pessoas");
    mais.type = "button";
    mais.textContent = "+";
    mais.setAttribute("aria-label", "Aumentar quantidade de pessoas");

    campo.replaceWith(contador);
    contador.append(menos, campo, mais);

    function quantidade() {
        return parseInt(campo.value, 10) || 0;
    }

    function atualizarBotoes() {
        menos.disabled = quantidade() <= 1;
        mais.disabled = quantidade() >= MAXIMO_PESSOAS;
    }

    function mudar(passo) {
        const nova = Math.min(MAXIMO_PESSOAS, Math.max(1, quantidade() + passo));
        campo.value = nova;
        campo.dispatchEvent(new Event("input", { bubbles: true }));
    }

    menos.addEventListener("click", function () { mudar(-1); });
    mais.addEventListener("click", function () { mudar(1); });

    /* Setas do teclado também aumentam e diminuem */
    campo.addEventListener("keydown", function (evento) {
        if (evento.key === "ArrowUp") { evento.preventDefault(); mudar(1); }
        if (evento.key === "ArrowDown") { evento.preventDefault(); mudar(-1); }
    });

    campo.addEventListener("input", function () {
        campo.value = campo.value.replace(/\D/g, "");      /* só números */
        atualizarBotoes();
    });

    atualizarBotoes();
}


/* ---------- 3. Mensagens de erro em português ---------- */

const mensagens = {
    nome: {
        valueMissing: "Digite o seu nome.",
        tooShort: "O nome precisa ter pelo menos 3 letras."
    },
    telefone: {
        valueMissing: "Digite o seu telefone.",
        patternMismatch: "Digite o telefone completo, com DDD. Exemplo: (11) 91234-5678."
    },
    data: {
        valueMissing: "Digite ou escolha o dia da reserva.",
        patternMismatch: "Digite a data completa. Exemplo: 25/12/2026."
    },
    horario: {
        valueMissing: "Escolha o horário da reserva."
    },
    pessoas: {
        valueMissing: "Informe quantas pessoas virão.",
        patternMismatch: "Digite apenas números."
    }
};

/* Troca a mensagem padrão do navegador pela nossa, quando existir */
function mostrarMensagem(campo) {
    const lista = mensagens[campo.name];
    campo.setCustomValidity("");

    /* Quantidade de pessoas: o limite é conferido aqui, porque o campo agora é de texto */
    if (campo.name === "pessoas" && campo.value !== "") {
        const numero = parseInt(campo.value, 10);
        if (numero < 1) {
            campo.setCustomValidity("A reserva precisa ter pelo menos 1 pessoa.");
            return;
        }
        if (numero > MAXIMO_PESSOAS) {
            campo.setCustomValidity("Para grupos com mais de " + MAXIMO_PESSOAS + " pessoas, fale conosco pelo telefone ou WhatsApp.");
            return;
        }
    }

    /* Data: precisa existir e não pode ter passado */
    if (campo.name === "data" && campo.validity.valid) {
        const dia = lerData(campo.value);
        if (campo.value !== "" && dia === null) {
            campo.setCustomValidity("Essa data não existe. Confira o dia e o mês.");
            return;
        }
        if (dia !== null && diaBloqueado(dia)) {
            campo.setCustomValidity(dia.getTime() === hoje().getTime()
                ? "Hoje já não há horários disponíveis. Escolha outro dia."
                : "Escolha uma data a partir de hoje.");
            return;
        }
    }

    if (!lista) {
        return;
    }

    for (const tipo in lista) {
        if (campo.validity[tipo]) {
            campo.setCustomValidity(lista[tipo]);
            return;
        }
    }
}


/* ---------- Início: roda quando a página terminou de carregar ---------- */

document.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll('input[data-mascara="telefone"]').forEach(function (campo) {
        campo.addEventListener("input", function () {
            campo.value = formatarTelefone(campo.value);
        });
    });

    /* Só a página de reserva tem estes campos */
    const campoData = document.getElementById("data");
    const campoHorario = document.getElementById("horario");
    const campoPessoas = document.getElementById("pessoas");

    if (campoData && campoHorario) {
        montarCampoData(campoData);
        const listaHorario = montarHorarios(campoHorario);

        campoData.addEventListener("input", function () {
            atualizarHorarios(campoData, listaHorario);
        });
    }

    if (campoPessoas) {
        montarContador(campoPessoas);
    }

    document.querySelectorAll("form input, form select").forEach(function (campo) {
        campo.addEventListener("input", function () { mostrarMensagem(campo); });
        campo.addEventListener("invalid", function () { mostrarMensagem(campo); });
    });
});