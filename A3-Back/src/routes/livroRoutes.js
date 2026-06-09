const express = require('express');
const router = express.Router();
const LivroController = require('../controllers/LivroController');

router.post('/', LivroController.criar);
router.get('/busca', LivroController.buscarPorTitulo);
router.get('/', LivroController.listar);
router.delete('/:id', LivroController.deletar);

module.exports = router;