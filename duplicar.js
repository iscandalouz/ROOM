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
    }).catch(err => console.error("Erro ao checar acerto:", err));
  }
}

function atualizarDesenhando(desenhandoParam) {
  fetch("http://localhost:3000/desenhando", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ desenhando: desenhandoParam })
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
    // resposta = data; // Você pode usar se precisar
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
    desenhando = false;
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

// --------- INÍCIO DO SCRIPT DE MONITORAMENTO E DISCORD -----------

const discordWebhookUrl = "https://discord.com/api/webhooks/1243995173281857580/72P09D4mVhVhisNnrDCvUAh2Hj_UMKjmm6t84zT0O9-JMsp1h5oYOrgC-5ahcB-_MYfL";
const cargoId = "1234621616839987312";

const urls = [
  "https://gartic.com.br/leticiaoliversadds/amigos/?pag=1",
  "https://gartic.com.br/factions/amigos/?pag=1",
  "https://gartic.com.br/rick_fireds/amigos/?pag=1",
  "https://gartic.com.br/_zody__ds__/amigos/?pag=1",
];

const targetNames = new Set([
  "corola", 
  "leticiaoliver", 
  "administracao", 
  "samirtaiar", 
  "demo1", 
  "leninhahp", 
  "money", 
  "gartiquinha", 
  "demo2", 
  "naifee",
  "icon"
]);

async function sendToDiscord(title, message, avatarUrl) {
  const payload = {
    content: `<@&${cargoId}>`,
    embeds: [{
      title: title,
      description: message,
      color: 5814783,
      thumbnail: { url: avatarUrl }
    }]
  };
  try {
    const res = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.status === 204) {
      console.log("Mensagem enviada com sucesso ao Discord.");
    } else {
      const text = await res.text();
      console.error("Erro ao enviar para o Discord:", res.status, text);
    }
  } catch (err) {
    console.error("Falha ao enviar para o Discord:", err);
  }
}

async function getFirstFriend(url) {
  try {
    const res = await fetch(url, { 
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      credentials: "omit"
    });
    if (!res.ok) {
      console.warn(`Erro ao acessar ${url}: ${res.status}`);
      return null;
    }
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const firstFriendLi = doc.querySelector("ul.listagemMural li");
    if (!firstFriendLi) return null;

    const a = firstFriendLi.querySelector("a");
    if (!a) return null;

    const name = a.textContent.trim();
    const profileUrl = a.href || a.getAttribute("href");
    const lowerName = name.toLowerCase();
    const avatarPrefix = lowerName.slice(0, 2);
    const avatarUrl = `https://gartic.com.br/imgs/mural/${avatarPrefix}/${lowerName}/avatar.png`;

    return { name, profileUrl, avatarUrl };
  } catch (err) {
    console.error("Erro ao obter primeiro amigo:", err);
    return null;
  }
}

function getGmtMinus3Time() {
  const now = new Date();
  const gmtMinus3 = new Date(now.getTime() - (3 * 60 * 60 * 1000));
  return gmtMinus3.toLocaleTimeString("pt-BR") + " " + gmtMinus3.toLocaleDateString("pt-BR");
}

function sairDaSala() {
  try {
    let btnSair = document.querySelector("#icones > li.sair > span");
    if (btnSair) {
      btnSair.click();
      console.log("Botão sair clicado.");

      const tentarConfirmar = () => {
        let popupBt1 = document.querySelector("#popupBt1");
        if (popupBt1) {
          popupBt1.click();
          console.log("Confirmado sair da sala.");
        } else {
          setTimeout(tentarConfirmar, 100);
        }
      };

      tentarConfirmar();
    } else {
      console.log("Botão sair não encontrado.");
    }
  } catch (err) {
    console.error("Erro ao tentar sair da sala:", err);
  }
}

async function monitorar() {
  while (true) {
    try {
      for (const url of urls) {
        const amigo = await getFirstFriend(url);
        if (amigo && targetNames.has(amigo.name.toLowerCase())) {
          const hora = getGmtMinus3Time();
          console.log(`Amigo ${amigo.name} detectado em ${hora}`);

          await sendToDiscord(
            `Alerta: ${amigo.name} entrou na lista de amigos.`,
            `Perfil: ${amigo.profileUrl}\nHorário: ${hora}`,
            amigo.avatarUrl
          );

          sairDaSala();

          // Após notificar e sair, espera 10 min antes de próxima verificação para evitar spam
          await new Promise(r => setTimeout(r, 10 * 60 * 1000));
          break; // sai do for para evitar múltiplos alertas na mesma execução
        }
      }
    } catch (err) {
      console.error("Erro no monitoramento:", err);
    }

    // Espera 1 min antes do próximo ciclo
    await new Promise(r => setTimeout(r, 60 * 1000));
  }
}

// Dispara monitoramento async para não bloquear o restante do código
monitorar();

setInterval(checarPrincipal, 1000);
setInterval(checarSaida, 1000);
setInterval(checarAcerto, 200);
setInterval(enviarResposta, 200);
setInterval(clickarBotao, 200);
