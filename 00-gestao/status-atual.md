# Status atual do projeto Betel

## Fase atual

Fase 6 concluída (auditoria + fundação multitenant aplicada). Fase 5
(implementação incremental) pronta para retomar — cadastros base é a
próxima funcionalidade.

## Status

Em andamento

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
  (`04-analises/auditoria-mvp.md`): confirmou que só autenticação está
  implementada, resto é stub; corrigidos `next lint` (removido no Next
  16) e Node 20→22 (incompatível com `@supabase/*`)
- Fase 6 — **Fundação multitenant aplicada** (`04-analises/arquitetura-multitenant.md`,
  `plano-migration-tenant.md`): tabela `empresa`, `empresa_id` em todas
  as 10 tabelas, RLS reescrito com `is_admin_of()` + trigger de
  imutabilidade, Betel como primeiro tenant. Migration executada e
  validada em 2026-08-17 — ver `00-gestao/changelog.md`
- Fase 6 — **27/27 testes de isolamento passaram** (2 bugs reais
  pré-existentes da Fase 4 achados e corrigidos: `fn_log_tarefa_evento`
  sem `empresa_id`, recursão de RLS evento↔tarefa_evento); dados
  fictícios de teste limpos depois; fixture reproduzível criado em
  `03-projeto-betel/database/fixtures/`

## Em andamento

- Nenhuma tarefa em andamento — multitenant validado (27/27 testes de
  isolamento passaram), pronto para retomar cadastros

## Próxima tarefa

- Ordem da Fase 5 (uma por vez, com teste antes de seguir): ~~autenticação~~
  (concluída) → cadastros base (clientes, usuários/sócios, serviços,
  agora multitenant) → contratos → geração automática de checklist →
  "Minhas tarefas" → conclusão/checklist automático → dashboard do
  gestor

## Pendências

- Ver `00-gestao/pendencias.md`
- Promover `03-projeto-betel/database/proposals/0002_multitenant.sql`
  para `database/` (hoje o schema real já reflete a migration, incluindo
  os 2 hotfixes; o arquivo formal ainda está na pasta de proposta)
- Nenhuma migration não testada do zero em ambiente efêmero (só análise
  estática) — sem risco real hoje (já validada contra o banco real), mas
  registrar para quando houver ambiente de CI/staging

## Riscos

- Ver `00-gestao/riscos.md` e `04-analises/auditoria-mvp.md` seção 16
- O bug de recursão de RLS (evento↔tarefa_evento) está latente também no
  `policies.sql` original (pré-multitenant) — só corrigido dentro de
  `0002_multitenant.sql`. Sem impacto hoje (a migration já foi aplicada),
  mas relevante se `policies.sql` for reaplicado isoladamente no futuro

## Decisões aguardando aprovação

- Se o portal do cliente com login entra nesta primeira versão do MVP ou
  fica só como "visualização pública sem login"
- Push dos commits locais (`5bc20bd`, `2411dc1`, `6a4927a` + o desta
  limpeza) para o GitHub

## Última atualização

2026-08-17
