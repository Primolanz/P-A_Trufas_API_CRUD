const path = require('path');
const cors = require('cors');
const express = require('express');
const trufaRoutes = require('./routes/trufaRoutes');

const app = express();
const frontendPath = path.join(__dirname, '..', 'frontend');

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origem nao permitida pelo CORS.'));
  },
}));

app.use(express.json());
app.use(express.static(frontendPath));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'P&A Trufas API' });
});

app.use('/api', trufaRoutes);
app.use(trufaRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota nao encontrada.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
});

module.exports = app;
