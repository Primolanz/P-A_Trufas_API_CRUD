//importa o express e coloca em uma variavel express
const express = require('express');

//cria uma constante router e nela chama o express.Router (que separa as rotas do app.js)
const router = express.Router();

//importa as funções do controller de trufas
const {
    listarTrufas,
    buscarTrufaPorId,
    cadastrarTrufa,
    atualizarTrufa,
    deletarTrufa
} = require('../controllers/trufaController');

const asyncHandler = (controller) => (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch(next);
};

//cria a rota para exibir os sabores das trufas
router.get('/trufas', asyncHandler(listarTrufas));

//cria uma rota para ver uma trufa pelo ID
router.get('/trufas/:id', asyncHandler(buscarTrufaPorId));

//cria um metodo post para adicionar novas trufas
router.post('/trufas', asyncHandler(cadastrarTrufa));

// atualiza as trufas por ID no metodo PUT
router.put('/trufas/:id', asyncHandler(atualizarTrufa));

// deleta as trufas
router.delete('/trufas/:id', asyncHandler(deletarTrufa));

//exporta as rotas
module.exports = router;
