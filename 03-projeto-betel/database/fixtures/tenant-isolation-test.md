# Fixture — teste de isolamento multitenant

> **Exclusivo para ambiente de teste.** Não roda automaticamente em
> nenhum pipeline. Não contém credenciais reais, tokens, nem e-mails
> reais. Nomes e e-mails usam o domínio reservado `example.com` (RFC
> 2606) com sufixo `.fixture`, claramente marcados como teste.
>
> Não misturar com seeds reais da Betel — este fixture fica isolado em
> `database/fixtures/`, separado de `database/schema.sql`,
> `policies.sql`, `grants.sql` (fonte real aplicada) e
> `database/proposals/` (migrations propostas/aplicadas).

## O que este fixture reproduz

Os 27 testes de isolamento executados em 2026-08-17 (ver
`04-analises/testes-isolamento-tenant.md`) — um segundo tenant fictício
("Empresa B — Teste") com dados de negócio mínimos, mais 2 usuários
fictícios (sócio e cliente-login) dentro do tenant principal, para
comparar isolamento tanto **entre** tenants quanto **dentro** do mesmo
tenant (sócio×sócio, cliente×cliente).

## Passo a passo para reproduzir

1. **Criar as 5 contas de teste no Supabase Auth** via Admin API
   (nunca pelo SQL Editor — `auth.users` não é acessível por INSERT
   direto com segurança). Exemplo com `curl` (rode localmente, nunca
   commite a `service_role` key):
   ```bash
   curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
     -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     -d '{"email":"socio.teste.fixture@example.com","password":"<gerar-senha-aleatoria>","email_confirm":true}'
   ```
   Repita para os 5 e-mails usados em `seed-tenant-isolation.sql`
   (`socio.teste.fixture@example.com`,
   `cliente.teste.fixture@example.com`,
   `admin.teste.empresab.fixture@example.com`,
   `socio.teste.empresab.fixture@example.com`,
   `cliente.teste.empresab.fixture@example.com`). Anote os `id` (UUID)
   retornados.
2. **Preencher os UUIDs** no topo do `do $$ ... $$` de
   `seed-tenant-isolation.sql` (variáveis `p_*_id`), e confirmar
   `p_tenant_principal_nome` (padrão: `'Betel Company'`).
3. **Rodar o seed** contra o banco de teste (nunca produção sem
   revisar):
   ```bash
   psql "$CONNECTION_STRING" -v ON_ERROR_STOP=1 -f database/fixtures/seed-tenant-isolation.sql
   ```
4. **Rodar os testes de isolamento** — fazer login com cada uma das 5
   contas + a conta admin real do tenant principal, e repetir a matriz
   de 27 casos descrita em `04-analises/testes-isolamento-tenant.md`
   (grupos: usuários, troca de ID por URL/API, inserção/atualização
   maliciosa, por perfil).
5. **Limpar** — rodar `cleanup-tenant-isolation.sql`, depois remover as
   5 contas do Supabase Auth via Admin API (`DELETE
   /auth/v1/admin/users/<id>`).

## Regras deste fixture

- Não executar automaticamente em produção.
- Não conter credenciais reais nem tokens (as senhas são geradas na hora
  da criação, nunca hardcoded aqui).
- Não usar e-mails reais — sempre `*.fixture@example.com`.
- Sempre rodar a limpeza (`cleanup-tenant-isolation.sql` + remoção das
  contas de Auth) depois dos testes, para não deixar dados de teste
  acumulando no banco.
