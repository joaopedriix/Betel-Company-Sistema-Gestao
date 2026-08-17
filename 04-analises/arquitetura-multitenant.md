# Arquitetura multitenant — proposta técnica (não implementada)

> Análise + proposta pedida em 2026-08-17. **Nada aqui foi executado.**
> Schema, policies e código atuais continuam single-tenant até aprovação
> explícita e implementação em etapa separada. Decisão de produto (fazer
> multiempresa desde o MVP) já está confirmada — ver
> `04-analises/decisoes-do-mvp.md`; este documento é sobre o *como*.

---

## Parte 3 — Análise do schema/policies atuais

### Todas as tabelas existentes

`usuario`, `cliente`, `servico`, `checklist_modelo`, `tarefa_padrao`,
`evento`, `contrato`, `contrato_servico`, `tarefa_evento`,
`historico_tarefa`. Todas em `03-projeto-betel/database/schema.sql`.

### Tabelas que representam dados de negócio (todas, exceto nenhuma)

Todas as 10 são dados de negócio — não há tabela puramente de
configuração global do sistema hoje (nem catálogo compartilhado entre
empresas).

### Tabelas que precisarão de `tenant_id` (recomendação: todas as 10)

Ver justificativa completa na Parte 4. Resumo: mesmo tabelas que
"herdariam" o tenant por relacionamento (ex. `tarefa_evento` via
`evento_id`) devem ganhar a coluna direta, para RLS simples e auditável
em vez de RLS com joins profundos.

### Tabelas que podem ser globais

**Nenhuma**, no MVP. Não há hoje um conceito de "catálogo compartilhado
entre empresas" (ex. lista global de tipos de serviço) — cada empresa
cadastra os próprios `servico`, `checklist_modelo` etc. Se isso mudar no
futuro (ex. templates de checklist compartilhados por todas as
empresas), seria uma tabela nova `catalogo_publico`-like, fora de escopo
agora.

### Todas as foreign keys existentes

| Tabela | Coluna | Referencia | `ON DELETE` |
|---|---|---|---|
| `usuario` | `id` | `auth.users(id)` | `cascade` |
| `cliente` | `usuario_id` | `usuario(id)` | `set null` |
| `checklist_modelo` | `servico_id` | `servico(id)` | `cascade` |
| `tarefa_padrao` | `checklist_modelo_id` | `checklist_modelo(id)` | `cascade` |
| `tarefa_padrao` | `responsavel_padrao_id` | `usuario(id)` | `set null` |
| `evento` | `cliente_id` | `cliente(id)` | `cascade` |
| `contrato` | `cliente_id` | `cliente(id)` | `cascade` |
| `contrato` | `evento_id` | `evento(id)` | `cascade` |
| `contrato_servico` | `contrato_id` | `contrato(id)` | `cascade` |
| `contrato_servico` | `servico_id` | `servico(id)` | `restrict` |
| `tarefa_evento` | `evento_id` | `evento(id)` | `cascade` |
| `tarefa_evento` | `tarefa_padrao_id` | `tarefa_padrao(id)` | `set null` |
| `tarefa_evento` | `responsavel_id` | `usuario(id)` | `set null` |
| `tarefa_evento` | `concluida_por` | `usuario(id)` | `set null` |
| `historico_tarefa` | `tarefa_evento_id` | `tarefa_evento(id)` | `restrict` |
| `historico_tarefa` | `usuario_id` | `usuario(id)` | `set null` |

### Todas as policies atuais (23, em `policies.sql`)

`usuario_admin_all`, `usuario_self_select`, `cliente_admin_all`,
`cliente_self_select`, `cliente_socio_select`, `servico_admin_all`,
`servico_auth_select`, `checklist_modelo_admin_all`,
`tarefa_padrao_admin_all`, `evento_admin_all`, `evento_cliente_select`,
`evento_socio_select`, `contrato_admin_all`, `contrato_cliente_select`,
`contrato_socio_select`, `contrato_servico_admin_all`,
`contrato_servico_cliente_select`, `tarefa_evento_admin_all`,
`tarefa_evento_socio_select`, `tarefa_evento_socio_update`,
`tarefa_evento_cliente_select`, `historico_admin_select`,
`historico_socio_select`.

