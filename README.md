# P&A Trufas

Sistema de cardapio e pedidos de trufas com API Express, banco PostgreSQL e front estatico com carrinho e conversao para WhatsApp.

## Rodando localmente

1. Copie `.env.example` para `.env` e preencha `DATABASE_URL`.
2. Instale as dependencias:

```bash
npm install
```

3. Inicie a API:

```bash
npm run dev
```

4. Acesse:

```text
http://localhost:3000
```

Na primeira inicializacao, a API cria a tabela `trufas` e cadastra os sabores iniciais automaticamente.

## Deploy

### Backend no Render

Use este repositorio no Render como Web Service Node.

- Build command: `npm install`
- Start command: `npm start`
- Variaveis obrigatorias:
  - `DATABASE_URL`: URL do PostgreSQL.
  - `FRONTEND_URL`: URL do front na Vercel, por exemplo `https://seu-front.vercel.app`.
  - `DATABASE_SSL`: use `true` em bancos hospedados com SSL.

### Frontend na Vercel

Publique a pasta `frontend`.

Depois do backend estar no Render, edite `frontend/config.js`:

```js
window.PA_TRUFAS_API_URL = 'https://seu-backend.onrender.com/api';
```

Enquanto o Render acorda o servidor, o front mostra uma tela de loading e tenta carregar o cardapio novamente por alguns segundos.

## WhatsApp

O numero configurado no front e `+55 (14) 98836-0010`.

Cada trufa tem um link direto com a mensagem:

```text
opa!! gostaria de uma Nome da Trufa.
```

O carrinho monta uma mensagem com itens, quantidades e total.
