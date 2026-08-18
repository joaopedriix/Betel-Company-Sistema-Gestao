# Status atual do projeto Betel

## Fase atual

Fase 5, cadastros base (clientes, sócios/usuários, serviços) —
implementados e validados (funcional + segurança). Próxima etapa:
contratos.

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
- Fase 5 — **Cadastros base (Clientes, Sócios/Usuários, Serviços)**
  implementados e validados: funcional completo (CRUD, busca,
  ativar/inativar, duplicidade) + segurança (RLS via API com JWT real de
  sócio, bloqueio de rota por perfil, `empresa_id` sempre server-side e
  imutável). Ver `04-analises/decisoes-do-mvp.md` e
  `06-testes-evidencias/testes-manuais-cadastros.md`. Bug real de
  infraestrutura encontrado e corrigido: CSRF de Server Actions via
  proxy do Codespace reescrevendo `Origin` para `localhost:3000`.

## Em andamento

- Nenhuma tarefa em andamento — cadastros base validados, aguardando
  commit e autorização para a próxima etapa (contratos)

## Próxima tarefa

- Ordem da Fase 5 (uma por vez, com teste antes de seguir): ~~autenticação~~
  ~~cadastros base~~ (concluídos) → contratos → geração automática de
  checklist → "Minhas tarefas" → conclusão/checklist automático →
  dashboard do gestor

## Pendências

- Ver `00-gestao/pendencias.md`
- Promover `03-projeto-betel/database/proposals/0002_multitenant.sql`
  para `database/` (hoje o schema real já reflete a migration, incluindo
  os 2 hotfixes; o arquivo formal ainda está na pasta de proposta)
- Nenhuma migration não testada do zero em ambiente efêmero (só análise
  estática) — sem risco real hoje (já validada contra o banco real), mas
  registrar para quando houver ambiente de CI/staging
- Não montar em nenhuma tela real: portal do cliente, layout/navegação
  completos (só um botão "Sair" mínimo foi adicionado em `/dashboard` e
  `/minhas-tarefas` para viabilizar os testes de troca de sessão)

## Riscos

- Ver `00-gestao/riscos.md` e `04-analises/auditoria-mvp.md` seção 16
- O bug de recursão de RLS (evento↔tarefa_evento) está latente também no
  `policies.sql` original (pré-multitenant) — só corrigido dentro de
  `0002_multitenant.sql`. Sem impacto hoje (a migration já foi aplicada),
  mas relevante se `policies.sql` for reaplicado isoladamente no futuro

## Decisões aguardando aprovação

- Se o portal do cliente com login entra nesta primeira versão do MVP ou
  fica só como "visualização pública sem login"
- Autorização para iniciar a próxima etapa (contratos) após revisão do
  relatório dos cadastros base

## Última atualização

2026-08-18
