require('dotenv/config');

const app = require('./src/app');
const { initializeDatabase } = require('./src/config/database');

const port = process.env.PORT || 3000;

const startServer = async () => {
  await initializeDatabase();

  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error('Nao foi possivel iniciar o servidor:', error);
  process.exit(1);
});
