# Projeto Barbearia — Instruções de execução e deploy

Este repositório contém um backend simples em Node.js/Express que serve um frontend estático em `public/` e expõe uma API para agendamentos. O servidor já tem suporte opcional a PostgreSQL via a variável de ambiente `DATABASE_URL`.

## O que inclui
- `src/server.js` — servidor Express com rotas: `/api/horarios-disponiveis`, `/api/agendar`, `/api/agendamentos`.
- `src/public/` — frontend estático (index.html, admin.html, etc.).

---

## Requisitos
- Node.js 14+ e npm
- (Opcional) PostgreSQL se quiser persistência real. Você pode usar um serviço gerenciado (Render, Railway, ElephantSQL) ou rodar localmente com Docker.

---

## Rodando localmente (modo rápido, sem banco)
1. Abra um terminal na raiz do projeto (`c:\Projetos\UNIVESP-P.I.-2`).
2. Instale dependências:

```powershell
npm install
```

3. Inicie o servidor:

```powershell
npm start
# ou
# node src/server.js
```

4. Abra no navegador: http://localhost:3000

Observação: sem `DATABASE_URL` definido o servidor usa um armazenamento em memória (perdido ao reiniciar).

---

## Rodando com PostgreSQL local (Docker)
1. Rode um container PostgreSQL (exemplo):

```powershell
docker run --name pg-univesp -e POSTGRES_USER=univesp -e POSTGRES_PASSWORD=senha -e POSTGRES_DB=univesp -p 5432:5432 -d postgres
```

2. Defina a variável de ambiente `DATABASE_URL` (PowerShell):

```powershell
$env:DATABASE_URL = "postgres://univesp:senha@localhost:5432/univesp"
npm start
```

O servidor tentará conectar usando `DATABASE_URL`, criará a tabela `agendamentos` se necessário e passará a salvar/ler do Postgres.

---

## Deploy rápido (Railway ou Render) — visão geral

Passos gerais (aplicáveis a Render, Railway, e similares):

1. Suba o repositório para o GitHub.
2. No painel do provedor (Railway/Render):
   - Crie um novo projeto / Web Service e conecte ao repositório.
   - Configure o comando de start como `npm start` (já presente em `package.json`).
   - Adicione/Crie um banco PostgreSQL gerenciado e copie a `DATABASE_URL` fornecida.
   - Configure a variável de ambiente `DATABASE_URL` na configuração do serviço (o provedor geralmente faz isso automaticamente quando você cria o banco no mesmo projeto).
3. Faça deploy. O provedor dará uma URL pública (por exemplo `https://meu-app.onrender.com`).

Notas específicas:
- Railway: crie um novo projeto e adicione o plugin PostgreSQL; ele cria `DATABASE_URL` automaticamente.
- Render: crie um serviço Web apontando para o repo; crie um PostgreSQL dentro do mesmo account e configure a env var.

---

## Exemplos de variáveis de ambiente
Exemplo de `DATABASE_URL`:

