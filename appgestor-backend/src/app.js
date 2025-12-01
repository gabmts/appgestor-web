const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// LOG GLOBAL – mostra cada requisição recebida
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// rota API raiz
app.get('/', (req, res) => {
  res.json({ message: 'API AppGestor está rodando 🚀' });
});

// rota teste do banco
app.get('/db-test', async (req, res) => {
  const users = await db('users').select('*');
  res.json({ ok: true, rows: users });
});

// rotas da API
const routes = require('./routes');
app.use('/api', routes);

module.exports = app;

// Tratamento global de erros (até erros não capturados)
app.use((err, req, res, next) => {
  console.error("🔥 ERRO GLOBAL EXPRESS:", err);
  return res.status(500).json({ error: "Erro interno do servidor", detail: err.message });
});
