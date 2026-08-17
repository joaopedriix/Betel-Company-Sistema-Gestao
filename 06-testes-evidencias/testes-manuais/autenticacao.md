# Teste manual — Autenticação (login/logout, proteção de rota)

## Cenário 1 — Login de admin com credenciais válidas

**Pré-condições:** Projeto Supabase `betel-company` com `schema.sql`,
`policies.sql` e `grants.sql` aplicados; usuário `joaopedriix@gmail.com`
criado em `auth.users` e vinculado em `public.usuario` com `perfil='admin'`,
`ativo=true`.

**Passos:**
1. Acessar `/login`.
2. Preencher email e senha corretos.
3. Clicar em "Entrar".

**Resultado esperado:** Autentica e redireciona para `/dashboard` (home do
perfil admin).

**Resultado obtido:** Na primeira tentativa (2026-08-17), retornou "Conta
sem acesso habilitado. Contate o administrador." mesmo com o cadastro
correto — a autenticação no Supabase Auth funcionava (senha aceita), mas a
leitura de `public.usuario` falhava com `permission denied for table
usuario` (confirmado via API REST direta, fora do Next.js, para isolar a
causa). Causa: faltavam os `GRANT` de tabela para o role `authenticated`
(RLS decide linhas, não substitui o GRANT de tabela) — não vinham
automáticos porque o projeto foi criado com "Automatically expose new
tables" desligado. Corrigido aplicando `database/grants.sql`. Após a
correção, login funcionou e redirecionou para `/dashboard` corretamente.

**Status:** PASSOU (após correção). Ver `00-gestao/changelog.md`.

## Cenário 2 — Acesso a rota protegida sem sessão

**Status:** Coberto pela lógica de `src/lib/supabase/middleware.ts`
(redireciona para `/login` quando `!user` em rota protegida) — validado
por leitura de código; ainda não exercitado manualmente no navegador nesta
rodada. Marcar como pendência para a próxima sessão de testes.

## Cenário 3 — Sócio/cliente acessando rota de outro perfil

**Status:** NÃO EXECUTADO ainda — requer criar usuários de teste com
perfil `socio` e `cliente`. Pendência para quando a funcionalidade de
cadastro de usuários/sócios existir.