```
# Projeto Barbearia — Instruções de execução e melhorias

Este repositório contém um backend simples em Node.js/Express que serve um frontend estático em `public/` e expõe uma API para agendamentos.

## 1) Rodando localmente (passo-a-passo — Windows PowerShell)

Passos mínimos para clonar e rodar o projeto localmente, sem necessidade de banco de dados:

1. Clone o repositório e entre na pasta do projeto:

```powershell
git clone https://github.com/SEU-ORGANIZACAO/SEU-REPO.git
cd SEU-REPO
```

2. Instale dependências (na raiz do projeto):

```powershell
npm install
```

3. Inicie o servidor:

```powershell
npm start
# ou
# node src/server.js
```

4. Abra o navegador em:

- Página pública: http://localhost:3000
- Painel admin: http://localhost:3000/admin.html

Observação: sem `DATABASE_URL` definido o servidor usa armazenamento em memória (dados perdidos ao reiniciar). Esse modo é suficiente para testar a interface e as APIs localmente.

---

## Como o servidor funciona (resumo rápido)
- O servidor principal está em `src/server.js`.
- Arquivos estáticos (frontend) são servidos a partir de `src/public`.
- Rotas principais da API:
   - GET `/api/horarios-disponiveis?data=YYYY-MM-DD`
   - POST `/api/agendar` (JSON: { nome, telefone, data, hora })
   - GET `/api/agendamentos?data=YYYY-MM-DD`

---

## Melhorias adicionais (Docker e banco de dados)
As instruções acima são suficientes para testes rápidos. Abaixo estão opções opcionais para um ambiente mais próximo da produção.

### Rodando com PostgreSQL (ex.: via Docker)
1. Inicie um container PostgreSQL (exemplo):

```powershell
docker run --name pg-univesp -e POSTGRES_USER=univesp -e POSTGRES_PASSWORD=senha -e POSTGRES_DB=univesp -p 5432:5432 -d postgres
```

2. Defina a variável de ambiente `DATABASE_URL` apontando para o container e inicie o app:

```powershell
$env:DATABASE_URL = "postgres://univesp:senha@localhost:5432/univesp"
npm start
```

O `server.js` detecta `DATABASE_URL` automaticamente, conecta ao banco e cria a tabela `agendamentos` se necessário.

### Docker Compose (opcional, recomendado para padronizar o ambiente)
Você pode padronizar o ambiente criando um `docker-compose.yml` (exemplo):

```yaml
version: '3.8'
services:
   db:
      image: postgres:15
      environment:
         POSTGRES_USER: univesp
         POSTGRES_PASSWORD: senha
         POSTGRES_DB: univesp
      ports:
         - '5432:5432'
   app:
      image: node:18
      working_dir: /usr/src/app
      volumes:
         - ./:/usr/src/app
      command: sh -c "npm install && npm start"
      environment:
         DATABASE_URL: postgres://univesp:senha@db:5432/univesp
      ports:
         - '3000:3000'
      depends_on:
         - db
```

Para subir com Docker Compose:

```powershell
docker-compose up --build
```

---

## Variáveis de ambiente úteis
- `DATABASE_URL` — string de conexão com PostgreSQL (ex: `postgres://user:pass@host:5432/dbname`)
- `PORT` — porta em que o servidor deve escutar (padrão: 3000)

---

## Contrato rápido da API
- GET `/api/horarios-disponiveis?data=YYYY-MM-DD` -> lista de horários disponíveis
- POST `/api/agendar` -> body JSON { nome, telefone, data: "YYYY-MM-DD", hora: "HH:MM" }
- GET `/api/agendamentos?data=YYYY-MM-DD` -> lista de agendamentos do dia

Exemplo com curl:

```bash
curl "http://localhost:3000/api/horarios-disponiveis?data=2025-10-31"

curl -X POST http://localhost:3000/api/agendar -H "Content-Type: application/json" -d '{"nome":"João","telefone":"11999998888","data":"2025-10-31","hora":"10:00"}'
```

---

## Troubleshooting rápido
- `npm install` falha: verifique sua versão do Node (`node -v`). Recomendo Node 16+ ou 18+.
- `Cannot GET /`: execute `npm start` a partir da raiz do repositório. Também funciona `node src/server.js`.
- Porta em uso: rode `setx PORT 4000` (Windows) ou em PowerShell temporariamente `$env:PORT = "4000"` antes de `npm start`.
- `ECONNREFUSED` ao conectar no Postgres: verifique se o container/db está rodando (`docker ps`) e se credenciais/host/porta estão corretos.

---

## Próximos passos recomendados
- Adicionar uma `UNIQUE` constraint para `(data_agendamento, hora)` e tratar a violação no servidor (retornar 409 Conflict).
- Adicionar `dotenv` para facilitar variáveis locais e um `.env.example` (já há um `.env.example` no repo).
- Adicionar `docker-compose.yml` ao repo para facilitar a reprodução do ambiente (posso criar se desejar).

---

Se quiser, eu posso automaticamente:
- adicionar `docker-compose.yml` e `Dockerfile` ao repositório,
- adicionar instruções específicas para macOS/Linux,
- criar um script `make` ou `npm run local` que configure o ambiente e rode tudo.

Diga qual desses você prefere que eu adicione agora.
