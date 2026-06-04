const { pool, normalizeTrufa } = require('../config/database');

const listarTrufas = async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM trufas ORDER BY id ASC');
  res.json(rows.map(normalizeTrufa));
};

const buscarTrufaPorId = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'ID invalido.' });
  }

  const { rows } = await pool.query('SELECT * FROM trufas WHERE id = $1', [id]);

  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Trufa nao encontrada.' });
  }

  res.json(normalizeTrufa(rows[0]));
};

const cadastrarTrufa = async (req, res) => {
  const { nome, preco, descricao = '', disponivel = true } = req.body;
  const precoNumerico = Number(preco);

  if (!nome || !Number.isFinite(precoNumerico) || precoNumerico < 0) {
    return res.status(400).json({ erro: 'Informe nome e preco valido para cadastrar a trufa.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO trufas (nome, preco, descricao, disponivel)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [nome.trim(), precoNumerico, descricao, Boolean(disponivel)]
  );

  res.status(201).json({
    mensagem: 'Trufa cadastrada com sucesso.',
    trufa: normalizeTrufa(rows[0]),
  });
};

const atualizarTrufa = async (req, res) => {
  const id = Number(req.params.id);
  const { nome, preco, descricao = '', disponivel = true } = req.body;
  const precoNumerico = Number(preco);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'ID invalido.' });
  }

  if (!nome || !Number.isFinite(precoNumerico) || precoNumerico < 0) {
    return res.status(400).json({ erro: 'Informe nome e preco valido para atualizar a trufa.' });
  }

  const { rows } = await pool.query(
    `UPDATE trufas
     SET nome = $1,
         preco = $2,
         descricao = $3,
         disponivel = $4,
         atualizada_em = NOW()
     WHERE id = $5
     RETURNING *`,
    [nome.trim(), precoNumerico, descricao, Boolean(disponivel), id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Trufa nao encontrada.' });
  }

  res.json({
    mensagem: 'Trufa atualizada com sucesso.',
    trufa: normalizeTrufa(rows[0]),
  });
};

const deletarTrufa = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'ID invalido.' });
  }

  const { rowCount } = await pool.query('DELETE FROM trufas WHERE id = $1', [id]);

  if (rowCount === 0) {
    return res.status(404).json({ erro: 'Trufa nao encontrada.' });
  }

  res.json({ mensagem: 'Trufa excluida com sucesso.' });
};

module.exports = {
  listarTrufas,
  buscarTrufaPorId,
  cadastrarTrufa,
  atualizarTrufa,
  deletarTrufa,
};
