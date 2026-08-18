# Riscos de segurança — parecer sobre a estratégia de RLS (pré-implementação)

> Parecer de segurança (SaaS) sobre a **proposta** de `decisoes-tecnicas.md`
> (Next.js + Supabase, RLS como mecanismo de autorização). Emitido em
> 2026-08-17, antes da implementação. O schema ainda não existe em
> `03-projeto-betel/database/` (apenas `.gitkeep`), então a avaliação é da
> estratégia; cada risco vira um item de verificação quando o SQL for escrito.
>
> Contexto de isolamento: **não** é multi-empresa. O isolamento exigido é
> (a) entre sócios (cada sócio só vê a própria tarefa) e (b) entre clientes
> (cada cliente só vê o próprio evento/contrato, e só o que é público).

## Status de mitigação (revisão do schema real, 2026-08-17)

Schema/policies entregues em `03-projeto-betel/database/{schema.sql,policies.sql}`
foram revisados contra R1–R9:

- **R1 (auto-escalação de perfil):** RESOLVIDO. Não existe policy de
  UPDATE em `usuario` para não-admin — RLS default-deny bloqueia.
- **R2 (`service_role` burla RLS):** NÃO É RESOLVÍVEL EM SQL — depende do
  código do Next.js. Repassar como requisito obrigatório ao
  `saas-developer`: server actions que leem/escrevem dado escopado por
  usuário devem usar o cliente Supabase autenticado com o JWT do usuário
  (`@supabase/ssr`), nunca a `service_role`.
- **R3 (escrita de histórico pelo usuário):** RESOLVIDO. Sem policies de
  INSERT/UPDATE/DELETE para `authenticated`; escrita só via trigger
  `SECURITY DEFINER`.
- **R4 (RLS sem FORCE):** RESOLVIDO em 2026-08-17 — adicionado
  `FORCE ROW LEVEL SECURITY` em todas as tabelas em `policies.sql`.
- **R5/R6 (sócio altera coluna sensível / reabre sozinho):** RESOLVIDO via
  trigger `fn_tarefa_evento_guard` (bloqueia troca de `responsavel_id`,
  `visivel_ao_cliente` e reabertura por não-admin).
- **R7 (resquício `anon`):** RESOLVIDO. Nenhuma policy para `anon`.
- **R8 (cascade apaga histórico):** RESOLVIDO em 2026-08-17 — FK de
  `historico_tarefa` alterada de `ON DELETE CASCADE` para
  `ON DELETE RESTRICT` em `schema.sql`: qualquer tentativa de excluir uma
  tarefa (ou, em cascata, seu evento/contrato) que já tenha histórico
  falha, em vez de apagar o audit trail.
- **R9 (vínculo cliente↔usuario frouxo):** RESOLVIDO. `cliente.usuario_id`
  é `UNIQUE`; policy de `tarefa_evento` para cliente já exige posse do
  evento **e** `visivel_ao_cliente = true`.

**Pendência real de produto criada por este schema:** ele assume
cliente 1:N evento (um cliente pode ter vários eventos) — a pendência
"Se haverá clientes com mais de um evento" em `00-gestao/pendencias.md`
foi respondida na prática pela modelagem; confirmar com o usuário se isso
está correto.

**Conclusão:** dos 4 riscos bloqueantes (R1–R4), todos os resolvíveis em
SQL estão fechados. R2 é um requisito de implementação a ser cobrado do
`saas-developer` antes de aceitar qualquer server action como pronta.

## Status (parecer original, antes da revisão acima)

**BLOQUEANTE.** A estratégia "RLS por `auth.uid()` cruzado com perfil e
responsável" é adequada em princípio e resolve o IDOR de leitura, **mas há 4
pontos que, se não forem definidos antes de codar, tornam o RLS ineficaz ou
contornável**. Não liberar a implementação do schema sem fechar R1–R4.

O RLS só protege se **todas** estas condições valerem ao mesmo tempo:
1. as requisições do usuário rodam com a **chave/JWT do usuário** (RLS ativo),
   nunca com a `service_role` key;
2. RLS está **habilitado (e FORCE)** em todas as tabelas sensíveis;
3. a **fonte do perfil** não é gravável pelo próprio usuário;
4. colunas sensíveis (`perfil`, `responsavel_id`, `visivel_ao_cliente`) não
   são atualizáveis pelo usuário, mesmo na própria linha.

