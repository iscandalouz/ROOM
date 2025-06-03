const express = require("express");
const cors = require("cors"); 
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;

const corsOptions = {
    origin: "https://gartic.com.br",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

let ultimaPalavra = "";
let contaPrincipal = null;
let rodadaIniciada = false;
let sairPorUsuario = {};
let desenhandoUsuarios = {};
let acertosPorUsuario = {};

app.use((req, res, next) => {
    if (!req.cookies.userId) {
        const userId = Math.random().toString(36).substr(2, 9);
        res.cookie("userId", userId, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        });
        req.cookies.userId = userId;
    }
    next();
});

app.post("/sair", (req, res) => {
    for (const userId in desenhandoUsuarios) {
        sairPorUsuario[userId] = true;
    }
    res.send("Saida requisitado");
});

app.get("/saida", (req, res) => {
    const userId = req.cookies.userId;
    res.json({ sair: sairPorUsuario[userId] || false });
});

app.post("/resetaSaida", (req, res) => {
    const userId = req.cookies.userId;
    sairPorUsuario[userId] = false;
    res.send("Flag de saida resetada");
});

app.post("/desenhando", (req, res) => {
    const userId = req.cookies.userId;
    const { desenhando } = req.body;
    desenhandoUsuarios[userId] = desenhando;

    if (desenhando && ultimaPalavra) {
        rodadaIniciada = true;
    }

    res.send("Status de desenho atualizado");
});

app.post("/principal", (req, res) => {
    const userId = req.cookies.userId;
    contaPrincipal = userId;
    console.log("Conta principal definida:", userId);
    res.send("Conta principal definida com sucesso!");
});

app.post("/acerto", (req, res) => {
    const userId = req.cookies.userId;
    acertosPorUsuario[userId] = true;

    if (userId === contaPrincipal) {
        console.log("Conta principal acertou!");
        respostaEnviadaPrincipal = true;
    }
    res.send("Confirmação de acerto registrada.");
});

app.post("/post", (req, res) => {
    ultimaPalavra = req.body.palavra;
    respostaEnviadaPrincipal = false;
    desenhandoUsuarios = {};
    acertosPorUsuario = {};
    rodadaIniciada = false;

    console.log("palavra recebida:", ultimaPalavra);

    res.send("Palavra recebida com sucesso!");
});

app.get("/get", (req, res) => {
    const userId = req.cookies.userId;
    const principal = userId === contaPrincipal;
    const principalDesenhando = desenhandoUsuarios[contaPrincipal] || false;
    const desenhando = desenhandoUsuarios[userId] || false;
    const principalAcertou = acertosPorUsuario[contaPrincipal] || false;

    let resposta = null;

    if (!contaPrincipal) {
        if (!desenhando) {
            resposta = ultimaPalavra;
        }
    } else if (principal) {
        if (!desenhando) {
            resposta = ultimaPalavra;
            respostaEnviadaPrincipal = true;
        }
    } else {
        if (!desenhando && principalDesenhando && rodadaIniciada) {
            resposta = ultimaPalavra;
        } else if (!desenhando && principalAcertou && rodadaIniciada) {
            resposta = ultimaPalavra;
        }
    }

    return res.json({ resposta, principal, rodadaIniciada });
});

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));