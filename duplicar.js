let ultimaPalavra = "";
let contaPrincipal = false;
let desenhando = false;

const btn = document.createElement("button");
btn.textContent = "Conta Principal";
btn.style.position = "fixed";
btn.style.bottom = "10px";
btn.style.left = "10px";
btn.style.zIndex = "9999";
btn.style.padding = "10px";
btn.style.background = "#f44336";
btn.style.color = "white";
btn.style.border = "none";
btn.style.borderRadius = "5px";
btn.style.cursor = "pointer";

btn.onclick = () => {
    fetch("http://localhost:3000/principal", {
        method: "POST",
        credentials: "include"
    }).then(() => {
        alert("Esta conta foi definida como principal!");
        checarPrincipal();
    });
};

document.body.appendChild(btn);

const btnSair = document.createElement("button");
btnSair.textContent = "Sair da sala";
btnSair.style.position = "fixed";
btnSair.style.bottom = "10px";
btnSair.style.left = "150px";
btnSair.style.zIndex = "9999";
btnSair.style.padding = "10px";
btnSair.style.background = "#333";
btnSair.style.color = "white";
btnSair.style.border = "none";
btnSair.style.borderRadius = "5px";
btnSair.style.cursor = "pointer";

btnSair.onclick = () => {
    fetch("http://localhost:3000/sair", {
        method: "POST",
        credentials: "include"
    });
};

document.body.appendChild(btnSair);

function checarSaida() {
    fetch("http://localhost:3000/saida", {
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        if (data.sair) {
            const botaoSair = document.querySelector("#icones li.sair");
            if (botaoSair) {
                botaoSair.click();

                const btnConfirmar = document.querySelector("#popup.popupConfirmacao #popupBt1");
                if (btnConfirmar && getComputedStyle(btnConfirmar).display !== "none") {
                    btnConfirmar.click();
                }

                fetch("http://localhost:3000/resetaSaida", {
                    method: "POST",
                    credentials: "include"
                });
            }
        }
    });
}

function checarPrincipal() {
    fetch("http://localhost:3000/get", {
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        contaPrincipal = data.principal;
        btn.style.background = contaPrincipal ? "#4CAF50" : "#f44336";
    });
}

function checarAcerto() {
    const acertos = document.querySelectorAll(".acerto");
    if (acertos.length === 0) return;

    const ultimoAcerto = acertos[acertos.length - 1].textContent.trim();

    if (ultimoAcerto.startsWith("Você acertou:")) {
        fetch("http://localhost:3000/acerto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ acertou: true })
        }).catch(err => console.error("Erro ao erro ao checar acerto:", err));;
    }
}

function atualizarDesenhando(desenhando) {
    fetch("http://localhost:3000/desenhando", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ desenhando })
    }).catch(err => console.error("Erro ao atualizar desenhando:", err));
}

function enviarPalavra(palavra) {
    fetch("http://localhost:3000/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ palavra })
    })
    .then(response => response.text())
    .then(data => {
        resposta = data;
    })
    .catch(error => console.error("Erro ao enviar palavra:", error));
}

function clickarBotao() {
    const alerta = document.querySelector("#alerta");
    const desenharBtn = document.querySelector("#desenhar");
    const texto1 = alerta?.querySelector(".texto1");

    if (texto1 && texto1.textContent.trim() === "Sua vez") {
        desenharBtn.click();
        desenhando = true;
        atualizarDesenhando(desenhando);

        const todasAsVezes = document.querySelectorAll(".vez");
        if (todasAsVezes.length > 0) {
            for (let i = todasAsVezes.length - 1; i >= 0; i--) {
                const texto = todasAsVezes[i].textContent.trim();

                if (texto.startsWith("Sua vez, a palavra é:")) {
                    const palavra = todasAsVezes[i].querySelector("strong")?.textContent.trim();
                    console.log("Palavra da vez:", palavra);

                    if (palavra && palavra !== ultimaPalavra) {
                        enviarPalavra(palavra);
                    }

                    ultimaPalavra = palavra;
                    break;
                }
            }
        }
    } else {
        desenhando = false
        atualizarDesenhando(desenhando);
    }
}

function enviarResposta() {
    fetch("http://localhost:3000/get", {
        credentials: "include"
    })
    .then(response => response.json())
    .then(data => {
        const resposta = data.resposta;
        const rodadaIniciada = data.rodadaIniciada;

        if (!resposta || desenhando || !rodadaIniciada) return;

        const input = document.querySelector('#respostas input');
        const enviarBtn = document.querySelector('#respostas form');

        if (!input || !enviarBtn) return;

        input.value = resposta;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        enviarBtn.dispatchEvent(new Event('submit', { bubbles: true }));
    })
    .catch(error => console.error("Erro ao buscar resposta:", error));
}

setInterval(checarPrincipal, 1000);
setInterval(checarSaida, 1000);
setInterval(checarAcerto, 200);
setInterval(enviarResposta, 200);
setInterval(clickarBotao, 200);
