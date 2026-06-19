# 💻 MinhaBiblioteca — Front-end

Interface de usuário do sistema de gestão e reserva de livros, focada em alta performance e navegação assíncrona.

## 🛠️ Tecnologias
* **Next.js / React:** Roteamento e renderização (App Router).
* **Tailwind CSS:** Estilização responsiva.
* **Fetch API:** Consumo de dados do servidor e APIs externas.
* **WebSockets:** Escuta de eventos e notificações em tempo real.

## 🚀 Funcionalidades
* **Busca Instantânea:** Filtros de catálogo processados diretamente na memória do navegador (Client-Side).
* **Preenchimento via ISBN:** Consulta encadeada a 3 APIs externas para autocompletar dados de novos livros.
* **Notificações Ao Vivo:** Alertas via WebSocket no painel do administrador quando ocorrem novas reservas.
* **Resiliência Visual:** Componentes de fallback para substituir imagens e capas quebradas.

## 🔐 Variáveis de Ambiente (.env)

Para o funcionamento correto das integrações externas, crie um arquivo chamado `.env.local` na raiz da pasta do front-end e adicione as chaves abaixo:

```env
# Chave da API do Google Books para busca automática por ISBN
NEXT_PUBLIC_GOOGLE_BOOKS_KEY="SUA_CHAVE_AQUI"

# Credenciais do Cloudinary para upload e armazenamento das capas dos livros
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="SEU_CLOUD_NAME"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="SEU_PRESET"
```

## 📦 Como Instalar e Executar

Certifique-se de que o seu terminal está aberto **dentro da pasta `frontend`** antes de escolher uma das opções abaixo:

### Opção 1: Instalação do Zero (npx create-next-app)
Para reconstruir a estrutura do zero diretamente dentro desta pasta, rode o comando usando o ponto (`.`):

```bash
npx create-next-app@latest .
```

Responda às configurações do assistente exatamente assim:
* TypeScript? **Yes**
* ESLint? **Yes**
* Tailwind CSS? **Yes**
* `src/` directory? **No**
* App Router? **Yes**
* Customize import alias (`@/*`)? **No**

Após a instalação terminar, inicie o servidor:
```bash
npm run dev
```

---

### Opção 2: Rodar o Projeto com os Arquivos Existentes
Se você acabou de clonar o repositório e os arquivos já estão na pasta, basta rodar:

```bash
npm install
npm run dev
```

---

Após executar a Opção 1 ou a Opção 2, acesse no seu navegador: `http://localhost:3000/auth/login`