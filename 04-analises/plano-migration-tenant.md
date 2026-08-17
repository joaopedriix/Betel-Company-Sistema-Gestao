# Plano de migration multitenant

> ✅ **EXECUTADA em 2026-08-17**, contra o projeto Supabase real
> `betel-company`, via `psql` (session pooler, IPv4) rodando dentro de
> um Codespace dedicado. Transação única, `COMMIT` sem erros. Todas as
> 10 validações pós-migration passaram (ver
> `00-gestao/changelog.md`). O arquivo aplicado está em
> `03-projeto-betel/database/proposals/0002_multitenant.sql` — ainda não
> promovido para `database/` (fica pendente de decisão do usuário sobre
> renomear/mover, já que o conteúdo do `proposals/` foi o efetivamente
> executado, revisão 3, com 3 correções encontradas na revisão final:
> RLS/grant faltando em `empresa`, insert não idempotente, e troca de
> `is_admin()` solto por `is_admin_of(empresa_id)` + trigger de
> imutabilidade).
>
> Estratégia original (abaixo) mantida como registro do planejamento.

---

## Parte 6 — Migration proposta

### Nome sugerido

`0002_multitenant.sql` (o `schema.sql` atual seria conceitualmente
"0001" — schema inicial).

### Estratégia, em ordem

1. **Criar `empresa`** — tabela nova, independente, sem afetar nada
   existente.
2. **Inserir a Betel** — `insert into empresa (nome) values ('Betel
   Company') returning id`. Guardar o id retornado para os passos
   seguintes (na prática, dentro de uma única transação/bloco `do $$`,
   usando uma variável, para não depender de copiar/colar o UUID à mão).
3. **Adicionar `empresa_id` em todas as 10 tabelas, NULLABLE
   primeiro** — nunca `not null` na mesma instrução que cria a coluna,
   porque as tabelas já têm ou podem ter linhas (hoje só `usuario` tem 1
   linha real; as demais 0, mas a estratégia deve ser genérica e seguir
   sendo segura mesmo que isso mude antes de aplicar).
4. **Backfill** — `update <tabela> set empresa_id = '<betel_id>' where
   empresa_id is null`. Hoje isso afeta só `usuario` (1 linha, o admin
   de teste) — as outras 9 tabelas estão vazias, mas a instrução é
   idempotente e segura de rodar de qualquer forma.
5. **Tornar `empresa_id not null`** em todas as 10 tabelas, só depois do
   backfill confirmado sem `NULL` restante (checar com `select count(*)
   from <tabela> where empresa_id is null` = 0 antes de cada `alter
   column ... set not null`).
6. **Adicionar `foreign key (empresa_id) references empresa(id)`** em
   todas as 10 tabelas (pode já vir na criação da coluna, mas separado
   aqui por clareza do passo a passo).
7. **Índices** — `create index on <tabela> (empresa_id)` nas 10
   tabelas (todas as policies novas vão filtrar por essa coluna).
8. **Atualizar as funções de autorização** — `current_empresa_id()`
   (nova) e `is_admin()` (redefinida para considerar tenant, ver Parte
   4 de `arquitetura-multitenant.md`).
9. **Recriar as 23 policies** — `drop policy` de cada uma + `create
   policy` com a versão com filtro de tenant (Parte 5 do mesmo
   documento). Isso é reversível porque o texto das policies antigas
   continua em `database/policies.sql` no histórico do Git.
10. **Vincular o usuário admin de teste à Betel** — já coberto pelo
    backfill do passo 4, mas registrado aqui como checagem explícita
    final: `select empresa_id from usuario where email =
    'joaopedriix@gmail.com'` deve retornar o id da Betel.

### Novas tabelas

Só `empresa`.

### Novas colunas

`empresa_id uuid` em `usuario`, `cliente`, `servico`,
`checklist_modelo`, `tarefa_padrao`, `evento`, `contrato`,
`contrato_servico`, `tarefa_evento`, `historico_tarefa` (as 10).

### Foreign keys novas

`empresa_id → empresa(id)` nas mesmas 10 tabelas. `ON DELETE
RESTRICT` recomendado (não faz sentido apagar uma empresa em cascata
levando todo o histórico junto — mesmo raciocínio já aplicado a
`historico_tarefa` nesta sessão).

