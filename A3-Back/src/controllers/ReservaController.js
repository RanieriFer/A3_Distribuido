const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  async criar(req, res) {
    // 1. CORREÇÃO: Adicionamos o 'nomeLeitor' aqui para o Prisma não travar
    const { livroId, nomeLeitor, cpfLeitor, telefoneContato } = req.body;

    try {
      const livro = await prisma.livro.findUnique({
        where: { id: parseInt(livroId) },
      });

      // 2. CORREÇÃO: Verificação mais segura do status
      if (
        !livro ||
        livro.status.toUpperCase() === "RESERVADO" ||
        livro.status.toUpperCase() === "EMPRESTADO"
      ) {
        return res
          .status(400)
          .json({ erro: "Livro não encontrado ou indisponível." });
      }

      // 3. Cria a reserva enviando todos os dados obrigatórios
      const novaReserva = await prisma.reserva.create({
        data: {
          livroId: parseInt(livroId),
          nomeLeitor: nomeLeitor, // Passando o nome do leitor!
          cpfLeitor: cpfLeitor,
          telefoneContato: telefoneContato || null,
        },
      });

      // 4. Muda o status do livro na biblioteca
      await prisma.livro.update({
        where: { id: parseInt(livroId) },
        data: { status: "Reservado" },
      });

      res.status(201).json(novaReserva);
    } catch (erro) {
      console.error("Erro ao criar reserva:", erro); // Para você ver no terminal se der erro
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
      res.status(500).json({ erro: "Erro ao buscar reservas." });
    }
  },

  async devolver(req, res) {
    try {
      const reservaAtualizada = await prisma.reserva.update({
        where: { id: parseInt(req.params.id) },
        data: { statusReserva: "Devolvido" },
      });

      // Volta o livro para disponível quando devolvido
      await prisma.livro.update({
        where: { id: reservaAtualizada.livroId },
        data: { status: "DISPONIVEL" },
      });

      res.status(200).json({ mensagem: "Devolução concluída." });
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao processar devolução." });
    }
  },
};
