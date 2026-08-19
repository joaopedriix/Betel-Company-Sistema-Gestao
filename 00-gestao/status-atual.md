# Status atual do projeto Betel

## Fase atual

MVP funcional completo (fluxo principal ponta a ponta): autenticação,
cadastros base, contratos, eventos, checklist automático, tarefas,
progresso, dashboard, navegação, onboarding guiado, agenda, visão
agregada de tarefas/checklists e área de negócio — todos implementados.
Os 4 riscos de segurança pendentes na última auditoria (R7, R8, R9, R10)
foram reavaliados: R7 e R10 corrigidos e aplicados contra o Supabase
real, R8 não era um problema real, R9 confirmado mas adiado por decisão
de produto. Sistema hoje só existe rodando em ambiente de desenvolvimento
(Codespace) — **ainda não está em condições de uso pelo cliente real**;
ver "Pendências para entrega ao cliente" abaixo.

## Status

Em andamento — MVP funcional pronto, riscos de segurança conhecidos
tratados, mas ainda com pendências de infraestrutura/produto antes de
poder ser usado pelo cliente real (não é só "aguardando push")

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
  documentado como R10 em `00-gestao/riscos.md` nesse momento (corrigido
  logo em seguida, ver abaixo); lint/build limpos; nenhum secret no diff.
  Fixture de teste removida ao final.
- **Menu de navegação lateral** (2026-08-18): `Sidebar` no layout raiz,
  grupos colapsáveis (Cadastros, Eventos) com seta que gira ao abrir,
  drawer mobile, `LogoutButton` centralizado no rodapé.
- **R10 corrigido** (2026-08-18): migration
  `0005_contrato_fechado_immutable.sql` aplicada contra o Supabase real
  (autorização explícita do usuário). Dois triggers de guarda
  (`fn_contrato_fechado_immutable`, `fn_contrato_servico_fechado_immutable`)
  bloqueiam UPDATE/DELETE em `contrato`/`contrato_servico` quando o
  contrato já está `fechado`, fechando o bypass via API confirmado no
  gate final. Testado com fixture 100% transacional (6 cenários,
  `ROLLBACK` no final, zero dados de teste persistidos). Detalhe em
  `00-gestao/riscos.md` (R10) e `00-gestao/registro-de-bugs.md`.
- **Auditoria R5–R9 contra o schema real** (2026-08-18): R5/R6 já
  mitigados por `fn_tarefa_evento_guard` (confirmado no banco). R8 não é
  um problema real — a FK de `historico_tarefa` usa `ON DELETE RESTRICT`,
  não `CASCADE`. R7 confirmado e **corrigido**: `anon` tinha GRANT
  residual de `TRUNCATE`/`TRIGGER`/`REFERENCES` em todas as 11 tabelas de
  negócio (nunca SELECT/INSERT/UPDATE/DELETE, risco prático baixo, mas
  violava least-privilege); migration `0006_revoke_anon_residual_grants.sql`
  aplicada contra o Supabase real, zero grants residuais confirmados
  depois. R9 confirmado (`cliente.usuario_id` sem constraint
  cross-tenant), mas correção **adiada intencionalmente**: campo não é
  usado por nenhuma tela ainda (`portal-cliente` é stub). Ver
  `00-gestao/riscos.md` e `00-gestao/registro-de-bugs.md`.
- **Onboarding guiado implementado** (2026-08-18): `OnboardingProvider` +
  `OnboardingTour` por perfil (admin/sócio), persistência via Server
  Action nas colunas da migration `0004`, botão "Refazer dicas" na
  sidebar. Segundo o commit, testado ponta a ponta (abre no primeiro
  acesso, avança/volta/pula, persiste conclusão, não reabre sozinho) —
  **essa validação ainda não foi confirmada nesta sessão com evidência
  direta no navegador**, só por inspeção do código e da mensagem do
  commit (ver pendência de verificação abaixo).
- **Menu de navegação expandido + área de negócio** (2026-08-18):
  páginas `/agenda` (calendário diário/mensal/anual), `/tarefas` (visão
  agregada de todas as tarefas, diferente de `/minhas-tarefas`) e
  `/checklists` (hub por serviço); campo "área de negócio" no evento
  (Betel Noivas/Eventos/Decorações/Estúdio) via migration
  `0007_evento_area.sql`, com cor por área na agenda e link de WhatsApp
  do cliente. Migrations `0005`/`0006`/`0007` todas aplicadas contra
  produção nesta sessão, cada uma com autorização explícita do usuário.

## Em andamento

- Verificação com evidência real (navegador) do onboarding, da navegação
  nova (agenda/tarefas/checklists) e da área de negócio — implementados
  e commitados localmente, mas ainda não validados nesta sessão além da
  leitura do código e da mensagem de commit.
- **Ambiente de staging criado e API v1 validada** (2026-08-19):
  projeto Supabase separado `betel-company-staging`, schema completo
  aplicado do zero, integração via API (`/api/v1/eventos`,
  `/api/v1/tarefas`) testada de ponta a ponta (401 sem chave, 200 com
  chave válida e dados escopados). Ainda não aplicado em produção
  (migration `0009_api_keys.sql` + GRANTs estreitos aguardando
  autorização separada). Ver `04-analises/integracao-api.md` e
  `04-analises/ambiente-staging.md`.
- **Incidente externo do Supabase Auth** (2026-08-19): demonstração ao
  vivo ao cliente comprometida por latência de 100+s no login,
  confirmado como incidente público e ativo do Supabase
  (`status.supabase.com`), fora do controle da equipe. **RESOLVIDO**
  no mesmo dia — latência normalizada para 0,4-0,5s, confirmado com
  múltiplas medições e fix publicado pelo Supabase. Ver
  `00-gestao/memoria-execucao.md`.