### Índices novos

`idx_<tabela>_empresa` em cada uma das 10 tabelas.

### Constraints

`empresa_id not null` (após backfill, passo 5). Nenhuma constraint de
unicidade nova necessária para o MVP.

### Valores padrão

Nenhum `DEFAULT` fixo na coluna (não existe "empresa padrão" do sistema
— cada INSERT futuro precisará informar `empresa_id` explicitamente,
normalmente derivado da sessão do usuário logado no código da
aplicação, nunca de um default de banco).

### Estratégia para preencher o tenant dos registros atuais

Ver passo 4 acima — hoje é trivial (só 1 linha real, em `usuario`).

### Estratégia para criar o tenant Betel

Ver passo 2.

### Estratégia para vincular o usuário de teste à Betel

Ver passos 2+4 (mesmo UPDATE de backfill já cobre isso, já que só existe
essa 1 linha em `usuario` hoje).

### Alterações nas policies

Todas as 23 recriadas com o filtro de tenant (Parte 5 de
`arquitetura-multitenant.md`). Nenhuma removida sem substituição, nenhuma
mantida sem o filtro novo (senão o isolamento fica incompleto).

### Alterações nas funções SQL (executado, revisão 3)

- `current_empresa_id()` — nova.
- `is_admin()` — mantida **sem** escopo de tenant (decisão da revisão
  final, diferente do plano original acima): reservada para uso
  genérico futuro, não é mais usada em nenhuma policy de tabela de
  negócio.
- `is_admin_of(p_empresa_id uuid)` — nova, substitui o padrão original
  "`is_admin() and empresa_id = current_empresa_id()`" repetido em cada
  policy. Faz as duas checagens numa única chamada, reduzindo o risco de
  uma policy futura esquecer o filtro de tenant.
- `fn_empresa_id_immutable()` — nova (trigger), bloqueia qualquer
  `UPDATE` que mude `empresa_id`, em qualquer perfil, defesa em
  profundidade além do `WITH CHECK` das policies.
- `current_perfil()`, `current_cliente_id()` — **sem alteração** nesta
  migration. `current_cliente_id()` ainda não tem filtro de tenant
  explícito (fica isolado hoje por `cliente.usuario_id` ser `UNIQUE`) —
  registrado como melhoria de defesa em profundidade para uma próxima
  revisão, não bloqueante.

### Possíveis impactos

- **Nenhum dado real perdido** — é uma migration aditiva (novas colunas
  nullable → backfill → not null), não destrutiva.
- **Login pode quebrar temporariamente** durante a janela entre criar a
  coluna `usuario.empresa_id` e rodar o backfill, **se** alguma policy
  nova já estiver ativa exigindo `empresa_id` antes do backfill
  terminar — por isso a ordem importa: só trocar as policies (passo 9)
  depois do backfill (passo 4) e do `not null` (passo 5) confirmados.
