const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
async criar(req, res) {
        const { isbn } = req.body;
        if (!isbn) return res.status(400).json({ erro: "Envie o ISBN do livro." });

        try {
            // Buscando na Open Library API
            const respostaAPI = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
            const dados = await respostaAPI.json();
            
            const chaveIsbn = `ISBN:${isbn}`;

            // Verifica se a API não encontrou o livro (ela retorna um JSON vazio {})
            if (!dados[chaveIsbn]) {
                return res.status(404).json({ erro: "Livro não encontrado na Open Library." });
            }

            const infoLivro = dados[chaveIsbn];

            const novoLivro = await prisma.livro.create({
                data: {
                    isbn: isbn,
                    titulo: infoLivro.title || "Título Desconhecido",
                    autor: (infoLivro.authors && infoLivro.authors.length > 0) 
                        ? infoLivro.authors[0].name 
                        : "Autor Desconhecido",
                    capaUrl: infoLivro.cover ? infoLivro.cover.medium : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"
                }
            });

            res.status(201).json(novoLivro);
        } catch (erro) {
            console.error(erro);
            res.status(500).json({ erro: "Erro interno ao cadastrar o livro." });
        }
    },

    async listar(req, res) {
        try {
            const livros = await prisma.livro.findMany();
            res.status(200).json(livro);
        } catch (erro) {
            res.status(500).json({ erro: "Erro ao buscar livros." });
        }
    },

    async buscarPorTitulo(req, res) {
        const { titulo } = req.query; // Pega o que o usuário digitou na URL

        if (!titulo) return res.status(400).json({ erro: "Digite um título para buscar." });

        try {
            const livros = await prisma.livro.findMany({
                where: {
                    titulo: {
                        contains: titulo,
                        mode: 'insensitive' // Mágica do Prisma: ignora maiúsculas/minúsculas
                    }
                }
            });
            res.status(200).json(livros);
        } catch (erro) {
            res.status(500).json({ erro: "Erro na busca de livros." });
        }
    },

    async deletar(req, res) {
        try {
            await prisma.livro.delete({ where: { id: parseInt(req.params.id) } });
            res.status(200).json({ mensagem: "Livro removido." });
        } catch (erro) {
            res.status(500).json({ erro: "Erro ao remover livro." });
        }
    }
};