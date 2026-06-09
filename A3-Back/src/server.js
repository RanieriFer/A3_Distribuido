const express = require('express');
const cors = require('cors');

// Importando as rotas separadas
const livroRoutes = require('./routes/livroRoutes');
const reservaRoutes = require('./routes/reservaRoutes');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Usando as rotas na aplicação
app.use('/livros', livroRoutes);
app.use('/reservas', reservaRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} 🚀`);
});