### Funções SQL relacionadas à autorização

`is_admin()`, `current_perfil()`, `current_cliente_id()` — todas
`SECURITY DEFINER`, em `policies.sql`. Mais os triggers
`fn_tarefa_evento_guard()` e `fn_log_tarefa_evento()` em `schema.sql`
(não são de autorização per se, mas aplicam regra de negócio que hoje
independe de tenant).

### Pontos onde o tenant do usuário é identificado

**Nenhum hoje.** Não existe o conceito de tenant no sistema atual — é
exatamente a lacuna que esta proposta cobre.

### Pontos que usam `auth.uid()`

Todas as 3 funções de autorização (`is_admin`, `current_perfil`,
`current_cliente_id`), todas as policies que checam posse de linha
(`responsavel_id = auth.uid()` em `tarefa_evento_socio_select/update`,
`historico_socio_select`), e o trigger `fn_tarefa_evento_guard` (para
saber o perfil de quem está executando a mutação).

### Pontos que usam `user_metadata`

**Nenhum.** Decisão de segurança já tomada (risco R1 do parecer de
segurança) — perfil sempre vem de `public.usuario`, nunca de
`user_metadata` (que o próprio usuário pode editar via
`supabase.auth.updateUser()`).

### Pontos que usam `service_role`

**Nenhum no código.** Ver auditoria completa na Parte 9 abaixo.

### Server Actions e APIs que acessam o banco

Só 2 existem hoje, ambas em `src/app/login/actions.ts`: `signIn`
(autentica + lê `public.usuario` para decidir o redirecionamento) e
`signOut`. Ambas usam `src/lib/supabase/server.ts`
(`createServerClient` com a **anon key**, nunca service_role). O
middleware (`src/lib/supabase/middleware.ts`) também só usa a anon key.
Nenhuma Server Action de escrita de dado de negócio existe ainda
(cadastros/contratos/tarefas não foram implementados — ver
`04-analises/auditoria-mvp.md`).

---

## Parte 4 — Modelo multitenant proposto

### Tabela de tenant: `empresa`

Sim, nova tabela `empresa` (nome em português, consistente com o resto
do schema — `usuario`, `cliente`, `servico`... nunca `users`/`clients`).
Colunas mínimas: `id uuid pk`, `nome text not null`, `ativo boolean
default true`, `created_at`, `updated_at`.

### Usuário: `tenant_id` direto, não tabela de associação (para o MVP)

**Recomendação: `usuario.empresa_id` direto (1 empresa por usuário)**,
não uma tabela `usuario_empresa` N:N. Motivo: o pedido pede a solução
"mais simples, segura e fácil de manter" para o MVP, e não há requisito
de negócio hoje pedindo que um sócio/gestor atenda duas empresas ao
mesmo tempo.

**Impacto de uma relação N:N (para quando for realmente necessária):**
- Precisaria de uma tabela `usuario_empresa (usuario_id, empresa_id,
  perfil)` — repare que **o perfil passaria a ser por empresa**, não
  global no usuário (um sócio numa empresa pode ser cliente em outra).
  Isso muda `usuario.perfil` de coluna fixa para algo lido via join.
- Precisaria de um conceito de **"empresa ativa" na sessão** (o usuário
  escolhe/alterna qual empresa está operando), normalmente guardado
  como claim customizada no JWT (`app_metadata`, nunca `user_metadata`)
  ou numa tabela de sessão — e todas as ~20 policies que hoje fariam
  `empresa_id = current_empresa_id()` precisariam que
  `current_empresa_id()` resolva "a empresa ativa desta sessão", não
  "a única empresa do usuário".
- Ou seja: N:N muda a *fonte da verdade do perfil* e adiciona um estado
  de sessão novo — é uma mudança arquitetural, não incremental. Recomendo
  não fazer isso agora; se precisar depois, é uma segunda migration
  isolada, não uma extensão trivial da proposta abaixo.

### Como o tenant atual é definido

