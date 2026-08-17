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

## Em andamento

- Nenhuma tarefa em andamento — aguardando decisão do usuário sobre
  criar um segundo tenant de teste (`04-analises/testes-isolamento-tenant.md`)
  ou seguir direto para cadastros

## Próxima tarefa

- Ordem da Fase 5 (uma por vez, com teste antes de seguir): ~~autenticação~~
  (concluída) → cadastros base (clientes, usuários/sócios, serviços,
  agora multitenant) → contratos → geração automática de checklist →
  "Minhas tarefas" → conclusão/checklist automático → dashboard do
  gestor

## Pendências

- Ver `00-gestao/pendencias.md`
- Testes de isolamento entre tenants ainda não executados — precisa de
  um segundo tenant fictício (`04-analises/testes-isolamento-tenant.md`)
- Promover `03-projeto-betel/database/proposals/0002_multitenant.sql`
  para `database/` (hoje o schema real já reflete a migration, mas o
  arquivo formal ainda está na pasta de proposta)

## Riscos

- Ver `00-gestao/riscos.md` e `04-analises/auditoria-mvp.md` seção 16

## Decisões aguardando aprovação

- Se o portal do cliente com login entra nesta primeira versão do MVP ou
  fica só como "visualização pública sem login"
- Criar (ou não) o segundo tenant fictício para validar isolamento antes
  de seguir para cadastros

## Última atualização

2026-08-17
