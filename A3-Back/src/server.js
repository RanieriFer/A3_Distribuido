
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); 
const { Server } = require("socket.io"); 

const livroRoutes = require("./routes/livroRoutes");
const reservaRoutes = require("./routes/reservaRoutes");
const authRoutes = require('./routes/authRoutes');
const notificacaoRoutes = require("./routes/notificacaoRoutes");

const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/livros", livroRoutes);
app.use("/reservas", reservaRoutes);
app.use('/auth', authRoutes);
app.use("/notificacoes", notificacaoRoutes);

const PORT = process.env.PORT || 5000;
// <-- Mude de app.listen para server.listen
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀 com WebSockets ativados!`);
});