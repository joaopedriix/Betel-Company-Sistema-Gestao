# Auditoria técnica e funcional do MVP — Betel Company

> Executada em 2026-08-17. Nenhum módulo novo foi implementado durante
> esta auditoria — apenas leitura, testes e documentação, conforme
> solicitado. Local no projeto: dentro de `04-analises/` (mantendo a
> convenção de pastas já estabelecida em `05-prompts/00-organizacao-geral-do-projeto.md`,
> em vez de criar uma pasta `docs/` nova na raiz).

## 1. Resumo executivo

O projeto está na Fase 5 (implementação incremental), com **apenas 1 de 7
funcionalidades do MVP implementada**: autenticação. Banco de dados
(schema + RLS + grants) está completo e corresponde ao modelo de dados
planejado. Todo o restante do fluxo funcional do MVP (cadastros,
contratos, geração automática de checklist, conclusão de tarefas,
progresso, dashboard) **ainda não foi implementado** — as telas existem
apenas como stubs "Em construção". Não há dados fictícios ou mockados em
lugar nenhum; o que existe é real (schema real, RLS real, login real
testado contra Supabase), e o que não existe está claramente marcado como
ausente, não simulado.

## 2. Estado do Git

- **Branch:** `main`, sincronizada com `origin/main`.
- **Checkpoint criado:** commit `8206213` ("Checkpoint: reorganização do
  projeto, MVP/Fase 3 aprovados, banco Supabase real e autenticação
  implementada e testada") + commit `dfb0ae9` (correção do devcontainer).
  Ambos enviados ao remoto (`git push`), com autorização explícita do
  usuário antes do push.
- **Nada foi descartado.** Nenhum comando destrutivo (`reset --hard`,
  exclusão de migration/tabela, `git clean`) foi executado.
- **Nenhuma credencial exposta.** `.env.local` confirmado como ignorado
  pelo Git (`git status --ignored` mostrou `!!` para o arquivo) antes de
  qualquer `git add`.

## 3. O que está implementado

| Item | Status |
|---|---|
| Estrutura de pastas do projeto (método) | Implementado |
| Documentação de negócio, MVP, perfis, regras, fluxos | Implementado |
| Schema do banco (10 tabelas, enums, triggers) | Implementado |
| RLS (policies) por perfil | Implementado |
| GRANTs de tabela para `authenticated` | Implementado (corrigido nesta sessão — ver seção 8) |
| Scaffold Next.js (App Router, Tailwind, shadcn/ui) | Implementado |
| Autenticação (login, logout, sessão, proteção de rota por perfil) | Implementado e **testado de ponta a ponta** contra Supabase real |
| Projeto Supabase real (`betel-company`, São Paulo) | Implementado |
| Usuário admin de teste | Implementado |

## 4. O que está parcialmente implementado

| Item | Status |
|---|---|
| Rotas de todas as telas do MVP (`/clientes`, `/usuarios`, `/servicos`, `/checklists`, `/contratos`, `/eventos`, `/minhas-tarefas`, `/portal-cliente`, `/dashboard`) | Parcial — rota existe, protegida por perfil, mas o conteúdo é só um stub "Em construção" (`src/components/em-construcao.tsx`), sem formulário, listagem ou dado real |

## 5. O que está ausente

Tudo que envolve **lógica de negócio de aplicação** (o schema/RLS
existem, mas nada os usa ainda via UI/Server Action):

- Cadastro de clientes, sócios/usuários, serviços (CRUD)
- Criação de modelo de checklist e tarefas padrão
- Criação e fechamento de contrato
- Geração automática de tarefas do evento no fechamento do contrato
- Distribuição de tarefas por responsável
- "Minhas tarefas" (listagem, filtros, alteração de status, conclusão)
- Atualização automática do checklist geral e cálculo de progresso
- Dashboard do gestor com dados reais
- Reabertura de tarefa pela UI (a trava já existe no banco via trigger,
  mas não há botão/fluxo)
- Multiempresa/multitenancy (não decidido — ver seção 6)

## 6. Modelo de dados

Entidades implementadas em `03-projeto-betel/database/schema.sql`:
`usuario`, `cliente`, `servico`, `checklist_modelo`, `tarefa_padrao`,
`evento`, `contrato`, `contrato_servico`, `tarefa_evento`,
`historico_tarefa`.

**Separação modelo vs. execução — confirmada corretamente:**
- `tarefa_padrao` é o modelo (nunca alterado por execução de evento).
- `tarefa_evento` é a cópia gerada no fechamento do contrato:
  `tarefa_padrao_id` guarda a origem (com `ON DELETE SET NULL` — a tarefa
  do evento sobrevive independente se o modelo for apagado depois).
- Responsável: `tarefa_padrao.responsavel_padrao_id` é copiado para
  `tarefa_evento.responsavel_id` **em tese** — mas como o fechamento de
  contrato não está implementado ainda (seção 5), essa cópia nunca foi
  exercitada de fato. É um comportamento planejado no schema, não testado.
- Prazo: `tarefa_padrao.prazo_offset_dias` (relativo, ex. "D-30") vs.
  `tarefa_evento.prazo` (data absoluta) — o cálculo (`data_evento +
  offset`) também não está implementado ainda; existe só a coluna.
- Prioridade, ordem, `visivel_ao_cliente`: colunas espelhadas em ambas as
  tabelas, cópia também não exercitada.
- `tarefa_evento` mantém vínculo com `evento_id` (não há vínculo direto
  com `contrato_id` na tarefa — o caminho é `tarefa_evento → evento →
  contrato`, via `contrato.evento_id`).
- Alterações futuras no modelo (`tarefa_padrao`) não propagam para
  `tarefa_evento` já geradas — não há FK/trigger de sincronização, o que
  está correto pela regra de negócio.

**Chaves e constraints:**
- Todas as PKs são `uuid default gen_random_uuid()`, exceto `usuario.id`
  que referencia `auth.users(id)` (sem default — vem do Supabase Auth).
- FKs com `ON DELETE` variados e intencionais: `cascade` (ex.
  `evento.cliente_id`), `set null` (ex. `tarefa_evento.responsavel_id`,
  para não travar ao inativar um sócio), `restrict` (ex.
  `contrato_servico.servico_id`, `historico_tarefa.tarefa_evento_id` —
  este último corrigido nesta sessão para reforçar "nunca excluir", ver
  seção 8).
- `contrato_servico` é a tabela de junção N:N contrato↔serviço, PK
  composta `(contrato_id, servico_id)`.
- Índices: em todas as FKs relevantes e em `tarefa_evento.status` /
  `.responsavel_id` (consultas mais frequentes esperadas: "minhas
  tarefas", filtro por status).

**Riscos de duplicidade/dados órfãos:** baixo no schema em si (FKs bem
definidas). O risco real de duplicidade está na *lógica de fechamento de
contrato* (gerar tarefas duas vezes) — não avaliável ainda porque essa
lógica não existe (ver seção 7).

## 7. Multiempresa/tenant

**Não implementado.** O schema é explicitamente single-tenant — comentário
no topo de `schema.sql`: "Sistema SINGLE-TENANT (uma empresa/Betel só).
Não há coluna de tenant porque a pendência 'Necessidade de
multiempresa/multitenancy' ainda não foi resolvida." Registrado como
pendência aberta em `00-gestao/pendencias.md`.

- **O que existe hoje:** nenhuma tabela tem `empresa_id`/`tenant_id`. RLS
  isola por *sócio* (dono da tarefa) e por *cliente* (dono do
  evento/contrato) — não por empresa.
- **Tabelas que ficariam vulneráveis** se o produto virar multiempresa
  sem essa mudança: todas — `usuario`, `cliente`, `servico`,
  `checklist_modelo`, `tarefa_padrao`, `evento`, `contrato`,
  `contrato_servico`, `tarefa_evento`, `historico_tarefa`. Hoje, um admin
  vê literalmente tudo do sistema (policy `..._admin_all` sem filtro de
  empresa); num cenário multiempresa, isso vazaria dados entre empresas.
- **Recomendação (não implementar agora):** se/quando confirmado,
  adicionar `empresa_id` em `usuario` e propagar por FK/RLS nas tabelas
  raiz (`cliente`, `servico`, `evento` teriam `empresa_id` direto; as
  demais herdam via join). Reescrever as policies `is_admin()`/`for all`
  para incluir `and empresa_id = current_empresa_id()`.
- **Impacto de adicionar depois:** médio-alto — não é só uma coluna nova,
  é reescrever todas as ~20 policies de `policies.sql` e adicionar o
  filtro em toda query que hoje não pensa em tenant. Mais barato decidir
  antes de escrever a lógica de negócio (Fase 5 ainda não tocou nisso)
  do que depois.

## 8. Fluxo contrato → checklist → tarefas

**Não implementado — nada a testar ainda.** O fluxo completo (criar
cliente → sócio → serviço → modelo → tarefas padrão → evento → contrato →
selecionar serviços → fechar → gerar tarefas → distribuir → sócio executa
→ progresso → gestor acompanha/reabre → histórico) existe apenas como
schema de banco e regra de negócio documentada
(`01-documentacao/regras-de-negocio/regras-iniciais.md`,
`01-documentacao/fluxos-do-sistema/fluxos-iniciais.md`). Nenhuma Server
Action ou rota implementa esse fluxo ainda.

**O único pedaço do fluxo coberto por automação de banco:** a trigger
`fn_log_tarefa_evento` grava `historico_tarefa` automaticamente em
INSERT/UPDATE de `tarefa_evento`, e `fn_tarefa_evento_guard` bloqueia
sócio de reabrir tarefa ou trocar responsável/visibilidade — mas como não
há UI/Server Action que insira/atualize `tarefa_evento`, essas triggers
nunca rodaram de verdade fora de testes manuais no SQL Editor.

## 9. Problemas de geração e duplicidade no fechamento

**Não avaliável.** Não existe lógica de fechamento de contrato para
testar os 4 cenários pedidos (fechar 1x, fechar 2x, recarregar durante o
fechamento, dois fechamentos simultâneos). Recomendação para quando essa
funcionalidade for implementada: usar uma transação Postgres única
(schema já tem os triggers certos para isso) e uma constraint/verificação
de idempotência no `contrato.status` (ex.: `UPDATE contrato SET
status='fechado' WHERE id=$1 AND status='rascunho'` — se `rowCount=0`,
já estava fechado, não gerar tarefas de novo).

## 10. Permissões e segurança

**Testado e correto no que existe (autenticação + RLS):**
- Perfil sempre lido de `public.usuario` (nunca de `user_metadata`,
  que é gravável pelo próprio usuário — risco R1 do parecer de
  segurança, mitigado).
- Middleware (`src/lib/supabase/middleware.ts`) usa `getUser()` (revalida
  no servidor de Auth, não confia só no cookie) e o cliente anon+JWT do
  usuário — nunca `service_role` (risco R2, mitigado no código existente;
  ainda não testado em Server Actions administrativas porque elas não
  existem ainda).
- Proteção de rota por perfil: admin-only (`/dashboard`, `/clientes`
  etc.), sócio-only (`/minhas-tarefas`), cliente-only (`/portal-cliente`)
  — implementada em `src/lib/auth/rotas.ts` + middleware.

**Teste de acesso direto (alterar ID na URL/API):** não exercitado
manualmente ainda nesta auditoria, porque as telas que exibiriam um
recurso por ID (ex. `/eventos/[id]`) não existem — só as rotas de
listagem-stub existem. RLS no banco já impediria vazamento de dado no
nível da API do Supabase (testado indiretamente: a query via
`service_role` vê tudo, a via `anon`+JWT respeita RLS — comportamento
confirmado ao debugar o bug da seção 12).

**Sócio/Cliente — não testado ainda:** só existe 1 usuário de teste
(admin). Testar sócio-não-vê-tarefa-de-outro-sócio e
cliente-não-vê-dado-de-outro-cliente requer criar usuários de teste
adicionais — pendência explícita, já registrada em
`06-testes-evidencias/testes-manuais/autenticacao.md` (Cenário 3).

## 11. RLS e políticas do banco

Auditoria completa já existe em `00-gestao/riscos.md` (parecer do
`saas-security`, revisado contra o schema real). Resumo:

- **RLS habilitado E forçado (`FORCE ROW LEVEL SECURITY`)** em todas as
  10 tabelas — confirmado no `policies.sql` aplicado.
- **21 policies** cobrindo `usuario`, `cliente`, `servico`,
  `checklist_modelo`, `tarefa_padrao`, `evento`, `contrato`,
  `contrato_servico`, `tarefa_evento`, `historico_tarefa` — padrão:
  admin (`for all`), leitura restrita por dono/vínculo para sócio e
  cliente.
- **`historico_tarefa` sem policy de INSERT/UPDATE/DELETE** para
  `authenticated` — escrita só via trigger `SECURITY DEFINER`
  (append-only de fato, não só de nome).
- **Nenhuma policy para o role `anon`** — nada acessível sem login,
  correto dado que cliente também tem login agora.
- **9 riscos identificados no parecer original, 8 resolvidos** (R1, R3,
  R4, R5, R6, R7, R8, R9); R2 (uso de `service_role`) é requisito de
  código a cobrar quando as Server Actions administrativas forem
  escritas — não há nenhuma ainda para violar isso.

## 12. Histórico e auditoria

Schema e triggers implementados e corretos (ver seção 8), mas **nunca
exercitados por um fluxo real de aplicação** — só testados manualmente
via SQL Editor durante a criação do schema, não por uma ação de usuário
real na UI (porque a UI de tarefas não existe ainda).

## 13. Cálculo do progresso

**Não implementado.** Não há coluna nem view/função de progresso no
schema — a regra (`concluídas / total × 100`) está documentada em
`01-documentacao/regras-de-negocio/regras-iniciais.md`, mas nenhum código
a calcula ainda. Recomendação para a implementação futura: calcular no
servidor (Server Action ou uma view SQL), nunca só no frontend, para
evitar divergência entre telas — consistente com a estratégia de testes
já planejada em `06-testes-evidencias/relatorios/estrategia-de-testes.md`.

## 14. Testes executados

| Comando | Resultado |
|---|---|
| `npm run build` (local, antes desta auditoria) | ✅ Passou — 13 rotas, TypeScript OK |
| Login real contra Supabase (`betel-company`) | ✅ Passou, após corrigir bug de GRANT (seção 15/16) |
| `npm install` (Codespace, Node 22) | ✅ 618 pacotes, 0 vulnerabilidades, sem avisos EBADENGINE |
| `npm run lint` (Codespace) | ✅ Passou, 0 erros/warnings — mas exigiu corrigir a infraestrutura de lint primeiro (seção 15) |
| `npm run build` (Codespace) | ✅ Passou — 13 rotas, TypeScript OK. Único aviso: convenção `middleware.ts` está deprecada no Next 16 (sugere migrar para `proxy.ts` — cosmético, não bloqueante, mesmo aviso desde o scaffold inicial) |

Todos os testes técnicos executados **no Codespace**, conforme solicitado
(`expert-goggles-4qqjvj57wv5g24ww`, pausado ao final desta auditoria).

## 15. Erros encontrados

**Bug real, encontrado e corrigido nesta sessão:** login autenticava no
Supabase Auth (senha aceita) mas retornava "Conta sem acesso habilitado"
mesmo com o cadastro correto em `public.usuario`. Causa raiz:
`permission denied for table usuario` — RLS decide *quais linhas*, mas o
Postgres exige `GRANT` de privilégio na *tabela* separadamente para o
role `authenticated`; isso não veio automático porque o projeto Supabase
foi criado com "Automatically expose new tables" desligado (decisão de
segurança certa, só faltava este passo complementar). Corrigido com
`03-projeto-betel/database/grants.sql`. Detalhe completo em
`00-gestao/changelog.md` e `06-testes-evidencias/testes-manuais/autenticacao.md`.

**Bug de infraestrutura, encontrado e corrigido durante esta auditoria:**
`.devcontainer/devcontainer.json` tinha a feature
`docker-in-docker`, que falha ao construir na imagem base
`javascript-node:20` (Debian trixie não suporta a opção `moby`),
derrubando o Codespace para um container de recuperação Alpine sem Node.
Corrigido removendo a feature (não é necessária — banco roda no Supabase
Cloud, não em Docker local). Também faltava a feature `sshd` (necessária
para `gh codespace ssh`, não vem por padrão na imagem) — adicionada.

**Bug real de lint, encontrado e corrigido durante esta auditoria:**
`package.json` tinha `"lint": "next lint"`, mas **esse comando foi
removido na CLI do Next.js 16** (confirmado lendo
`node_modules/next/dist/docs/.../eslint.md` e `next --help` — não
aparece mais na lista de comandos). Além disso, `eslint` nem estava
instalado como dependência — o comando nunca teria funcionado desde o
scaffold inicial, só não tinha sido exercitado ainda. Corrigido: `eslint`
+ `eslint-config-next` instalados, `eslint.config.mjs` (flat config)
criado conforme a documentação oficial, script trocado para `"lint":
"eslint ."`. Rodado com sucesso no Codespace: 0 erros/warnings.

**Achado técnico, corrigido preventivamente:** `@supabase/supabase-js` e
dependências exigem Node `>=22.0.0`, mas o devcontainer usava Node 20
(gerando avisos `EBADENGINE` no `npm install`, embora a instalação não
falhasse). Subido para Node 22 — `npm install` no Codespace ficou limpo,
sem avisos.

## 16. Riscos críticos

| Risco | Severidade | Detalhe |
|---|---|---|
| Multiempresa não decidida antes de escrever a lógica de negócio | Médio | Ver seção 7 — mais barato decidir agora do que reescrever RLS depois |
| `service_role` mal utilizada quando as Server Actions administrativas forem escritas (fechamento de contrato etc.) | Alto (preventivo) | Já documentado como requisito obrigatório (R2 em `00-gestao/riscos.md`); nenhuma violação existe hoje porque o código ainda não existe |
| Duplicidade no fechamento de contrato | Não avaliável ainda | Funcionalidade não implementada — ver seção 9 |
| Sócio/cliente sem teste de isolamento real (só admin testado) | Médio | Ver seção 10 — resolve ao criar usuários de teste sócio/cliente |

Nenhum risco **Crítico** ou **Baixo** identificado nesta rodada (a maior
parte do sistema ainda não existe para avaliar; o que existe foi
construído com os cuidados de segurança já documentados).

## 17. Recomendações

1. Não prosseguir para multiempresa "de brinde" — é uma decisão de
   produto que muda a forma de toda policy futura; melhor confirmar antes
   da próxima funcionalidade (cadastros).
2. Ao implementar o fechamento de contrato, usar transação + verificação
   de idempotência (seção 9) desde a primeira versão, não como correção
   posterior.
3. Criar usuários de teste `socio` e `cliente` assim que cadastro de
   usuários existir, para finalmente testar isolamento entre perfis (não
   só admin).
4. Ao escrever a primeira Server Action que grava dado administrativo
   (ex. gerar tarefas no fechamento), revisar explicitamente contra R2 de
   `00-gestao/riscos.md` antes de aceitar como pronta.

## 18. Decisões que precisam da sua aprovação

- Confirmar (ou não) a necessidade de multiempresa/multitenancy antes da
  próxima funcionalidade (impacta o modelo de dados e todas as policies
  futuras).
- Confirmar se "cliente pode ter mais de um evento" (schema já assume
  1:N, pendência ainda aberta em `00-gestao/pendencias.md`).

## Próxima etapa recomendada

Aguardar sua aprovação deste relatório antes de retomar a Fase 5
(próxima funcionalidade: cadastros base — clientes, usuários/sócios,
serviços).
