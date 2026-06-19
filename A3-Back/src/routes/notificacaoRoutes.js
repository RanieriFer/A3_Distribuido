const express = require("express");
const router = express.Router();
const NotificacaoController = require("../controllers/NotificacaoController");

router.get("/", NotificacaoController.listar);
router.delete("/:id", NotificacaoController.deletar);

module.exports = router;