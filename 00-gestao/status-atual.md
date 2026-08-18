# Status atual do projeto Betel

## Fase atual

MVP funcional completo (fluxo principal ponta a ponta): autenticação,
cadastros base, contratos, eventos, checklist automático, tarefas,
progresso, dashboard e navegação — todos implementados e validados com
dados reais. Migration do onboarding guiado aplicada; UI ainda não
implementada. Sistema hoje só existe rodando em ambiente de
desenvolvimento (Codespace) — **ainda não está em condições de uso pelo
cliente real**; ver "Pendências para entrega ao cliente" abaixo.

## Status

Em andamento — MVP funcional pronto, mas com pendências de
infraestrutura/segurança/produto antes de poder ser usado pelo cliente
real (não é só "aguardando push")

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

- Menu de navegação lateral (2026-08-18): `Sidebar` no layout raiz,
  grupos colapsáveis (Cadastros, Eventos) com seta que gira ao abrir,
  drawer mobile, `LogoutButton` centralizado no rodapé. Lint/build
  limpos, testado visualmente em desktop (drawer mobile não pôde ser
  verificado visualmente por limitação da ferramenta de automação, mas
  usa breakpoint Tailwind padrão já validado no projeto). Commitado
  localmente, sem push.
- Onboarding guiado — migration `0004_onboarding.sql` aprovada pelo
  usuário e **aplicada contra o Supabase real** em 2026-08-18 (3 colunas
  em `usuario`, 1 policy, 1 trigger de guarda `fn_usuario_self_update_guard`
  — validados diretamente no schema, teste de fumaça de login sem
  regressão). Commitada localmente. **UI/Server Actions/`OnboardingProvider`
  ainda não implementados** — só a base de dados está pronta.

## Próxima tarefa

- Ordem da Fase 5 (uma por vez): ~~autenticação~~ ~~cadastros base~~
  ~~contratos~~ ~~eventos~~ ~~checklist automático~~ ~~minhas tarefas~~
  ~~progresso~~ ~~dashboard~~ ~~layout/navegação compartilhado~~ —
  **todos concluídos**. Ver "Pendências para entrega ao cliente" abaixo
  para o que falta antes do MVP poder ser usado de verdade.

## Pendências para entrega ao cliente (uso real)

> O MVP cobre as dores centrais do cliente (agenda de eventos, checklist
> automático por serviço, acompanhamento de tarefas) e está funcional
> ponta a ponta. Isto **não** significa pronto para uso real — a lista
> abaixo é o que falta, em ordem de bloqueio.

**Bloqueante — sem isto o cliente não consegue nem acessar o sistema:**
1. Deploy real na Vercel — hoje o sistema só roda dentro de um
   Codespace de desenvolvimento (URL temporária, cai quando o
   Codespace é pausado). Nunca foi publicado. `vercel.json`/projeto na
   Vercel ainda não existem.
2. Domínio — decisão pendente desde a Fase 3 (`00-gestao/pendencias.md`),
   nunca resolvida.
3. Variáveis de ambiente de produção — `.env.local` hoje só existe no
   Codespace; preciso confirmar que as mesmas chaves (Supabase URL,
   anon key, service role) serão configuradas como env vars na Vercel,
   nunca commitadas.
4. Dados de teste — confirmar que não sobrou nenhum registro fictício
   nas tabelas de negócio antes de abrir para o cliente (a fixture de
   isolamento foi removida, mas vale uma checagem final direta no banco
   antes do go-live).

**Bloqueante — segurança, antes de dados reais de cliente trafegarem:**
5. Risco **R10** (`00-gestao/riscos.md`) — contrato fechado é editável
   via API direta (bypass da aplicação); confirmado experimentalmente,
   não corrigido. Mitigação recomendada: trigger de banco análogo a
   `fn_empresa_id_immutable`, bloqueando UPDATE/DELETE em
   `contrato`/`contrato_servico` quando `status = 'fechado'`.
6. Riscos **R7–R9** do parecer de segurança original
   (`00-gestao/riscos.md`) — resquício de policy `anon`, cascade delete
   em `historico_tarefa`, vínculo `cliente↔usuario` frouxo. Esses três
   nunca foram reverificados contra o schema real implementado (o
   parecer é da Fase 4, anterior à implementação); precisam de uma
   auditoria pontual antes do go-live. **R5 e R6 já parecem mitigados**
   na prática via `fn_tarefa_evento_guard` (confirmado: trigger existe
   no banco e bloqueia sócio de reabrir tarefa concluída), mas a tabela
   de riscos ainda não foi atualizada para refletir isso.
7. Senha do admin exposta nesta sessão (`Tochapado123@`) foi mantida a
   pedido do usuário (fluxo de recuperação por e-mail estava falhando)
   — recomenda-se trocá-la assim que o fluxo de recuperação for
   corrigido, antes do go-live.

**Importante, mas não bloqueia o primeiro acesso:**
8. Onboarding guiado — banco pronto (migration aplicada), falta toda a
   UI (`OnboardingProvider`/`OnboardingTour`/Server Actions).
9. Portal do cliente — não implementado; decisão pendente sobre entrar
   nesta versão ou ficar para depois (ver "Decisões aguardando
   aprovação" abaixo).
10. Zero testes automatizados — `06-testes-evidencias/testes-automatizados/`
    está vazio; toda validação até aqui foi manual ou via script Node
    ad-hoc. Sem CI. Risco de regressão silenciosa em mudanças futuras.
11. Zero backups formais — `07-backups/` só tem `.gitkeep`; nenhum
    snapshot do banco foi salvo antes das migrations aplicadas.
12. Menu mobile (drawer) não testado visualmente nesta sessão (só por
    leitura de código/CSS) — vale um teste manual num celular real
    antes do go-live.

**Decisão de produto, não técnica (fora do controle desta sessão):**
13. Nome oficial do produto e identidade visual — em aberto desde a
    Fase 2 (`00-gestao/pendencias.md`).
14. LGPD, política de anexos, retenção de dados, aprovação jurídica de
    mensagens/fluxos — nenhum desses foi endereçado; relevante assim
    que houver dados reais de clientes da Betel no sistema.
15. Regras de cobrança/financeiro — fora do escopo do MVP, mas listado
    para não ser esquecido se entrar em uso real.

- Ver `00-gestao/pendencias.md` para o detalhamento de cada item acima
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
- Deploy real (Vercel) e domínio — nenhuma decisão tomada ainda
- Autorização explícita de push dos commits locais para o GitHub

## Última atualização

2026-08-18 (migration de onboarding aplicada; levantamento completo de
pendências para entrega ao cliente)