RLS protege **linha**, não **coluna**: uma policy de UPDATE que libera a linha
libera *todas as colunas dela* salvo restrição explícita. É daí que saem as
escaladas abaixo.

---

## R1 — Auto-escalação de perfil (admin/socio/cliente) — CRÍTICO / BLOQUEANTE

**Cenário concreto:** o campo `usuario.perfil` decide tudo. Se a tabela
`usuario` tiver uma policy de UPDATE do tipo "usuário edita a própria linha"
(`auth.uid() = usuario_id`) — o que é natural para "editar meu nome/contato" —
então um sócio ou cliente manda `UPDATE usuario SET perfil='admin' WHERE
usuario_id = <o meu>` pela API PostgREST do Supabase (basta o SDK do cliente e
o token dele; não precisa passar pela UI). Vira admin. **Escalada total.**

Vetor gêmeo: se as policies lerem o perfil de `auth.jwt() ->
'user_metadata'`, pior ainda — `user_metadata` é **gravável pelo próprio
usuário** via `supabase.auth.updateUser()`. Forjar `perfil: admin` é trivial.

**Correção exigida (repassar ao architect/developer):**
- O perfil **não** pode viver num campo que o usuário consiga dar UPDATE.
  Opções aceitáveis: (a) revogar o privilégio de UPDATE **na coluna** `perfil`
  para o role `authenticated` (GRANT de coluna do Postgres) e trocar perfil só
  via `service_role`/função `SECURITY DEFINER` restrita a admin; ou (b) guardar
  o papel em `auth.users.raw_app_meta_data` (**app_metadata**, que só o backend
  grava) e lê-lo nas policies via `auth.jwt() -> 'app_metadata' -> 'perfil'`.
- **Nunca** derivar autorização de `user_metadata`.
- Se as policies consultarem `usuario.perfil` por subquery, essa tabela
  precisa estar coberta por (a).

## R2 — Server action com `service_role` burla o RLS inteiro — CRÍTICO / BLOQUEANTE

**Cenário concreto:** a `service_role` key do Supabase **ignora RLS por
design**. É comum, em Next.js, o cliente Supabase do lado servidor ser
instanciado com a `service_role` key "porque é backend". Se as server actions
que servem dados do sócio/cliente usarem essa chave e filtrarem por
`responsavel_id`/`cliente_id` **em código de aplicação** a partir de um valor
que veio do request, então: o RLS não roda, e voltamos exatamente ao
anti-padrão que a doc de regras proíbe ("filtrar só no backend/app"). Um
parâmetro trocado (`responsavel_id` de outro sócio, `evento_id` de outro
cliente) vaza dado — IDOR de novo, agora sem rede de proteção.

**Correção exigida:**
- Requisições **em nome do usuário** (leitura de tarefas, portal do cliente,
  mutação de status) devem usar um cliente Supabase autenticado com o **JWT do
  usuário logado** (SSR helper do `@supabase/ssr`), para que `auth.uid()`
  resolva e o RLS se aplique.
- A `service_role` key fica restrita a operações administrativas de sistema
  (geração de tarefas no fechamento de contrato, escrita de histórico — ver
  R3), **nunca** para servir dados escopados por usuário, e o `companyId`/
  responsável/cliente **derivam da sessão**, jamais do body/query.
- A `service_role` key nunca pode chegar ao bundle do cliente (só server).

## R3 — Escrita de `historico_tarefa` pelo cliente quebra o audit trail — ALTO / BLOQUEANTE

