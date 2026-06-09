const express = require('express');
const router = express.Router();
const ReservaController = require('../controllers/ReservaController');

router.post('/', ReservaController.criar);
router.get('/', ReservaController.listar);
router.put('/:id/devolucao', ReservaController.devolver);

module.exports = router;