Nova função `current_empresa_id()`, mesmo padrão de `current_perfil()`/
`current_cliente_id()` (SQL, `stable`, `security definer`, para evitar
recursão de RLS ao consultar `usuario`):

```sql
create or replace function public.current_empresa_id()
returns uuid
language sql stable security definer set search_path = public
as $$ select empresa_id from public.usuario where id = auth.uid() and ativo; $$;
```

### Vínculo do primeiro admin da Betel

1. `insert into empresa (nome) values ('Betel Company') returning id;`
   → guardar o `id` gerado (chamar de `<betel_id>`).
2. `update usuario set empresa_id = '<betel_id>' where id =
   '2f3d84b2-d723-457e-96fd-1c2d47b5f8d9';` (o usuário admin de teste já
   criado nesta sessão).

### Dados iniciais da Betel

Só o passo 1 acima — não há mais nenhum dado de negócio criado ainda
(nenhum cliente/serviço/evento/contrato real existe, ver
`04-analises/auditoria-mvp.md`), então não há backfill de dados de
negócio a fazer, só o vínculo do usuário.

### Quais entidades terão `empresa_id` direto

**Recomendação: todas as 10 tabelas**, mesmo as que logicamente
"herdam" o tenant por relacionamento (ex. `tarefa_evento` já sabe sua
empresa via `evento_id → evento.empresa_id`). Motivo: RLS com
`empresa_id = current_empresa_id()` direto, sem subquery/join, é mais
rápido, mais simples de revisar tabela por tabela ("essa tabela tem
`empresa_id`? sim/não" é um checklist trivial) e evita o erro mais comum
em apps multi-tenant — esquecer um join numa policy e vazar dado entre
empresas. Essa denormalização controlada (com FK garantindo
consistência) é o padrão já usado no MetaHub deste mesmo usuário
(`companyId` em toda tabela).

### Como evitar que um usuário altere o próprio `empresa_id`

Mesmo padrão já aplicado a `perfil` (risco R1 do parecer de segurança
anterior): **nenhuma policy de UPDATE para `authenticated` libera a
coluna `empresa_id`** em nenhuma tabela — só admin, via `_admin_all`
(que por sua vez também precisa ser restrita à própria empresa, ver
abaixo). Reforço adicional: trigger tipo `fn_tarefa_evento_guard` pode
ser generalizado para barrar `empresa_id is distinct from old.empresa_id`
em qualquer tabela sensível, como defesa em profundidade.

### Como impedir acesso a IDs de outro tenant

Toda policy de SELECT/UPDATE/DELETE ganha `and empresa_id =
current_empresa_id()`. Isso vale mesmo que o ID certo seja passado na
URL/API — RLS nega a linha no banco, independente do que o frontend
mandou (mesmo princípio já usado para isolar sócio/cliente hoje).

### ⚠️ Ponto crítico encontrado nesta análise: `is_admin()` precisa mudar

A function `is_admin()` atual retorna `true` para **qualquer** usuário
com `perfil='admin'`, **sem considerar empresa**. Se não for corrigida,
um admin da Empresa B veria/editaria dados de **todas** as empresas via
as policies `..._admin_all` (que usam `for all using (is_admin())`,
sem filtro de tenant). Correção proposta: toda policy `..._admin_all`
passa a ser `for all using (is_admin() and empresa_id =
current_empresa_id()) with check (is_admin() and empresa_id =
current_empresa_id())` — admin continua com acesso total, mas só dentro
do próprio tenant.

---

## Parte 5 — Policies propostas (por tabela)

Convenção: **C**onsultar / **I**nserir / **A**tualizar / **E**xcluir.
"Tenant" = `empresa_id = current_empresa_id()` sempre exigido junto com
a regra de perfil (nunca um substituindo o outro).

| Tabela | C | I | A | E |
|---|---|---|---|---|
| `usuario` | próprio registro (self) + admin (tenant) | só admin/sistema (criação via cadastro, tenant) | admin (tenant); nunca `perfil`/`empresa_id` via UPDATE de não-admin | admin (tenant), com cautela (afeta login) |
| `cliente` | self (cliente vê o próprio) + sócio (contexto, tenant) + admin (tenant) | admin (tenant) | admin (tenant) | admin (tenant) |
| `servico` | qualquer autenticado do tenant (leitura de catálogo) | admin (tenant) | admin (tenant) | admin (tenant) |
| `checklist_modelo` | admin (tenant) | admin (tenant) | admin (tenant) | admin (tenant) |
| `tarefa_padrao` | admin (tenant) | admin (tenant) | admin (tenant) | admin (tenant) |
| `evento` | cliente (self) + sócio (contexto) + admin, todos tenant | admin (tenant) | admin (tenant) | admin (tenant) |
| `contrato` | cliente (self) + sócio (contexto) + admin, todos tenant | admin (tenant) | admin (tenant) | admin (tenant) |
| `contrato_servico` | cliente (contexto do contrato) + admin, tenant | admin (tenant) | admin (tenant) | admin (tenant) |
| `tarefa_evento` | sócio (só a própria) + cliente (só pública) + admin, tenant | admin/sistema (tenant) | sócio (só a própria, colunas restritas por trigger) + admin (tenant) | admin (tenant), raro |
| `historico_tarefa` | sócio (só das próprias tarefas) + admin, tenant | ninguém via API — só trigger `SECURITY DEFINER` | ninguém | ninguém |

**Validação de tenant:** sempre `empresa_id = current_empresa_id()`,
coluna direta (Parte 4), nunca a partir de campo enviado pelo
frontend/URL — `current_empresa_id()` só lê do banco (`public.usuario`
pelo `auth.uid()` da sessão), então não há como o cliente forjar.

**Validação de perfil:** `current_perfil()` (já existe, sem mudança de
mecanismo) + `is_admin()` (mudando para incluir tenant, Parte 4).

**Acesso do sócio:** igual hoje (`responsavel_id = auth.uid()` em
`tarefa_evento`, propagado por join às tabelas relacionadas), **mais**
`empresa_id = current_empresa_id()` — dupla trava.

**Acesso do cliente:** igual hoje (`current_cliente_id()` +
`visivel_ao_cliente = true` em tarefas), **mais** `empresa_id =
current_empresa_id()`.

**Acesso do gestor:** `is_admin() and empresa_id =
current_empresa_id()` — acesso total, mas só dentro do próprio tenant.

### Evitar recursão/erro nas próprias policies

Mesma técnica já usada e validada nesta sessão: todas as funções de
apoio (`is_admin`, `current_perfil`, `current_cliente_id`,
`current_empresa_id`) são `SECURITY DEFINER` — rodam com o privilégio do
dono da função ao consultar `public.usuario`, então **não disparam a
própria RLS de `usuario`** de novo (o que causaria recursão infinita ou
negação incorreta). Isso já foi testado nesta sessão (login funcionando)
e o mesmo padrão se estende sem mudança de abordagem.

---

## Parte 9 — Auditoria de uso de `service_role`

| Arquivo | Função | Ocorre? |
|---|---|---|
| `src/lib/supabase/server.ts` | `createClient()` (Server Actions/Server Components) | **Não** — usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `src/lib/supabase/middleware.ts` | `updateSession()` | **Não** — usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `src/lib/supabase/client.ts` | `createClient()` (browser) | **Não** — usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` (correto, é client-side) |
| `src/app/login/actions.ts` | `signIn`, `signOut` | **Não** — usa o `createClient()` de `server.ts` acima |

**Conclusão: zero ocorrências de `service_role` em código-fonte hoje.**
A variável `SUPABASE_SERVICE_ROLE_KEY` existe só em `.env.example` (sem
valor) e em `.env.local` (não versionado, valor real só local) — nenhum
arquivo do repositório a importa ou usa. Isso é esperado: nenhuma Server
Action administrativa (ex. fechamento de contrato) foi escrita ainda.
Não há nada a substituir agora. Continua valendo o requisito já
registrado (R2 em `00-gestao/riscos.md`): quando essas Server Actions
existirem, usar o cliente com JWT do usuário sempre que a operação for
"em nome de alguém"; `service_role` só para tarefas de sistema puras.
