const { Pool } = require('pg');

const initialTrufas = [
  { nome: 'Trufa Maracuja', preco: 4.5, descricao: 'Recheio cremoso com acidez leve e chocolate ao leite.' },
  { nome: 'Trufa Ovomaltine', preco: 5, descricao: 'Chocolate cremoso com crocancia de Ovomaltine.' },
  { nome: 'Trufa Brigadeiro', preco: 4.5, descricao: 'Classica, macia e com sabor intenso de brigadeiro.' },
  { nome: 'Trufa Nutella', preco: 6, descricao: 'Recheio aveludado com creme de avela.' },
  { nome: 'Trufa Ninho', preco: 5.5, descricao: 'Doce na medida, com recheio de leite Ninho.' },
];

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL nao foi configurada. Configure uma URL PostgreSQL para iniciar a API.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});

const normalizeTrufa = (row) => ({
  id: row.id,
  nome: row.nome,
  preco: Number(row.preco),
  descricao: row.descricao || '',
  disponivel: row.disponivel,
  criadaEm: row.criada_em,
  atualizadaEm: row.atualizada_em,
});

const initializeDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS trufas (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
      descricao TEXT DEFAULT '',
      disponivel BOOLEAN NOT NULL DEFAULT true,
      criada_em TIMESTAMP NOT NULL DEFAULT NOW(),
      atualizada_em TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM trufas');

  if (rows[0].total === 0) {
    for (const trufa of initialTrufas) {
      await pool.query(
        'INSERT INTO trufas (nome, preco, descricao) VALUES ($1, $2, $3)',
        [trufa.nome, trufa.preco, trufa.descricao]
      );
    }
  }
};

module.exports = {
  pool,
  normalizeTrufa,
  initializeDatabase,
};
