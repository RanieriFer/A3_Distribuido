# ⚙️ MinhaBiblioteca — Back-end

API e motor lógico do sistema de gestão e reserva de livros, responsável pelas regras de negócio, persistência de dados e autenticação de usuários.

## 🛠️ Tecnologias
* **Node.js / Express:** Servidor assíncrono e roteamento da API RESTful.
* **Prisma ORM:** Modelagem de dados e comunicação segura com o banco de dados relacional.
* **WebSockets:** Emissão de eventos e notificações em tempo real para os clientes conectados.
* **JWT (JSON Web Token):** Geração de tokens de acesso criptografados para login.

## 🚀 Funcionalidades e Engenharia
* **Notificações Push:** Disparo instantâneo de alertas via WebSocket para o painel do administrador assim que uma nova reserva é confirmada no banco.
* **Proteção contra Concorrência (Race Condition):** Travas atômicas na escrita do banco de dados para impedir que dois usuários reservem o último exemplar no mesmo milissegundo.
* **Tolerância a Falhas (Fail-Fast):** Rotas isoladas com blocos de tratamento de erros. Falhas de conexão ou dados inválidos não derrubam o servidor, retornando apenas status HTTP amigáveis (400, 404, 500).

## 🔐 Variáveis de Ambiente (.env)

Para que o servidor funcione corretamente e mantenha a segurança das senhas, crie um arquivo chamado `.env` na raiz da pasta do back-end e configure as variáveis abaixo:

```env
# URL de conexão com o banco de dados (Prisma)
DATABASE_URL="postgresql://usuario:senha@localhost:5432/minhabiblioteca"

# Chave secreta usada para criptografar os Tokens JWT de autenticação
JWT_SECRET="sua_chave_super_secreta_aqui"
```

## 📦 Como Instalar e Executar

No terminal, certifique-se de estar dentro da pasta do back-end e execute os comandos abaixo:

1. `npm install` (Instala as dependências do servidor)
2. `npx prisma migrate dev` (Cria a estrutura de tabelas no seu banco de dados)
3. `node src/server.js` (Inicia o servidor)

A API estará rodando e escutando requisições na porta: `http://localhost:5000`