- **Nenhuma Server Action existente quebra** — não há nenhuma hoje que
  faça INSERT/UPDATE de dado de negócio (ver Parte 3, "Server Actions e
  APIs"), então não há código de aplicação para ajustar a `empresa_id`
  ainda. Isso é o melhor momento possível para essa migration (antes de
  existir lógica de negócio para reescrever).

### Plano de rollback (re-verificado após a execução, 2026-08-17)

O usuário pediu confirmação explícita de 4 pontos antes de considerar o
rollback seguro — respondidos abaixo, um a um:

**1. As policies antigas estão preservadas no Git?** Sim. O `policies.sql`
pré-migration está intacto no commit `5bc20bd` (e em todos os anteriores)
— `git show 5bc20bd:03-projeto-betel/database/policies.sql` reproduz as
23 policies originais (sem `empresa_id`) exatamente como estavam antes.
Este arquivo **não foi sobrescrito** pela migration (que só existe em
`database/proposals/0002_multitenant.sql`), então não há necessidade de
"recuperar do histórico" — o texto já está disponível no arquivo atual
do repositório.

**2. Pode ser revertida sem apagar dados?** Sim, com uma ressalva: como
a migration foi aditiva (nenhuma coluna/tabela antiga foi removida), um
rollback via `DROP COLUMN empresa_id` / `DROP TABLE empresa` não apaga
nenhum dado das 10 tabelas originais — só remove a informação de tenant
que foi adicionada. A ressalva: se, entre a migration e o rollback,
qualquer dado de negócio novo for criado (ex.: um cliente cadastrado),
esse dado é apagado junto se o rollback incluir `DROP COLUMN empresa_id`
sem antes migrar esses dados para fora — não é o caso agora (login
validado logo após a migration, nenhum dado novo criado no meio).

**3. O rollback não deixa RLS desativado?** Correto, e é importante
frisar a ordem certa: um rollback **parcial** (só `DROP POLICY` das
novas, sem `CREATE POLICY` das antigas) deixaria as tabelas com RLS
**habilitado mas sem policy nenhuma** — que é *mais* restritivo (nega
tudo), nunca "desativado" (RLS continua `ENABLE`/`FORCE`, não é tocado
pelo rollback de policies). Ainda assim, isso quebraria o sistema
inteiro (ninguém acessaria nada). Por isso o rollback **correto e
completo** é: recriar as policies antigas **antes ou na mesma transação**
de remover as novas, nunca deixar uma janela sem nenhuma policy.

**4. A restauração pode ser feita em ordem segura?** Sim — dentro de uma
única transação (`BEGIN`...`COMMIT`), a ordem entre passos não importa
para quem está fora da transação (ninguém vê estado intermediário,
mesmo raciocínio da Parte 6 desta migration). Ordem recomendada, por
clareza:
1. `DROP POLICY` das 23 policies atuais (com `is_admin_of`) + a nova
   `empresa_self_select`.
2. `CREATE POLICY` das 23 originais (texto exato em
   `03-projeto-betel/database/policies.sql`, já no repositório).
3. `DROP TRIGGER` dos 10 triggers de imutabilidade +
   `DROP FUNCTION fn_empresa_id_immutable()`.
4. `ALTER TABLE ... DROP COLUMN empresa_id` nas 10 tabelas (o `DROP
   COLUMN` já remove a FK e o índice associados automaticamente).
5. `DROP FUNCTION current_empresa_id()`, `DROP FUNCTION is_admin_of(uuid)`.
   `is_admin()` não precisa reverter — foi re-declarada com
   `CREATE OR REPLACE` mas o corpo é **idêntico** ao original (nenhuma
   mudança funcional, confirmado comparando com `policies.sql`).
6. `DROP TABLE empresa` (arrasta a policy `empresa_self_select` e o
   trigger `trg_empresa_updated` junto, se ainda não removidos).

Risco do rollback: **baixo** — sem dados de negócio reais criados desde
a migration (confirmado pela contagem de linhas ainda ser a mesma:
1 usuário, 0 nas demais 9 tabelas + a nova `empresa` com 1 linha).

---

## Parte 7 — Plano de migração dos dados atuais

- **Como criar a empresa Betel:** passo 2 da Parte 6.
- **Como associar o usuário administrador:** passo 4 (backfill) —
  único usuário existente (`joaopedriix@gmail.com`, admin).
- **Como preencher o tenant nos registros existentes:** não há
  registros de negócio ainda (nenhum cliente/serviço/evento/contrato/
  tarefa foi criado via aplicação — ver `04-analises/auditoria-mvp.md`,
  seção 5). O backfill do passo 4 é, na prática, um único UPDATE em uma
  única linha da tabela `usuario`.
- **O que fazer com registros sem usuário responsável:** não aplicável
  hoje (nenhum registro órfão existe — schema tem `ON DELETE SET NULL`
  em `responsavel_id`/`concluida_por`, mas isso nunca ocorreu porque não
  há tarefas ainda).
- **Como validar registros órfãos:** rodar, antes de marcar
  `empresa_id not null`, um `select count(*) from <tabela> where
  empresa_id is null` em cada uma das 10 tabelas — deve dar 0 antes de
  prosseguir para o passo 5 da Parte 6.
- **Como garantir que nenhum registro fique sem tenant:** a ordem da
  Parte 6 (nullable → backfill → validar count=0 → not null) torna isso
  estrutural, não uma checagem manual esquecível.
- **Como reverter a operação:** Parte 6, "Plano de rollback".

**Momento ideal para executar:** agora, antes da Fase 5 gerar qualquer
dado de negócio real — quanto mais dados existirem depois, mais
complexo fica o backfill.
