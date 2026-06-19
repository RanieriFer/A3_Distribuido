const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  async listar(req, res) {
    try {
      const notificacoes = await prisma.notificacao.findMany({
        orderBy: { createdAt: 'desc' } 
      });
      res.status(200).json(notificacoes);
    } catch (erro) {
      console.error("Erro ao listar notificações:", erro);
      res.status(500).json({ erro: "Erro ao buscar notificações." });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await prisma.notificacao.delete({
        where: { id: parseInt(id) }
      });
      res.status(200).json({ mensagem: "Notificação excluída com sucesso." });
    } catch (erro) {
      console.error("Erro ao deletar notificação:", erro);
      res.status(500).json({ erro: "Erro ao deletar notificação." });
    }
  }
};