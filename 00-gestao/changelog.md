# Changelog

## 2026-08-16

**Alteração:** Setup inicial do projeto Betel Company
**Arquivos:** README.md, docs/, src/, public/, tests/, .devcontainer/, .gitignore
**Motivo:** Criação do repositório e estrutura inicial
**Resultado dos testes:** Não aplicável (sem código)

**Alteração:** docs: modelo de dados conceitual do módulo Checklists
**Arquivos:** docs/04-checklists-e-rotinas-operacionais.md
**Motivo:** Registrar modelo de dados conceitual levantado com o cliente
**Resultado dos testes:** Não aplicável (documentação)

**Alteração:** docs: transcreve checklist mestre Conferência Final
**Arquivos:** docs/04-checklists-e-rotinas-operacionais.md
**Motivo:** Registrar checklist real fornecido pelo cliente
**Resultado dos testes:** Não aplicável (documentação)

**Alteração:** docs: detalha módulo Checklists como prioridade
**Arquivos:** docs/03-modulos-e-fluxos-do-sistema.md
**Motivo:** Registrar prioridade definida pelo cliente
**Resultado dos testes:** Não aplicável (documentação)

## 2026-08-17

**Alteração:** Reorganização da estrutura de pastas para o padrão oficial
(00-gestao, 01-documentacao, 02-original-cliente, 03-projeto-betel,
04-analises, 05-prompts, 06-testes-evidencias, 07-backups,
08-arquivos-temporarios), conforme `05-prompts/00-organizacao-geral-do-projeto.md`
**Arquivos:** docs/* movidos para 01-documentacao/* e 00-gestao/pendencias.md;
src/, public/, tests/ movidos para dentro de 03-projeto-betel/; criação dos
arquivos de gestão (status-atual.md, escopo-do-projeto.md,
decisoes-tecnicas.md, riscos.md, changelog.md); cópia do prompt-mestre para
05-prompts/00-organizacao-geral-do-projeto.md
**Motivo:** Alinhar o projeto ao método de organização solicitado pelo usuário
**Resultado dos testes:** Não aplicável (reorganização de arquivos, sem código)

**Alteração:** Fase 2 concluída (definição do escopo do MVP) a partir de
especificação fornecida pelo usuário; Fase 3 (planejamento técnico)
registrada como proposta
**Arquivos:** `01-documentacao/requisitos/mvp.md`,
`01-documentacao/requisitos/backlog.md`,
`01-documentacao/perfis-de-usuario/perfis-iniciais.md`,
`01-documentacao/regras-de-negocio/regras-iniciais.md`,
`01-documentacao/fluxos-do-sistema/fluxos-iniciais.md`,
`00-gestao/decisoes-tecnicas.md`, `00-gestao/escopo-do-projeto.md`,
`00-gestao/pendencias.md` (itens resolvidos marcados), `00-gestao/status-atual.md`
**Motivo:** Organizar a especificação de MVP recebida nos locais corretos
da estrutura do projeto e propor o planejamento técnico antes de
implementar qualquer código
**Resultado dos testes:** Não aplicável (documentação/planejamento, sem código)

**Alteração:** Time SaaS (architect, devops, qa, security) executado em
paralelo: schema SQL + RLS, scaffold Next.js, estratégia de testes,
parecer de segurança; 2 correções aplicadas no schema após o parecer
(FORCE ROW LEVEL SECURITY, e FK de historico_tarefa de CASCADE para
RESTRICT)
**Arquivos:** `03-projeto-betel/database/schema.sql`,
`03-projeto-betel/database/policies.sql`, `03-projeto-betel/` (scaffold
Next.js completo — ver README do projeto), `06-testes-evidencias/relatorios/estrategia-de-testes.md`,
`06-testes-evidencias/testes-manuais/roteiro-criterios-aceite-mvp.md`,
`00-gestao/riscos.md`
**Motivo:** Preparar banco, ambiente e plano de testes antes da primeira
funcionalidade de código (Fase 5), com revisão de segurança prévia
**Resultado dos testes:** `npm run build` do scaffold Next.js passou (13
rotas, TypeScript OK). Schema/RLS ainda não aplicados em banco real —
teste de integração fica para a Fase 5/6.

**Alteração:** Criado o projeto Supabase real (`betel-company`, São Paulo)
e aplicado schema + RLS; criado usuário admin de teste; implementada e
testada a autenticação (login/logout, proteção de rota por perfil)
**Arquivos:** `03-projeto-betel/database/grants.sql` (novo),
`03-projeto-betel/src/middleware.ts`, `src/lib/supabase/middleware.ts`,
`src/lib/auth/rotas.ts`, `src/app/login/actions.ts`, `src/app/login/page.tsx`,
`src/components/logout-button.tsx`, `03-projeto-betel/README.md`,
`03-projeto-betel/.env.local` (não versionado)
**Motivo:** Validar de ponta a ponta a fundação de autenticação antes de
implementar cadastros, conforme regra do projeto de não declarar algo
pronto sem testar de verdade
**Bug encontrado e corrigido:** login autenticava no Supabase Auth mas
retornava "Conta sem acesso habilitado" mesmo com o usuário correto em
`public.usuario`. Causa: RLS decide quais *linhas* um usuário vê, mas o
Postgres exige `GRANT SELECT/INSERT/UPDATE/DELETE` na *tabela* para o role
`authenticated` separadamente — isso não foi criado automaticamente porque
o projeto Supabase foi criado com "Automatically expose new tables"
desligado (decisão de segurança). Corrigido aplicando
`03-projeto-betel/database/grants.sql` (grants mínimos, `historico_tarefa`
só com SELECT).
**Resultado dos testes:** Login testado de ponta a ponta no navegador
(`npm run dev` + Supabase real): autenticação, leitura do perfil via RLS,
e redirecionamento para `/dashboard` como admin — sucesso.

**Alteração:** Auditoria técnica e funcional completa do MVP (a pedido do
usuário, sem implementar módulos novos). Checkpoint Git commitado e
enviado (push autorizado explicitamente). Criado Codespace dedicado ao
projeto Betel para rodar os testes técnicos, corrigindo 2 problemas de
`.devcontainer/devcontainer.json` (feature `docker-in-docker`
incompatível; faltava `sshd`) e 2 problemas reais de infraestrutura de
código: `next lint` removido no Next.js 16 (script de lint nunca
funcionaria) e Node 20 incompatível com `@supabase/*` (exige `>=22`)
**Arquivos:** `04-analises/auditoria-mvp.md` (novo, relatório completo),
`04-analises/decisoes-do-mvp.md` (novo),
`06-testes-evidencias/testes-manuais/roteiro-auditoria-completo.md` (novo),
`.devcontainer/devcontainer.json`, `03-projeto-betel/package.json`,
`03-projeto-betel/eslint.config.mjs` (novo)
**Motivo:** Confirmar o estado real do projeto antes de continuar a Fase
5, e validar `lint`/`build` no Codespace conforme solicitado
**Resultado dos testes:** No Codespace (Node 22): `npm install` limpo (0
vulnerabilidades, sem EBADENGINE), `npm run lint` sem erros/warnings,
`npm run build` OK (13 rotas, TypeScript OK). Codespace pausado ao final.
**Achado principal:** apenas autenticação está implementada; todo o
restante do MVP funcional (cadastros, contratos, checklist automático,
progresso, dashboard) ainda não existe — telas são stubs. Nenhum dado
fictício encontrado; tudo que existe é real e testado, o que falta está
claramente marcado como ausente.

**Alteração:** Planejamento (análise + proposta, nada executado) de
arquitetura multitenant — decisão de produto confirmada pelo usuário:
multiempresa desde o MVP, Betel como primeiro tenant, sem billing
**Arquivos:** `04-analises/decisoes-do-mvp.md` (atualizado),
`04-analises/arquitetura-multitenant.md` (novo — análise do schema atual
+ modelo proposto + policies propostas + auditoria de `service_role`),
`04-analises/plano-migration-tenant.md` (novo),
`04-analises/testes-isolamento-tenant.md` (novo),
`03-projeto-betel/database/proposals/0002_multitenant.sql` (novo — SQL
de proposta, fora do fluxo de deploy, não executado)
**Motivo:** Preparar a decisão de multiempresa antes de escrever a
lógica de negócio da Fase 5, evitando reescrever ~20 policies depois
**Achados da análise:** zero uso de `service_role` no código hoje (nada
a corrigir); ponto crítico identificado — `is_admin()` atual não
considera tenant, precisa ser redefinida antes de a multiempresa entrar
em produção (senão um admin veria dados de todas as empresas)
**Resultado dos testes:** Não aplicável — nenhum SQL foi executado,
apenas documentação e proposta. Aguardando aprovação explícita do
usuário antes de aplicar a migration.

**Alteração:** Revisão final da proposta multitenant (3 correções
achadas) e **execução da migration `0002_multitenant.sql`** contra o
Supabase real da Betel, aprovada explicitamente pelo usuário
**Correções feitas na revisão, antes de rodar:**
1. Tabela `empresa` não tinha RLS/policy/grant — corrigido (mesmo tipo
   de bug do GRANT ausente já visto antes nas outras 10 tabelas).
2. Criação da empresa Betel não era idempotente — corrigido (`select`
   antes de `insert`).
3. Padrão `is_admin() and empresa_id = current_empresa_id()` repetido
   em cada policy trocado por uma função única `is_admin_of(empresa_id)`
   — reduz risco de uma policy futura esquecer o filtro de tenant.
   Adicionado também um trigger `fn_empresa_id_immutable` em todas as 10
   tabelas: `empresa_id` nunca pode mudar após a criação da linha, nem
   por admin (defesa em profundidade, não depende só do `WITH CHECK`).
**Ambiente de execução:** Codespace dedicado (`expert-goggles-4qqjvj57wv5g24ww`,
Node 22), via `psql` conectado pelo *session pooler* do Supabase (IPv4 —
a conexão direta é IPv6-only e o Codespace não tinha rota IPv6).
**Arquivos:** `03-projeto-betel/database/proposals/0002_multitenant.sql`
(script executado), `04-analises/arquitetura-multitenant.md`,
`04-analises/plano-migration-tenant.md`,
`04-analises/testes-isolamento-tenant.md`,
`04-analises/decisoes-do-mvp.md` (status atualizado para "aplicado")
**Resultado da execução:** `BEGIN` → todos os passos → `COMMIT`, **sem
erros**. 10 validações pós-migration, todas conferidas: tabela `empresa`
criada com a Betel; usuário admin vinculado; `empresa_id NOT NULL` sem
nenhuma linha nula nas 10 tabelas; 10 FKs; 10 índices; 4 funções
(`current_empresa_id`, `is_admin`, `is_admin_of`,
`fn_empresa_id_immutable`); 24 policies (23 recriadas + `empresa_self_select`);
RLS `ENABLE`+`FORCE` nas 11 tabelas; 10 triggers de imutabilidade; GRANT
SELECT em `empresa` para `authenticated`. Login/autenticação
revalidados via API REST após a migration — funcionando, agora com
`empresa_id` preenchido na resposta.
**Não executado:** criação de um segundo tenant de teste para os 21
testes de isolamento (`04-analises/testes-isolamento-tenant.md`) —
requer criar dados fictícios novos, deixado para decisão explícita do
usuário.

**Alteração:** Criado o tenant fictício "Empresa B — Teste" com 5
usuários e dados de negócio sintéticos, e executados os 21 (27 com
sub-itens) testes de isolamento propostos — **27/27 passaram**
**Arquivos:** `04-analises/testes-isolamento-tenant.md` (resultados),
`03-projeto-betel/database/proposals/0002_multitenant.sql` (2 correções
incorporadas, ver abaixo)
**Bugs reais encontrados DURANTE a execução dos testes (nenhuma revisão
estática pegaria isso):**
1. `fn_log_tarefa_evento()` (trigger pré-existente da Fase 4) não
   preenchia `empresa_id` ao gravar em `historico_tarefa` (agora `NOT
   NULL`) — toda criação de tarefa quebrava. Corrigido no banco real e
   incorporado ao arquivo da migration.
2. Recursão infinita de RLS (`42P17`) entre `evento` e `tarefa_evento` —
   par de policies **pré-existente desde a Fase 4** (`evento_socio_select`
   consultava `tarefa_evento` direto, e vice-versa com
   `tarefa_evento_cliente_select`), nunca detectado porque nunca havia
   dados reais nessas duas tabelas com sócio/cliente testando ao mesmo
   tempo. Corrigido com nova função `SECURITY DEFINER`
   `socio_responsavel_no_evento()`.
**Resultado dos testes:** 27/27 casos de isolamento passaram após as
correções — leitura, troca de ID por URL/API, inserção/atualização
maliciosa de `empresa_id`, e as 6 combinações de perfil×tenant, todos
bloqueados corretamente no backend.
**Pendência:** dados fictícios de teste (tenant "Empresa B — Teste" + 5
usuários + registros) permanecem no banco — decidir se mantêm como
fixture ou são limpos antes de demonstração real.

**Alteração:** Limpeza controlada de todos os dados fictícios de teste
(Empresa B inteira + registros ficticios dentro da Betel), e criação de
um fixture reproduzível separado, isolado dos seeds reais
**Arquivos:** `03-projeto-betel/database/fixtures/seed-tenant-isolation.sql`
(novo), `03-projeto-betel/database/fixtures/cleanup-tenant-isolation.sql`
(novo), `03-projeto-betel/database/fixtures/tenant-isolation-test.md`
(novo — passo a passo de reprodução)
**Motivo:** Usuário optou por remover TODOS os dados fictícios (inclusive
os 2 usuários + 1 registro por tabela que ficaram dentro da própria
Betel, além da Empresa B inteira), para deixar o banco limpo antes da
Fase 5 — decisão explícita, ampliando o pedido original (só Empresa B)
**Procedimento:** localizado por nome do tenant (nunca DELETE sem
filtro), com assert de segurança contra atingir o ID da Betel; ordem
respeitando FKs (`historico_tarefa` primeiro, `empresa` por último); 5
contas removidas do Supabase Auth via Admin API depois da limpeza do
schema `public`
**Resultado da validação pós-limpeza:** Empresa B não existe mais (0);
Betel intacta (1 empresa, 1 usuário — só o admin real); todas as 9
tabelas de negócio da Betel voltaram a 0 linhas; 6 funções presentes; 24
policies presentes; RLS `ENABLE`+`FORCE` nas 11 tabelas; login do admin
Betel revalidado via API REST, funcionando
**Reprodutibilidade da migration:** não testada em banco efêmero real
(Docker indisponível no Codespace, não criado outro projeto Supabase só
para isso) — feita análise estática da ordem de dependências em vez
disso. Achado: o bug de recursão de RLS (evento↔tarefa_evento) está
latente também no `policies.sql` original (pré-multitenant), só
corrigido dentro de `0002_multitenant.sql`
**Resultado dos testes:** lint 0 erros, build OK (TypeScript sem erros),
sem testes automatizados ainda (não implementados), sem migrations
pendentes inesperadas, sem arquivos sensíveis não rastreados.

## 2026-08-18

**Alteração:** feat: cadastros base (Clientes, Sócios/Usuários, Serviços)
**Arquivos:** `src/app/clientes/`, `src/app/usuarios/`, `src/app/servicos/`,
`src/lib/auth/usuario-atual.ts`, `src/lib/supabase/admin.ts`,
`src/lib/validation/`, `src/components/ui/{input,label,badge,textarea}.tsx`,
`next.config.ts`, `src/app/dashboard/page.tsx`, `src/app/minhas-tarefas/page.tsx`
**Motivo:** Fase 5 — três primeiros CRUDs reais do MVP; nenhuma migration
necessária (schema multitenant já tinha os campos suficientes)
**Segurança:** `empresa_id` sempre resolvido no servidor via
`getUsuarioAtual()`, nunca aceito do formulário; só perfil `admin` cria/
edita (rotas em `ADMIN_ROUTES`, bloqueadas por middleware); `service_role`
usado só para `auth.admin.createUser` (criação de login), nunca para
dado de negócio — confirmado que a chave nem tem GRANT na tabela
`usuario` via API REST
**Bug real encontrado e corrigido:** proxy de port-forwarding do
Codespace reescreve o header `Origin` para `localhost:3000` ao repassar
a requisição, quebrando a proteção CSRF de Server Actions do Next —
corrigido em `next.config.ts` (`allowedOrigins`, só fora de produção)
**Resultado dos testes:** lint 0 erros; build OK (20 rotas, TypeScript
sem erros); testes funcionais completos dos 3 cadastros via navegador
(CRUD, busca, ativar/inativar, duplicidade); testes de segurança via API
REST com JWT real de um usuário sócio (RLS bloqueando INSERT/UPDATE nas
3 tabelas, sócio só vendo a própria linha em `usuario`, tentativa de
auto-promover para `admin` sem efeito); bloqueio de rota por perfil
confirmado no navegador (`/clientes`, `/usuarios`, `/servicos` e acesso
direto por ID redirecionam sócio para `/minhas-tarefas`); regressão de
isolamento entre tenants não reexecutada com fixture completa — decisão
registrada em `04-analises/decisoes-do-mvp.md` (nenhuma policy/função/
schema mudou nesta fase, confirmado via `git status`)

**Alteração:** feat: complete MVP (contratos, eventos, checklist
automático, tarefas, progresso, dashboard)
**Arquivos:** `src/app/contratos/`, `src/app/eventos/`,
`src/app/servicos/[id]/checklist/`, `src/app/minhas-tarefas/`,
`src/app/dashboard/page.tsx`, `src/lib/validation/{contrato,evento,
tarefa-padrao}.ts`, `database/proposals/0003_fechar_contrato.sql`,
`eslint.config.mjs`
**Motivo:** Fluxo principal completo do MVP — do cadastro ao dashboard.
Nenhuma migration de RLS/policy necessária (schema multitenant da Fase 6
já cobria as 6 tabelas usadas); única migration nova é a função aditiva
`fechar_contrato()`
**Geração automática de tarefas:** ao fechar um contrato, cada
`tarefa_padrao` ativa dos serviços contratados vira uma `tarefa_evento`,
com prazo calculado a partir da data do evento. Idempotente por design
(`SELECT ... FOR UPDATE` trava a linha do contrato durante a transação) —
testado chamando a RPC duas vezes no mesmo contrato: não duplicou
**Resultado dos testes:** lint 0 erros; build OK (29 rotas — contagem
exata via `grep -c` na saída do build, incluindo `/` e `/_not-found` —,
TypeScript sem erros); fluxo E2E completo testado no navegador com dados reais
(cliente → serviço+checklist → evento → contrato → fechamento → tarefa
gerada com prazo correto → sócio conclui a tarefa → dashboard mostra
progresso 100%); testes de segurança via API (sócio bloqueado de reabrir
tarefa concluída pelo trigger `fn_tarefa_evento_guard`, mensagem de erro
capturada); nenhum bug de aplicação encontrado nesta fase (só um ajuste
de config do ESLint, ver `00-gestao/registro-de-bugs.md`); dados
fictícios removidos ao final, Betel validada como intacta (só o admin
real permanece)

**Alteração:** feat: menu de navegação lateral (sidebar)
**Arquivos:** `src/components/layout/sidebar.tsx`, `src/lib/layout/nav-config.ts`,
`src/app/layout.tsx`, `src/app/dashboard/page.tsx`, `src/app/minhas-tarefas/page.tsx`
**Motivo:** até aqui não havia navegação compartilhada entre módulos — cada
página tinha `<LogoutButton />` manual e nenhum link visível entre
Cadastros/Eventos/Contratos, deixando o sistema navegável só por URL direta
**Arquitetura:** ponto único de inserção no layout raiz — `getUsuarioAtual()`
resolvido uma vez em `RootLayout` (agora `async`), sidebar só renderiza se
houver sessão (exclui `/login` sem checar pathname); itens de navegação por
perfil centralizados em `NAV_BY_PERFIL` (`nav-config.ts`), reaproveitando o
tipo `Perfil` já existente; grupos colapsáveis (Cadastros, Eventos) com seta
que gira ao abrir/fechar e abrem sozinhos se a rota ativa estiver dentro do
grupo; `LogoutButton` centralizado no rodapé da sidebar, removido das páginas
individuais
**Resultado dos testes:** lint 0 erros; build OK (29 rotas, TypeScript sem
erros); testado no navegador logado como admin — sidebar renderiza em
`/dashboard`, grupos "Cadastros" e "Eventos" expandem via clique na seta,
navegação para `/clientes` funciona e destaca o item ativo, logout continua
funcional a partir do rodapé; menu mobile (drawer) não pôde ser verificado
visualmente por limitação da ferramenta de automação de navegador nesta
sessão, mas usa o mesmo padrão de breakpoint Tailwind (`md:hidden`/`md:flex`)
já validado em outras telas do projeto

**Alteração:** feat: migration de onboarding guiado + inventário de pendências para entrega
**Arquivos:** `03-projeto-betel/database/0004_onboarding.sql`, `00-gestao/status-atual.md`
**Motivo:** usuário aprovou explicitamente a aplicação da migration
(`0004_onboarding.sql`, que estava pausada aguardando aprovação) e pediu
um levantamento completo do que falta para entregar o MVP ao cliente
**Migration:** aplicada contra o Supabase real via SQL Editor (produção);
adiciona `onboarding_concluido`/`onboarding_versao`/`onboarding_concluido_em`
em `usuario`, policy `usuario_self_update_onboarding` e trigger
`fn_usuario_self_update_guard` (mesmo padrão de `fn_tarefa_evento_guard`:
RLS é row-level, então o trigger bloqueia não-admin de alterar
nome/email/perfil/ativo/empresa_id via UPDATE direto, mesmo com a policy
liberando a própria linha)
**Resultado dos testes:** migration validada diretamente no schema (3
colunas, 1 policy, 1 trigger, 1 função — todos confirmados via query);
teste de fumaça (reload do dashboard logado) sem regressão. UI do
onboarding (`OnboardingProvider`/`OnboardingTour`) ainda não implementada
— só a base de dados está pronta
**Levantamento de pendências:** auditoria cruzando `00-gestao/riscos.md`
(parecer de segurança da Fase 4) com os triggers reais existentes no
banco hoje — confirmou que R5/R6 (transições de status só-admin) já
estão mitigados na prática via `fn_tarefa_evento_guard`, mesmo que o
documento de riscos ainda não refletisse isso; R7-R9 nunca foram
reverificados contra o schema real; R10 (contrato fechado editável via
API direta) segue confirmadamente aberto. Nenhum deploy real (Vercel)
existe ainda — sistema só roda em Codespace de desenvolvimento; zero
testes automatizados; zero backups formais. Lista completa e priorizada
em `00-gestao/status-atual.md`, seção "Pendências para entrega ao
cliente"
