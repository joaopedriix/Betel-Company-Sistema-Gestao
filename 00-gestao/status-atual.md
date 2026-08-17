# Status atual do projeto Betel

## Fase atual

Fase 5 — Implementação incremental (1ª funcionalidade concluída e testada:
autenticação)

## Status

Em andamento

## Concluído

- Levantamento de contexto real de negócio junto ao cliente
- Reorganização da estrutura de pastas para o padrão oficial
- Fase 2 — Definição do escopo (MVP, backlog, perfis, regras, fluxos)
- Fase 3 — proposta técnica aprovada pelo usuário em 2026-08-17: Next.js +
  Supabase, RLS, cliente com login próprio
- Fase 4 — ambiente preparado pelo time SaaS (paralelo): schema SQL + RLS,
  scaffold Next.js, estratégia de testes, parecer de segurança (ver
  `00-gestao/riscos.md`)
- Projeto Supabase real criado (`betel-company`, São Paulo) e banco
  aplicado: `schema.sql` → `policies.sql` → `grants.sql`
- Fase 5, funcionalidade 1/7 — **Autenticação**: login/logout, proteção de
  rota por perfil, redirecionamento por perfil. **Testada de ponta a
  ponta** no navegador contra o Supabase real (não só compilada) — ver
  `00-gestao/changelog.md` para o bug encontrado (GRANT ausente) e a
  correção

## Em andamento

- Nenhuma tarefa em andamento no momento — aguardando definição da próxima
  funcionalidade

## Próxima tarefa

- Ordem da Fase 5 (uma por vez, com teste antes de seguir): ~~autenticação~~
  (concluída) → cadastros base (clientes, usuários/sócios, serviços) →
  contratos → geração automática de checklist → "Minhas tarefas" →
  conclusão/checklist automático → dashboard do gestor

## Pendências

- Ver `00-gestao/pendencias.md`
- Confirmar se Fase 1 (inventário técnico) é dispensada — mantido como
  dispensada, já que não há sistema original em código

## Riscos

- Ver `00-gestao/riscos.md`

## Decisões aguardando aprovação

- Proposta técnica completa em `00-gestao/decisoes-tecnicas.md`: stack
  (Next.js + Supabase), modelo de dados, rotas, estratégia de permissões
  (RLS), testes, backup e publicação
- Se o portal do cliente com login entra nesta primeira versão do MVP ou
  fica só como "visualização pública sem login" (a especificação do MVP
  lista o cliente como perfil de acesso, mas não detalha login)

## Última atualização

2026-08-17
