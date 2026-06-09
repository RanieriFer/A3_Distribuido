const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    async criar(req, res) {
        const { livroId, cpfLeitor, telefoneContato } = req.body;

        try {
            const livro = await prisma.livro.findUnique({ where: { id: parseInt(livroId) } });
            if (!livro || livro.status === "Reservado") {
                return res.status(400).json({ erro: "Livro não encontrado ou indisponível." });
            }

            const novaReserva = await prisma.reserva.create({
                data: { livroId: parseInt(livroId), cpfLeitor, telefoneContato }
            });

            await prisma.livro.update({
                where: { id: parseInt(livroId) },
                data: { status: "Reservado" }
            });

            res.status(201).json(novaReserva);
        } catch (erro) {
            res.status(500).json({ erro: "Erro ao realizar reserva." });
        }
    },

    async listar(req, res) {
        try {
            const reservas = await prisma.reserva.findMany({ include: { livro: true } });
            res.status(200).json(reservas);
        } catch (erro) {
            res.status(500).json({ erro: "Erro ao buscar reservas." });
        }
    },

    async devolver(req, res) {
        try {
            const reservaAtualizada = await prisma.reserva.update({
                where: { id: parseInt(req.params.id) },
                data: { statusReserva: "Devolvido" }
            });

            await prisma.livro.update({
                where: { id: reservaAtualizada.livroId },
                data: { status: "Disponivel" }
            });

            res.status(200).json({ mensagem: "Devolução concluída." });
        } catch (erro) {
            res.status(500).json({ erro: "Erro ao processar devolução." });
        }
    }
};