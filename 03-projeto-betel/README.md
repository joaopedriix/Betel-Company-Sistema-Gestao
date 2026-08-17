# Betel Company — Sistema de Gestão (aplicação)

Aplicação web do sistema de gestão do grupo Betel (eventos, agenda, checklists,
contratos e portal do cliente). Esta pasta (`03-projeto-betel/`) é a raiz do
código-fonte. O contexto de negócio e as decisões técnicas ficam nas pastas
irmãs do repositório (`00-gestao/`, `01-documentacao/`).

> Status: **scaffold inicial**. Existem apenas telas placeholder ("em
> construção") para as rotas planejadas. Nenhuma lógica de negócio, banco de
> dados ou autenticação foi implementada ainda.

## Requisitos

- Node.js 20 ou superior (testado com Node 24)
- npm 10 ou superior
- Uma conta/projeto no [Supabase](https://supabase.com) (para preencher as
  variáveis de ambiente quando a autenticação/banco forem implementados)

## Instalação

```bash
cd 03-projeto-betel
npm install
```

## Configuração

As variáveis de ambiente ficam em `.env.local` (nunca versionado). Use o
`.env.example` como modelo:

```bash
cp .env.example .env.local
```

Preencha em `.env.local`:

| Variável | Descrição | Exposta ao browser? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (secreta) | **Não** — só server-side |

Nunca comite `.env` ou `.env.local`. Apenas `.env.example` é versionado.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o servidor de desenvolvimento (Turbopack) |
| `npm run build` | Gera o build de produção (`next build`) |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | Roda o lint do Next.js |

## Como executar

```bash
npm run dev
```

Acesse http://localhost:3000. A página inicial lista todas as rotas
planejadas. As rotas atuais são placeholders:

`/login`, `/dashboard`, `/clientes`, `/usuarios`, `/servicos`, `/checklists`,
`/contratos`, `/eventos`, `/minhas-tarefas`, `/portal-cliente`.

## Como testar

### Autenticação (login/logout e proteção de rota)

O fluxo de login está implementado (Supabase Auth via `signInWithPassword`,
middleware de sessão em `src/middleware.ts`, proteção de rota por perfil) e
**testado de ponta a ponta em 2026-08-17** contra um projeto Supabase real
(`betel-company`, região São Paulo): login como admin redirecionou
corretamente para `/dashboard`.

Passos para reproduzir em outro ambiente:

1. Criar um projeto no Supabase e preencher `.env.local` (veja `.env.example`)
   com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Aplicar, nesta ordem: `database/schema.sql` → `database/policies.sql` →
   `database/grants.sql`. **O terceiro passo é fácil de esquecer**: RLS
   decide quais linhas um usuário vê, mas o Postgres exige GRANT de
   privilégio na tabela separadamente — sem ele, toda query falha com
   "permission denied for table X" mesmo com a policy certa (foi exatamente
   o bug encontrado e corrigido no primeiro teste real, ver
   `00-gestao/changelog.md`).
3. Criar pelo menos um usuário em `auth.users` (via painel do Supabase ou
   `auth.admin`) e inserir a linha correspondente em `public.usuario` com o
   mesmo `id`, definindo `perfil` (`admin`/`socio`/`cliente`) e `ativo = true`.
   Sem essa linha, o login autentica mas é recusado (conta sem acesso).
4. `npm run dev` e acessar `/login`. Após entrar, cada perfil é redirecionado à
   sua home (admin → `/dashboard`, sócio → `/minhas-tarefas`,
   cliente → `/portal-cliente`) e só acessa as rotas do seu perfil.

O perfil é sempre lido de `public.usuario` (nunca de `user_metadata`) e todas as
leituras usam o cliente Supabase autenticado com o JWT do usuário — nunca a
`service_role` (requisito R2 de `00-gestao/riscos.md`).

### Testes automatizados

Ainda **não há testes** neste projeto. A estratégia planejada (ver
`00-gestao/decisoes-tecnicas.md`) é Vitest para regras de negócio e Playwright
para o fluxo crítico (fechamento de contrato → checklist → conclusão de
tarefa). Os testes ficarão em `tests/` e as evidências em
`../06-testes-evidencias/`.

## Estrutura principal

```
03-projeto-betel/
├── src/
│   ├── app/                 # App Router (uma pasta por rota + page.tsx)
│   │   ├── layout.tsx        # layout raiz + fonte
│   │   ├── globals.css       # Tailwind v4 + tokens do shadcn/ui
│   │   ├── page.tsx          # home (índice das rotas)
│   │   └── <rota>/page.tsx   # stubs "em construção"
│   ├── components/
│   │   ├── em-construcao.tsx  # placeholder reutilizado pelos stubs
│   │   └── ui/               # componentes do shadcn/ui
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts      # cliente Supabase (browser)
│       │   └── server.ts      # cliente Supabase (server, via cookies)
│       └── utils.ts          # helper cn() do shadcn/ui
├── public/                  # arquivos estáticos
├── tests/                   # testes (ainda vazio)
├── .env.example             # modelo de variáveis (sem valores reais)
├── components.json          # config do shadcn/ui
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (base-color neutral)
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) — clientes browser e
  server já configurados; auth/banco ainda não implementados

## Problemas conhecidos / pendências

- Sem testes automatizados ainda.
- Autenticação implementada (login/logout + proteção de rota por perfil), mas
  ainda **sem** um projeto Supabase real para testar de ponta a ponta (ver
  "Como testar"). Cadastros, contratos e demais lógicas de negócio continuam
  como telas placeholder.
- Middleware de sessão do Supabase (`updateSession`) implementado em
  `src/middleware.ts` (fica em `src/` porque o App Router está sob `src/app`).
  Nota: o Next.js 16.3 renomeou a convenção `middleware` para `proxy` e emite um
  aviso de depreciação no build; a migração é opcional e não bloqueia.
- O schema do banco está sendo desenvolvido separadamente em
  `03-projeto-betel/database/` (responsabilidade do agente de arquitetura).
- Variáveis de ambiente obrigatórias precisam ser preenchidas antes de qualquer
  build de produção que dependa do Supabase em tempo de request.
