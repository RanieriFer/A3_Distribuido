const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// Rota para criar a conta
router.post('/cadastro', AuthController.cadastro);

// Rota para entrar no sistema
router.post('/login', AuthController.login);

module.exports = router;