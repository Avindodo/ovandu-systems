const express = require("express");
const cors = require("cors");
const multer = require("multer");
const db = require("./firebase");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("uploads")); // Para servir arquivos enviados

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ===== Rotas =====

// Adicionar membro
app.post("/membros", async (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).send("Nome é obrigatório");
  try {
    const docRef = await db.collection("membros").add({ nome });
    res.send({ id: docRef.id, nome });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Listar membros
app.get("/membros", async (req, res) => {
  try {
    const snapshot = await db.collection("membros").get();
    const membros = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.send(membros);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Registrar entrega
app.post("/entregas", upload.single("arquivo"), async (req, res) => {
  const { cliente, sistema, email, telefone, membro } = req.body;
  if (!cliente || !sistema || !email || !telefone || !membro || !req.file)
    return res.status(400).send("Todos os campos são obrigatórios");
  
  const arquivoURL = `http://localhost:3000/${req.file.filename}`;
  
  try {
    const docRef = await db.collection("entregas").add({
      cliente,
      sistema,
      email,
      telefone,
      membro,
      status: "Pendente",
      arquivo: arquivoURL,
      nomeArquivo: req.file.originalname,
      criadoEm: new Date(),
    });
    res.send({ id: docRef.id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Listar entregas
app.get("/entregas", async (req, res) => {
  try {
    const snapshot = await db.collection("entregas").orderBy("criadoEm", "desc").get();
    const entregas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.send(entregas);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Atualizar status
app.patch("/entregas/:id", async (req, res) => {
  const { status } = req.body;
  try {
    await db.collection("entregas").doc(req.params.id).update({ status });
    res.send({ success: true });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));
