const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'chave_super_secreta_da_nossa_biblioteca';

module.exports = {
  // ROTA DE CADASTRO
  async cadastro(req, res) {
    try {
      const { nome, email, senha, cpf, telefone, role } = req.body;

      if (role === 'CLIENTE' && !cpf) {
        return res.status(400).json({ erro: 'O CPF é obrigatório para leitores.' });
      }

      const usuarioExistente = await prisma.usuario.findFirst({
        where: { OR: [{ email }, { cpf: cpf || undefined }] }
      });

      if (usuarioExistente) {
        return res.status(400).json({ erro: 'E-mail ou CPF já cadastrados no sistema.' });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      const novoUsuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          cpf: cpf || null,
          telefone: telefone || null,
          role: role || 'CLIENTE',
        }
      });

      novoUsuario.senha = undefined;
      res.status(201).json(novoUsuario);

    } catch (erro) {
      console.error("Erro no cadastro:", erro);
      res.status(500).json({ erro: 'Erro interno ao criar conta.' });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const usuario = await prisma.usuario.findUnique({ where: { email } });
      if (!usuario) {
        return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
      }

      const token = jwt.sign(
        { id: usuario.id, role: usuario.role }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      res.status(200).json({
        mensagem: 'Login realizado com sucesso',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role
        }
      });

    } catch (erro) {
      console.error("Erro no login:", erro);
      res.status(500).json({ erro: 'Erro interno ao realizar login.' });
    }
  }
};