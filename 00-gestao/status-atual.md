# Status atual do projeto Betel

## Fase atual

MVP funcional completo (fluxo principal ponta a ponta): autenticação,
cadastros base, contratos, eventos, checklist automático, tarefas,
progresso e dashboard — todos implementados e validados com dados reais.
Aguardando revisão e autorização de push.

## Status

Em andamento — validação final concluída, aguardando autorização de push

## Concluído

- Levantamento de contexto real de negócio junto ao cliente
- Reorganização da estrutura de pastas para o padrão oficial
- Fase 2 — Definição do escopo (MVP, backlog, perfis, regras, fluxos)
- Fase 3 — proposta técnica aprovada: Next.js + Supabase, RLS, cliente
  com login próprio
- Fase 4 — ambiente preparado pelo time SaaS: schema SQL + RLS, scaffold
  Next.js, estratégia de testes, parecer de segurança
- Fase 5, funcionalidade 1/7 — **Autenticação**: implementada e testada
  de ponta a ponta
- Fase 6 — **Auditoria técnica e funcional completa** do MVP
  (`04-analises/auditoria-mvp.md`): confirmou que só autenticação estava
  implementada, resto era stub; corrigidos `next lint` (removido no Next
  16) e Node 20→22 (incompatível com `@supabase/*`)
- Fase 6 — **Fundação multitenant aplicada** (`04-analises/arquitetura-multitenant.md`,
  `plano-migration-tenant.md`): tabela `empresa`, `empresa_id` em todas
  as 10 tabelas, RLS reescrito com `is_admin_of()` + trigger de
  imutabilidade, Betel como primeiro tenant. Migration executada e
  validada em 2026-08-17
- Fase 6 — **27/27 testes de isolamento passaram** (2 bugs reais
  pré-existentes da Fase 4 achados e corrigidos: `fn_log_tarefa_evento`
  sem `empresa_id`, recursão de RLS evento↔tarefa_evento); dados
  fictícios de teste limpos depois; fixture reproduzível criado em
  `03-projeto-betel/database/fixtures/`
- Fase 5 — **Cadastros base (Clientes, Sócios/Usuários, Serviços)**
  implementados e validados: funcional completo + segurança (RLS via API
  com JWT real de sócio, bloqueio de rota por perfil, `empresa_id`
  sempre server-side e imutável). Bug real de infraestrutura corrigido:
  CSRF de Server Actions via proxy do Codespace reescrevendo `Origin`.
- **MVP completo (Contratos, Eventos, Checklist automático, Minhas
  Tarefas, Progresso, Dashboard)** — implementado e validado com fluxo
  E2E real (login → cadastros → checklist → evento → contrato →
  fechamento → geração automática de tarefa → conclusão → progresso →
  dashboard). Migration nova (aditiva): função `fechar_contrato()`,
  idempotente sob concorrência (testado com chamada RPC repetida).
  Nenhum bug de aplicação encontrado nesta fase. Ver
  `04-analises/decisoes-do-mvp.md`,
  `06-testes-evidencias/matriz-de-testes-mvp.md`,
  `00-gestao/registro-de-bugs.md`.
- **Gate final de validação antes do push** (2026-08-18): 27 testes de
  isolamento reexecutados de verdade (fixture nova, 6 logins reais, 29
  requisições via API) — **29/29 passaram**; T14 (sócio lê
  `tarefa_padrao`) executado de verdade — passou; migrations `0002` e
  `0003` promovidas de `proposals/` para `database/`; risco de contrato
  fechado editável via API direta **confirmado experimentalmente** e
  documentado como R10 em `00-gestao/riscos.md` (não corrigido — fora do
  escopo do gate); lint/build limpos; nenhum secret no diff. Fixture de
  teste removida ao final.

## Em andamento

- Menu de navegação lateral implementado (2026-08-18): `Sidebar` no
  layout raiz, grupos colapsáveis (Cadastros, Eventos) com seta que
  gira ao abrir, drawer mobile, `LogoutButton` centralizado no rodapé.
  Lint/build limpos, testado visualmente em desktop. Aguardando commit
  local (sem push). Onboarding guiado (`0004_onboarding.sql`) segue
  pausado aguardando aprovação explícita do usuário.

## Próxima tarefa

- Ordem da Fase 5 (uma por vez): ~~autenticação~~ ~~cadastros base~~
  ~~contratos~~ ~~eventos~~ ~~checklist automático~~ ~~minhas tarefas~~
  ~~progresso~~ ~~dashboard~~ ~~layout/navegação compartilhado~~ —
  **todos concluídos**. Próximos passos possíveis (fora do escopo
  autorizado até aqui): onboarding guiado (migration pendente de
  aprovação), portal do cliente, refinamentos de UX.

## Pendências

- Ver `00-gestao/pendencias.md`
- ~~Promover `0002_multitenant.sql` e `0003_fechar_contrato.sql` para
  `database/`~~ — feito no gate final de 2026-08-18 (`git mv`, histórico
  preservado); ambas agora em `03-projeto-betel/database/`, fora de
  `proposals/`
- Nenhuma migration testada do zero em ambiente efêmero (só análise
  estática + execução real contra produção) — sem risco real hoje, mas
  registrar para quando houver ambiente de CI/staging
- ~~Não existe layout/navegação compartilhado~~ — feito em 2026-08-18:
  `Sidebar` único no layout raiz (`src/components/layout/sidebar.tsx`),
  config de itens por perfil em `src/lib/layout/nav-config.ts`,
  `<LogoutButton />` removido das páginas individuais
- Portal do cliente não implementado (decisão pendente de aprovação)
- Imutabilidade de contrato fechado só reforçada na aplicação, não por
  trigger de banco (diferente de `empresa_id`) — **confirmado
  experimentalmente no gate final** (não mais suposição), registrado
  como risco R10 em `00-gestao/riscos.md`; melhoria futura recomendada
  (trigger de banco análogo a `fn_empresa_id_immutable`)

## Riscos

- Ver `00-gestao/riscos.md` e `04-analises/auditoria-mvp.md` seção 16
- O bug de recursão de RLS (evento↔tarefa_evento) está latente também no
  `policies.sql` original (pré-multitenant) — só corrigido dentro de
  `0002_multitenant.sql`. Sem impacto hoje, mas relevante se
  `policies.sql` for reaplicado isoladamente no futuro

## Decisões aguardando aprovação

- Se o portal do cliente com login entra nesta primeira versão do MVP ou
  fica só como "visualização pública sem login"
- Autorização explícita de push dos commits locais para o GitHub

## Última atualização

2026-08-18
