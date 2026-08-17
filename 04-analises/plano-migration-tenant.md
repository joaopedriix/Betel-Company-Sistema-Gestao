# Plano de migration multitenant (proposto, NÃO executado)

> Estratégia explicada primeiro, SQL de proposta depois — conforme
> pedido. O arquivo de migration fica em
> `03-projeto-betel/database/proposals/0002_multitenant.sql`, **fora**
> do fluxo de deploy (a pasta `database/` raiz continua sendo a fonte
> aplicada; `proposals/` é só para revisão).

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

### Alterações nas funções SQL

`is_admin()` — redefinida (`create or replace`, sem quebrar
compatibilidade de assinatura) para checar `empresa_id =
current_empresa_id()` também. `current_empresa_id()` — nova.
`current_perfil()`, `current_cliente_id()` — sem mudança de assinatura,
mas revisar se `current_cliente_id()` precisa de filtro de tenant
também (hoje já é implicitamente isolado porque `cliente.usuario_id` é
`unique`, mas ao adicionar `empresa_id` em `cliente`, considerar se vale
adicionar `and empresa_id = current_empresa_id()` na função por defesa
em profundidade — recomendado, custo baixo).

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

### Plano de rollback

Como tudo é aditivo:
1. `drop policy` das novas versões, `create policy` das antigas
   (mantidas em `database/policies.sql` no histórico do Git — `git show
   <commit-antes>:03-projeto-betel/database/policies.sql`).
2. `alter table <tabela> drop column empresa_id` nas 10 tabelas.
3. `drop table empresa`.
4. `drop function current_empresa_id()`, reverter `is_admin()` para a
   versão anterior (também no histórico do Git).

Risco do rollback: **baixo** — sem dados de produção reais, sem Server
Actions dependendo da coluna nova ainda.

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