- **Tentativa de Docker no Codespace como plano B** (2026-08-19): não
  funcionou — falha real de build (`docker buildx`, erro 1302),
  revertida com segurança. Detalhes e caminhos possíveis em
  `docs/plano-b-demonstracao.md`.

## Próxima tarefa

- Ordem da Fase 5 (uma por vez): ~~autenticação~~ ~~cadastros base~~
  ~~contratos~~ ~~eventos~~ ~~checklist automático~~ ~~minhas tarefas~~
  ~~progresso~~ ~~dashboard~~ ~~layout/navegação compartilhado~~
  ~~onboarding guiado~~ ~~agenda/tarefas agregadas/checklists~~ — **todos
  concluídos**. Ver "Pendências para entrega ao cliente" abaixo para o
  que falta antes do MVP poder ser usado de verdade: validação real no
  navegador, testes automatizados, migrations do zero, backup, staging,
  dados de demonstração e material para o cliente.

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
5. ~~Risco R10 (contrato fechado editável via API direta)~~ — **corrigido
   em 2026-08-18**, ver acima e `00-gestao/riscos.md`.
6. ~~Riscos R7–R9~~ — **auditados em 2026-08-18** contra o schema real:
   R7 corrigido, R8 não era um problema real, R9 confirmado e
   formalmente adiado (registrado em `00-gestao/riscos.md`, sem risco
   prático hoje porque o campo não é usado por nenhuma tela).
7. Senha do admin exposta em sessão anterior (`Tochapado123@`) — status
   de troca não confirmado nesta sessão; recomenda-se validar que foi
   trocada (ou trocar agora) e que o fluxo de recuperação por e-mail
   está funcionando, antes do go-live.

**Importante, mas não bloqueia o primeiro acesso:**
8. ~~Onboarding guiado — falta UI~~ — **implementado e validado em
   2026-08-18** (`OnboardingProvider`/`OnboardingTour`/Server
   Actions/"Refazer dicas"), com evidência real no navegador para os
   perfis admin e sócio. Ver
   `06-testes-evidencias/testes-manuais/onboarding-navegacao.md`.
9. Portal do cliente — não implementado; decisão pendente sobre entrar
   nesta versão ou ficar para depois (ver "Decisões aguardando
   aprovação" abaixo).
10. Testes automatizados — **camada unitária criada** (2026-08-18):
    Vitest, 43 testes cobrindo as 6 funções de validação e o cálculo de
    progresso/atraso de tarefas (`06-testes-evidencias/testes-automatizados/unit/`),
    todos passando. **Integração e E2E ainda bloqueados**: `service_role`
    não tem GRANT em nenhuma tabela de negócio (achado real, ver
    `00-gestao/riscos.md`), e o usuário **rejeitou explicitamente**
    (2026-08-18) ampliar esse GRANT em produção para viabilizar criação
    de fixtures de teste. Alternativa aprovada — um projeto Supabase
    separado, só para staging/testes — ainda não foi criado (decisão de
    infraestrutura em aberto, ver "Decisões aguardando aprovação").
    Ainda sem CI.
11. Zero backups formais — `07-backups/` só tem `.gitkeep`; nenhum
    snapshot do banco foi salvo antes das migrations aplicadas.
12. Menu mobile (drawer) não testado visualmente em navegador real —
    vale um teste manual num celular real antes do go-live.

**Decisão de produto, não técnica (fora do controle desta sessão):**
13. Nome oficial do produto e identidade visual — em aberto desde a
    Fase 2 (`00-gestao/pendencias.md`).
14. LGPD, política de anexos, retenção de dados, aprovação jurídica de
    mensagens/fluxos — nenhum desses foi endereçado; relevante assim
    que houver dados reais de clientes da Betel no sistema.
15. Regras de cobrança/financeiro — fora do escopo do MVP, mas listado
    para não ser esquecido se entrar em uso real.

- Ver `00-gestao/pendencias.md` para o detalhamento de cada item acima
- Nenhuma migration testada do zero em ambiente efêmero (só análise
  estática + execução real contra produção) — sem risco real hoje, mas
  registrar para quando houver ambiente de CI/staging
- Portal do cliente não implementado (decisão pendente de aprovação)

## Riscos

- Ver `00-gestao/riscos.md` (tabela de severidade no final, todos os 10
  riscos R1–R10 com status atualizado) e `04-analises/auditoria-mvp.md`
  seção 16
- O bug de recursão de RLS (evento↔tarefa_evento) está latente também no
  `policies.sql` original (pré-multitenant) — só corrigido dentro de
  `0002_multitenant.sql`. Sem impacto hoje, mas relevante se
  `policies.sql` for reaplicado isoladamente no futuro

## Decisões aguardando aprovação

- Se o portal do cliente com login entra nesta primeira versão do MVP ou
  fica só como "visualização pública sem login"
- Deploy real (Vercel) e domínio — nenhuma decisão tomada ainda
- Autorização explícita de push dos commits locais para o GitHub
- ~~Criar um projeto Supabase separado (staging/testes)~~ — **RESOLVIDO
  2026-08-19**: `betel-company-staging` criado e schema aplicado do
  zero (autorização explícita do usuário), destravando testes de
  integração e a validação de migrations do zero (Fase 5).
- Aplicar API v1 + migration `0009_api_keys.sql` (GRANTs estreitos de
  `service_role`, só `SELECT` em 3 tabelas) em **produção** — validada
  em staging, aguardando autorização separada.

## Última atualização

2026-08-19 (reconciliado com o histórico real do git — 33 commits à
frente de `origin/main`, nenhum push: staging criado, API v1 validada
em staging, incidente externo do Supabase registrado)
