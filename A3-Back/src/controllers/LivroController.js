const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  async criar(req, res) {
        // 1. ADICIONADO: Puxa a sinopse que o Front-end mandou
        const { isbn, titulo, autor, capaUrl, sinopse } = req.body; 
        
        if (!isbn) return res.status(400).json({ erro: "Envie o ISBN do livro." });

        try {
            // 2. A PARTE CRÍTICA: Se o front já mandou título e autor, salva direto com a sinopse!
            if (titulo && autor) {
                const novoLivro = await prisma.livro.create({
                    data: { 
                        isbn: isbn, 
                        titulo: titulo, 
                        autor: autor, 
                        capaUrl: capaUrl || null, 
                        sinopse: sinopse || null, // <-- ADICIONADO AQUI!
                        status: "Disponivel"
                    }
                });
                return res.status(201).json(novoLivro); // Salva e para a execução aqui!
            }

            // ==========================================
            // FALLBACK: Se o front-end mandar SÓ o ISBN, o Back-end tenta buscar
            // ==========================================
            let dadosLivro = null; 
            const imagemPadrao = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80";

            try {
                const resBrasil = await fetch(`https://brasilapi.com.br/api/isbn/v1/${isbn}`);
                if (resBrasil.ok) {
                    const data = await resBrasil.json();
                    dadosLivro = {
                        titulo: data.title,
                        autor: (data.authors && data.authors.length > 0 && data.authors[0] !== "") ? data.authors.join(', ') : "Autor Desconhecido",
                        capaUrl: data.cover_url || imagemPadrao
                    };
                }
            } catch (e) { console.log("Falha na BrasilAPI, tentando a próxima..."); }

            if (!dadosLivro) {
                try {
                    const resOpen = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
                    if (resOpen.ok) {
                        const data = await resOpen.json();
                        const chave = `ISBN:${isbn}`;
                        if (data[chave]) {
                            const info = data[chave];
                            dadosLivro = {
                                titulo: info.title,
                                autor: (info.authors && info.authors.length > 0) ? info.authors[0].name : "Autor Desconhecido",
                                capaUrl: info.cover ? info.cover.medium : imagemPadrao
                            };
                        }
                    }
                } catch (e) { console.log("Falha na Open Library, tentando a próxima..."); }
            }

            if (!dadosLivro) {
                try {
                    const resGoogle = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${isbn}`);
                    if (resGoogle.ok) {
                        const data = await resGoogle.json();
                        if (data.items && data.items.length > 0) {
                            const info = data.items[0].volumeInfo;
                            dadosLivro = {
                                titulo: info.title,
                                autor: (info.authors && info.authors.length > 0) ? info.authors.join(', ') : "Autor Desconhecido",
                                capaUrl: info.imageLinks ? info.imageLinks.thumbnail : imagemPadrao
                            };
                        }
                    }
                } catch (e) { console.log("Falha no Google Books."); }
            }

            if (!dadosLivro) {
                return res.status(404).json({ erro: "Livro não encontrado em nenhuma das 3 bases de dados." });
            }

            // Fallback de segurança caso a busca caia aqui por algum motivo
            const novoLivro = await prisma.livro.create({
                data: {
                    isbn: isbn,
                    titulo: dadosLivro.titulo || "Título Desconhecido",
                    autor: dadosLivro.autor || "Autor Desconhecido",
                    capaUrl: dadosLivro.capaUrl,
                    sinopse: null, // As APIs públicas do fallback raramente trazem sinopse limpa
                    status: "Disponivel"
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
            const livros = await prisma.livro.findMany({
                include: {
                    reservas: {
                        where: {
                            statusReserva: "Pendente" 
                        },
                        orderBy: {
                            dataReserva: 'desc' 
                        },
                        take: 1 
                    }
                }
            });
            res.status(200).json(livros); 
        } catch (erro) {
            console.error("Erro no listar:", erro); 
            res.status(500).json({ erro: "Erro ao buscar livros." });
        }
    },

    async buscarPorTitulo(req, res) {
        const { titulo } = req.query; 

        if (!titulo) return res.status(400).json({ erro: "Digite um título para buscar." });

        try {
            const livros = await prisma.livro.findMany({
                where: {
                    titulo: {
                        contains: titulo,
                        mode: 'insensitive' 
                    }
                }
            });
            res.status(200).json(livros);
        } catch (erro) {
            console.error("Erro no buscarPorTitulo:", erro);
            res.status(500).json({ erro: "Erro na busca de livros." });
        }
    },
async atualizar(req, res) {
        try {
            const id = parseInt(req.params.id);
            // 1. ADICIONADO: Agora ele captura o 'status' que vem do Front-end
            const { titulo, autor, capaUrl, sinopse, status } = req.body; 

            const livroAtualizado = await prisma.livro.update({
                where: { id: id },
                data: {
                   
                    titulo: titulo,
                    autor: autor,
                    capaUrl: capaUrl,
                    sinopse: sinopse,
                    status: status
                }
            });
            res.status(200).json(livroAtualizado);
        } catch (erro) {
            console.error("Erro no atualizar:", erro);
            res.status(500).json({ erro: "Erro ao atualizar livro." });
        }
    },

    async deletar(req, res) {
        try {
            await prisma.livro.delete({ where: { id: parseInt(req.params.id) } });
            res.status(200).json({ mensagem: "Livro removido." });
        } catch (erro) {
            console.error("Erro no deletar:", erro);
            res.status(500).json({ erro: "Erro ao remover livro." });
        }
    }
};