**Cenário concreto:** o histórico deve ser **somente leitura** para sócio e
cliente (regra de negócio: registra quem concluiu/reabriu/trocou prazo e
"nunca excluir"). Se o app inserir histórico a partir do cliente com o token
do usuário e a tabela tiver policy de INSERT/UPDATE/DELETE para
`authenticated`, um sócio pode: forjar uma entrada ("concluída por
<fulano>"), apagar o registro que o incrimina, ou reescrever um `detalhe`.
O audit trail deixa de ser confiável — e ele é a evidência de tudo.

**Correção exigida:**
- `historico_tarefa`: **sem** policy de INSERT/UPDATE/DELETE para
  `authenticated`; apenas SELECT (e mesmo o SELECT do cliente restrito, ver
  R9). A escrita ocorre **só** via trigger `AFTER` nas mutações de
  `tarefa_evento` (recomendado, garante consistência) ou via server action com
  `service_role`. Tabela append-only na prática.
- Reforço em nível de tabela: negar `DELETE`/`UPDATE` a `authenticated`.

## R4 — RLS não habilitado / sem default-deny em alguma tabela — ALTO / BLOQUEANTE

**Cenário concreto:** o vazamento mais comum em Supabase é esquecer
`ENABLE ROW LEVEL SECURITY` em **uma** tabela. Tabela sem RLS habilitado =
**aberta a qualquer um com a anon key** (que é pública, vai no frontend). Um
`GET` no endpoint REST daquela tabela devolve tudo. Candidatas a serem
esquecidas aqui: `historico_tarefa`, `contrato`, `contrato_servico`, `evento`,
`checklist_modelo`, `tarefa_padrao`, `cliente`.

**Correção exigida:**
- `ENABLE` **e** `FORCE ROW LEVEL SECURITY` em **todas** as tabelas de negócio
  (o FORCE evita que o owner da tabela escape do RLS).
- Postura **default-deny**: RLS habilitado sem policy = nega tudo (correto).
  Toda liberação é explícita e mínima, por role `authenticated`.
- Checklist de aceite: enumerar cada tabela e confirmar RLS on + policies
  revisadas antes do primeiro deploy. Um teste automatizado que consulta
  `pg_tables`/`pg_policies` e falha se faltar RLS em qualquer tabela é barato
  e recomendado.

---

## R5 — Sócio altera `visivel_ao_cliente` ou `responsavel_id` da própria tarefa — ALTO

**Cenário concreto:** o sócio precisa de UPDATE na própria `tarefa_evento`
(mudar status, concluir). Como RLS é por linha, esse mesmo UPDATE deixa ele
mexer em **qualquer coluna** da linha: pode ligar `visivel_ao_cliente=true`
(expondo tarefa interna ao cliente) ou desligar para esconder algo, e pode
trocar `responsavel_id` — o que os perfis proíbem explicitamente ("não pode
alterar o responsável"). Trocar `responsavel_id` para o de outro sócio também
serve para *sequestrar* ou *empurrar* tarefa.

**Correção exigida:**
- Restringir as colunas que `authenticated` pode atualizar em `tarefa_evento`
  via **GRANT UPDATE (col1, col2, ...) **: liberar só `status` (e
  `concluida_por`/`concluida_em` se escritos pelo app). Manter `perfil`-like
  fora: `responsavel_id`, `visivel_ao_cliente`, `prazo`, `prioridade`,
  `evento_id` **não** entram no GRANT do usuário.
- `WITH CHECK` na policy garantindo que a linha continua sendo do próprio
  sócio depois do UPDATE (impede "adotar" a linha mudando `responsavel_id`,
  como defesa em profundidade caso o GRANT seja afrouxado).
- `visivel_ao_cliente` só muda por admin/gestor.

## R6 — Reabertura e transições de status só-admin não cabem em policy simples — MÉDIO/ALTO

**Cenário concreto:** "só admin reabre tarefa concluída". Com GRANT de coluna,
o sócio consegue escrever `status`; nada impede ele de mandar
`status: 'concluida' -> 'pendente'` (reabrir) sozinho, ou pular direto para
`concluida` sem passar pelo fluxo. Máquina de estados não é expressável só com
policy de linha/coluna.

**Correção exigida:** trigger `BEFORE UPDATE` em `tarefa_evento` validando as
transições permitidas por perfil (sócio: pendente↔em_andamento→concluída;
reabertura concluída→pendente só se perfil=admin). O mesmo trigger alimenta o
`historico_tarefa` (R3).

**Status pós-implementação (verificado em 2026-08-18 diretamente no banco):**
R5 e R6 já estão mitigados na prática pelo trigger `fn_tarefa_evento_guard`
(`trg_tarefa_evento_guard`, existe e ativo hoje), que bloqueia sócio de
alterar campos sensíveis e de reabrir tarefa concluída — confirmado
experimentalmente no gate final do MVP ("sócio bloqueado de reabrir tarefa
concluída"). Este documento não tinha sido atualizado para refletir isso.

## R7 — Resquício de acesso `anon` da fase "visualização pública" — MÉDIO

**Cenário concreto:** a decisão anterior era portal do cliente **público sem
login**; agora o cliente tem login (confirmado 2026-08-17). Se sobrar qualquer
policy liberando `anon` (SELECT público em `evento`/`tarefa_evento`), o portal
continua acessível **sem autenticação** e sem escopo de cliente — vazamento de
todos os eventos.

**Correção exigida:** nenhuma policy para o role `anon` em tabela de negócio.
Todo acesso do cliente passa por `authenticated` + escopo do próprio cliente.

**Status pós-implementação (verificado em 2026-08-18 diretamente no banco):**
confirmado real, mas na forma de GRANT, não de policy: `anon` tem
`TRUNCATE`/`TRIGGER`/`REFERENCES` residual em todas as 11 tabelas de
negócio (nunca `SELECT`/`INSERT`/`UPDATE`/`DELETE` — nenhuma policy
libera `anon`, e o PostgREST não expõe `TRUNCATE` via REST, então o
risco prático hoje é baixo). Ainda assim viola least-privilege e deveria
ser revogado. **Correção proposta, aguardando autorização para aplicar
em produção:** `REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN
SCHEMA public FROM anon;`.

## R8 — `onDelete: Cascade` apagando `historico_tarefa` viola "nunca excluir" — MÉDIO

**Cenário concreto:** não é vazamento entre clientes (o cascade segue a FK de
posse, então não expõe dado de outro cliente — a preocupação de "órfão de
outro cliente" tem risco baixo aqui). O risco real é de **integridade/audit**:
se apagar `evento` → cascata em `tarefa_evento` → cascata em
`historico_tarefa`, o trail exigido por regra de negócio ("manter no
histórico, nunca excluir após concluída") desaparece. E DELETE precisa ser
**só-admin** ("tarefas não devem ser excluídas sem autorização").

**Correção exigida:**
- Não existir policy de DELETE para `authenticated` não-admin em
  `tarefa_evento`/`historico_tarefa`.
- Revisar cada `ON DELETE CASCADE`: para `historico_tarefa`, preferir
  `RESTRICT`/arquivamento (soft delete) a cascade, ou aceitar formalmente que
  excluir um evento apaga o histórico — decisão do produto, mas hoje **conflita**
  com a regra "nunca excluir". Sinalizar ao dono do produto.

**Status pós-implementação (verificado em 2026-08-18 diretamente no banco):**
**não é um problema no schema real** — a FK `historico_tarefa_tarefa_evento_id_fkey`
usa `ON DELETE RESTRICT`, não `CASCADE` (impede excluir uma `tarefa_evento`
enquanto houver histórico vinculado). O parecer original (Fase 4, anterior
à implementação) alertava sobre um risco de design que a implementação
final já evitou. Sem ação necessária.

## R9 — Vínculo `cliente ↔ usuario` frouxo fura o isolamento entre clientes — MÉDIO

**Cenário concreto:** o isolamento do cliente depende da cadeia
`tarefa_evento.evento_id → evento.cliente_id → cliente.usuario_id =
auth.uid()`. Se `cliente.usuario_id` for nulo, duplicado, ou um usuário puder
estar ligado a mais de um cliente, a policy pode (a) devolver vazio (cliente
não vê o próprio evento) ou (b) casar com o cliente errado e **vazar evento de
outro cliente**. E a policy de `tarefa_evento` para cliente **precisa** incluir
`visivel_ao_cliente = true` **além** da posse do evento — esquecer esse `AND`
mostra tarefa interna.

**Correção exigida:**
- `cliente.usuario_id` único e não nulo para quem tem login; definir o
  comportamento se um usuário-cliente pode ter vários eventos (pendência já
  registrada em `decisoes-tecnicas.md`).
- Policy de SELECT do cliente em `tarefa_evento`: posse do evento **E**
  `visivel_ao_cliente = true`. Histórico: por padrão, cliente **não** vê
  `historico_tarefa` (contém trocas de responsável/observações internas); se
  for exibir algo, filtrar só eventos do tipo público e tarefas visíveis.

**Status pós-implementação (verificado em 2026-08-18 diretamente no banco):**
confirmado ainda existente — `cliente.usuario_id` não tem nenhuma
CHECK constraint ou trigger garantindo que aponte para um usuário da
mesma empresa (só FK simples `ON DELETE SET NULL`). **Impacto prático
hoje é zero**: nenhuma tela usa esse campo ainda (`portal-cliente` é um
stub "Em Construção", ver `src/app/portal-cliente/page.tsx`). Correção
adiada intencionalmente para quando o portal do cliente for
implementado — corrigir agora seria trabalho especulativo numa feature
que ainda não existe.

## R10 — Contrato fechado é editável via API direta (bypass da aplicação)

**Confirmado experimentalmente em 2026-08-18** (gate final do MVP), não
apenas por leitura de código: com um contrato já `fechado`, um `DELETE`
em `contrato_servico` e um `PATCH` de `status` de volta para `rascunho`
via API REST direta (mesmo JWT de admin, sem passar pela Server Action
`atualizarServicosContrato`/tela de edição) **funcionaram** (HTTP 204 e
200, respectivamente). A policy `contrato_admin_all`/`contrato_servico_admin_all`
só checa `is_admin_of(empresa_id)` — não checa `status`.

- **Pela interface/Server Actions da aplicação:** bloqueado corretamente
  (`/contratos/[id]/editar` redireciona se `status = 'fechado'`;
  `atualizarServicosContrato` retorna erro se chamada mesmo assim).
- **Fora da aplicação** (um admin usando a API diretamente, ex. Postman/curl
  com o próprio token): consegue reverter um contrato fechado. Quem faria
  isso já é admin com acesso total ao sistema — não é uma escalação de
  privilégio para um perfil menos privilegiado, mas quebra a garantia de
  integridade "contrato fechado é imutável".
- **CORRIGIDO em 2026-08-18** — migration `0005_contrato_fechado_immutable.sql`
  aplicada contra o Supabase real: dois triggers de guarda
  (`fn_contrato_fechado_immutable` em `contrato`, `fn_contrato_servico_fechado_immutable`
  em `contrato_servico`) bloqueiam UPDATE/DELETE quando o contrato já
  está `fechado`, mesmo padrão de `fn_empresa_id_immutable`. Testado com
  fixture transacional (criada e revertida via `ROLLBACK`, nenhum dado
  fictício persistido): rascunho continua editável; fechamento inicial
  (via `fechar_contrato()`) continua funcionando; reabertura, DELETE do
  contrato, DELETE e UPDATE de `contrato_servico` em contrato fechado —
  todos bloqueados com erro controlado. Teste de fumaça na aplicação
  (`/contratos`) sem regressão.

---

## Resumo de severidade

| # | Risco | Severidade | Bloqueia? |
|---|-------|-----------|-----------|
| R1 | Auto-escalação de `perfil` (linha própria / user_metadata) | Crítico | Sim |
| R2 | `service_role` em server action burla RLS | Crítico | Sim |
| R3 | Escrita de `historico_tarefa` pelo usuário | Alto | Sim |
| R4 | RLS não habilitado / sem default-deny em alguma tabela | Alto | Sim |
| R5 | Sócio altera `visivel_ao_cliente`/`responsavel_id` da própria linha | Alto | **Mitigado** (`fn_tarefa_evento_guard`, confirmado 2026-08-18) |
| R6 | Reabertura/transição de status só-admin exige trigger | Médio/Alto | **Mitigado** (`fn_tarefa_evento_guard`, confirmado 2026-08-18) |
| R7 | Resquício de GRANT `anon` (TRUNCATE/TRIGGER/REFERENCES) | Médio | Confirmado, correção pronta, aguardando autorização |
| R8 | Cascade delete apaga audit trail / DELETE não-admin | Médio | **Não é problema real** — schema usa `ON DELETE RESTRICT` |
| R9 | Vínculo `cliente↔usuario` frouxo | Médio | Confirmado, impacto zero hoje (feature não usada), adiado |
| R10 | Contrato fechado editável via API direta | Médio | **CORRIGIDO 2026-08-18** (`0005_contrato_fechado_immutable.sql`) |

\* Não bloqueia iniciar, mas **é obrigatório** antes de expor o sistema a
usuários reais — R5/R6 são as escaladas de coluna e de máquina de estados.

**Conclusão:** aprovar a estratégia de RLS **condicionada** a R1–R4 fechados no
desenho do schema. Encaminhar R1–R9 ao `saas-developer`/architect para
incorporar no SQL de `03-projeto-betel/database/`; revisar o schema real assim
que existir, com foco em: RLS on+FORCE por tabela, GRANTs de coluna, origem do
perfil, uso do JWT do usuário (não `service_role`) nas server actions, e
triggers de histórico/transição.
