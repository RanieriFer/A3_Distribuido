const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  async criar(req, res) {
    const { livroId, usuarioId } = req.body;

    try {
      const livro = await prisma.livro.findUnique({
        where: { id: parseInt(livroId) },
      });

      if (
        !livro ||
        livro.status.toUpperCase() === "RESERVADO" ||
        livro.status.toUpperCase() === "EMPRESTADO"
      ) {
        return res
          .status(400)
          .json({ erro: "Livro não encontrado ou indisponível." });
      }

      const novaReserva = await prisma.reserva.create({
        data: {
          livroId: parseInt(livroId),
          usuarioId: parseInt(usuarioId),
        },
      });

      await prisma.livro.update({
        where: { id: parseInt(livroId) },
        data: { status: "RESERVADO" },
      });

      const mensagemNotificacao = `Novo pedido: O livro "${livro.titulo}" foi reservado.`;
      
      const novaNotificacao = await prisma.notificacao.create({
        data: {
          mensagem: mensagemNotificacao
        }
      });

      if (req.io) {
        req.io.emit("nova_reserva", novaNotificacao);
      }

      res.status(201).json(novaReserva);
    } catch (erro) {
      console.error("Erro ao criar reserva:", erro);
      res.status(500).json({ erro: "Erro ao realizar reserva." });
    }
  },

  async listar(req, res) {
    try {
      const reservas = await prisma.reserva.findMany({
        include: { livro: true },
      });
      res.status(200).json(reservas);
    } catch (erro) {
      console.error("Erro ao listar reservas:", erro);
      res.status(500).json({ erro: "Erro ao buscar reservas." });
    }
  },

  async listarPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;

      const reservas = await prisma.reserva.findMany({
        where: {
          usuarioId: parseInt(usuarioId),
        },
        include: {
          livro: true, 
        },
        orderBy: {
          dataReserva: "desc",
        },
      });

      res.status(200).json(reservas);
    } catch (erro) {
      console.error("Erro ao listar reservas do usuario:", erro);
      res.status(500).json({ erro: "Erro ao buscar suas reservas." });
    }
  },

  async devolver(req, res) {
    try {
      const reservaAtualizada = await prisma.reserva.update({
        where: { id: parseInt(req.params.id) },
        data: { statusReserva: "Devolvido" },
      });

      await prisma.livro.update({
        where: { id: reservaAtualizada.livroId },
        data: { status: "DISPONIVEL" },
      });

      res.status(200).json({ mensagem: "Devolução concluída." });
    } catch (erro) {
      console.error("Erro ao processar devolucao:", erro);
      res.status(500).json({ erro: "Erro ao processar devolução." });
    }
  },
};