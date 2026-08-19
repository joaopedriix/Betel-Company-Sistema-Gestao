# Memória de execução

## Data
2026-08-18/19

## Contexto
Consolidação do MVP Betel para demonstração comercial controlada.
Escopo congelado pelo usuário: só o fluxo principal + onboarding básico
+ dados/roteiro de demo. Sem staging, sem produção, sem GRANT amplo a
`service_role`.

## Decisões importantes
- **GRANT a `service_role` nas 11 tabelas de negócio: REJEITADO.**
  Nunca executado contra o Supabase real. Migration removida do
  repositório antes de ser commitada. Decisão completa registrada em
  `00-gestao/riscos.md`.
- Escopo congelado: sem portal do cliente, integrações, tema escuro,
  CI completo, LGPD jurídica, produção/domínio nesta rodada.
- Gatilho de geração automática de tarefas mantido como está
  (fechamento de contrato, não criação de evento) — confirmado com o
  usuário.
- Próxima etapa técnica real (não produção): projeto Supabase separado
  para staging — ainda não criado, decisão em aberto.

## O que foi executado
- Onboarding admin reduzido de 10→6 passos, sócio mantido em 5.
- 2 bugs reais corrigidos: contagem de tarefas em `/checklists`
  (reescrita da query, embed aninhado do Supabase não funcionava) e
  navegação de volta da Agenda diária ("← Ver mês").
- Indicador de dev do Next.js reposicionado (colidia com "Sair").
- Menu reagrupado: Agenda/Checklists/Tarefas em "Acompanhamento".
- 43 testes unitários (Vitest) criados — validação e cálculo de
  progresso/atraso.
- Dados fictícios de demonstração criados e validados end-to-end no
  navegador (2 clientes, 1 sócia, 1 serviço com checklist de 2 tarefas,
  2 eventos, 1 contrato fechado + 1 rascunho).
- Documentação: `docs/dados-demo.md`, `docs/roteiro-demonstracao-cliente.md`,
  `docs/limites-da-demonstracao.md`, `00-gestao/matriz-prontidao-uso-real.md`,
  `00-gestao/relatorio-sessao-2026-08-18-19.md`.

## O que não foi executado
- Testes de integração/E2E automatizados (bloqueado — sem ambiente
  isolado; `service_role` não tem GRANT em produção, por decisão).
- Validação de migrations do zero (mesmo bloqueio).
- Backup formal, deploy/Vercel, domínio, LGPD — fora do escopo desta
  rodada.
- Re-execução do onboarding/fluxo principal no navegador nesta
  continuação — **não repetida por não haver mudança de código desde a
  última validação real** (evidência em
  `06-testes-evidencias/testes-manuais/onboarding-navegacao.md` e no
  fluxo de demo já documentado). Nenhum arquivo de onboarding ou das
  telas do fluxo principal foi alterado depois dessa validação.

## Testes realizados
- `npm run lint`: 0 erros/warnings.
- `npm run build`: limpo.
- `npm run test:unit` (script real; `npm test` não existe no
  `package.json`): 43/43 passando.
- `git diff --check`: sem problemas de whitespace.

## Estado do produto
```
PRONTO PARA DEMONSTRAÇÃO CONTROLADA
NÃO PRONTO PARA PILOTO
NÃO PRONTO PARA PRODUÇÃO
```

## Pendências prioritárias
1. Decidir sobre projeto Supabase separado para staging (desbloqueia
   testes de integração e migrations do zero).
2. Sócio deveria ver a Agenda além de "Minhas tarefas"? (aberto)
3. Escopo da integração via API (pedido novo, só registrado).
4. Remover dados fictícios antes de qualquer dado real de cliente.

## Próximo passo recomendado
Apresentar a demonstração ao cliente usando
`docs/roteiro-demonstracao-cliente.md`; só depois decidir sobre
staging.

---

## Sessão adicional (2026-08-19, madrugada) — tarefas seguras sem autorização

Usuário pediu para continuar só com tarefas seguras (sem permissão
necessária) enquanto dormia. Nada do escopo congelado foi expandido —
só correções de lacunas já identificadas em `04-analises/melhorias-ux.md`
e documentação pedida pelo próprio protocolo do projeto.

### O que foi executado
- `docs/learning/MISTAKES.md` e `docs/learning/LESSONS.md` criados
  (referenciados em `LEARNING.md`/`CLAUDE.md`, mas nunca existiam) —
  4 erros reais + 4 lições conceituais desta sessão.
- Drawer mobile da sidebar agora fecha com `Escape` (mesmo padrão do
  tour de onboarding). Foco ainda não é preso dentro do menu — não
  corrigido (precisa de teste real em viewport mobile).
- `loading.tsx`, `error.tsx`, `not-found.tsx` adicionados na raiz do
  app — nenhuma rota tinha isso antes, caía tudo na tela genérica do
  Next.js. Não testados no navegador (só lint/build).
- `04-analises/melhorias-ux.md` atualizado: itens 2, 3 e 4 marcados
  como corrigidos.
- Regressão completa após cada mudança: lint, build, 43 testes
  unitários — todos limpos o tempo todo.

### O que não foi feito (exige decisão/autorização do usuário)
- Criar projeto Supabase de staging.
- Decidir se sócio vê a Agenda.
- Desenhar/implementar integração via API.
- Breadcrumbs e título de página por rota — deixados como "melhoria
  futura" (baixa prioridade, risco de virar "melhoria cosmética
  extensa" fora do escopo congelado).
- Testar loading/error/not-found no navegador — precisa forçar erro/404
  de propósito, melhor numa sessão com o Codespace ativo e o usuário
  presente.

### Estado do Git ao final desta rodada
27 commits locais à frente de `origin/main`, working tree limpo, nenhum
push feito.

---

## Continuação (2026-08-19) — GRANT reconfirmado, API + staging autorizados

Usuário reconfirmou cancelamento do GRANT amplo em produção (nada
executado, arquivo `0008` nunca existiu commitado) e autorizou
explicitamente seguir com integração via API e staging, nessa ordem.

### O que foi executado
- **Integração via API v1** desenhada e implementada: chave por
  empresa (hash SHA-256), só leitura, `/api/v1/eventos` e
  `/api/v1/tarefas`. Migration proposta `0009_api_keys.sql`. Ver
  `04-analises/integracao-api.md`.
- **Projeto Supabase de staging criado** (`betel-company-staging`,
  mesma organização da produção, plano gratuito) após confirmação
  explícita do usuário — o classificador de segurança tinha bloqueado
  a criação até essa confirmação direta.
- **Schema completo aplicado do zero em staging**, via SQL Editor
  (schema, policies, grants, migrations 0002-0007, 0009 com GRANTs de
  `service_role` liberados só ali). 12 tabelas confirmadas. Isso
  também serve como a validação de "migrations do zero" (Fase 5).
- Achado técnico: digitação simulada no editor Monaco corrompe texto
  (autocomplete interfere); resolvido usando a API do Monaco
  (`window.monaco.editor.getEditors()[0].getModel().setValue(...)`)
  para setar o SQL diretamente, sem simular teclas — registrado em
  `docs/learning/MISTAKES.md`.

### O que não foi feito
- **Copiar as chaves de API do staging (anon + service_role) e testar
  os endpoints de ponta a ponta** — o classificador de segurança
  bloqueou minha leitura da página de chaves do Supabase (evita expor
  os valores no transcript da conversa). Só o usuário pode copiar essas
  duas chaves. Ver `04-analises/ambiente-staging.md`.

### Estado do Git ao final
30 commits locais à frente de `origin/main`, working tree limpo, nenhum
push feito.

---

## Continuação (2026-08-19) — chaves de staging, API validada, demo ao vivo com incidente externo

Ordem cronológica dos eventos desta sessão (o usuário pediu relatório
sempre em ordem de acontecimento, não só por severidade).

### 1. Chaves de staging coladas pelo usuário
Usuário colou `anon key` e `service_role key` do projeto
`betel-company-staging` diretamente no chat (o classificador havia
bloqueado minha leitura automática da página). Usei uma vez via SSH
heredoc para escrever `.env.local` no Codespace, sem reimprimir os
valores em nenhum momento depois.

### 2. Integração via API validada de ponta a ponta em staging
`GET /api/v1/eventos` sem chave → `401`; com chave válida → `200` só
com dados da empresa dona da chave; `GET /api/v1/tarefas` com chave
válida → `200`. `.env.local` do Codespace restaurado para produção
depois do teste (backup/restore confirmado). Detalhes completos em
`04-analises/integracao-api.md` (seção "Validado em staging"). Segue
**não aplicada em produção** — falta autorização explícita separada
pra rodar a migration `0009_api_keys.sql` e os GRANTs estreitos.

### 3. Codespace deixado ligado com produção para demonstração ao cliente
Usuário pediu para deixar o Codespace ligado com dados reais de
produção para mostrar visualmente ao cliente por vídeo-chamada
("deixe o codespace ligado pra eu mostrar visualmente pro cliente").
Porta 3000 tornada pública a pedido do usuário, para tela maior na
exibição.

### 4. INCIDENTE AO VIVO — login travado durante a demonstração
Login ficou preso em "Entrando..." por minutos, na frente do cliente.
Diagnóstico (nesta ordem):
- Log do servidor mostrou `POST /login 200 in 31.9s` — login eventualmente
  funciona, só que absurdamente lento.
- `curl`/`fetch` de checagem de rede/DNS descartaram problema de
  conectividade básica (dezenas de ms).
- `curl` direto no endpoint `auth/v1/token?grant_type=password` do
  Supabase (com credencial falsa, sem usar conta real) confirmou o
  próprio endpoint de auth demorando **111-116s** pra responder.
- `status.supabase.com` confirmou incidente ativo e publicamente
  reconhecido: "401 errors due to JWT rejections" (aberto desde
  14/08/2026), "API Gateway: Degraded Performance". **Causa 100%
  externa, fora do controle do time.**
- A página `error.tsx` (criada na sessão anterior) chegou a aparecer
  para o usuário durante o incidente — confirma que o novo error
  boundary está funcionando como esperado, capturando uma falha real.

### 5. Tentativas de contorno avaliadas (nenhuma aplicada)
- **Rodar localmente (máquina do usuário) apontando pro mesmo Supabase
  de produção**: descartado — o gargalo é o serviço de auth do
  Supabase, não a hospedagem; local não muda isso.
- **Usar aba já logada (sessão existente) pra evitar novo login**:
  também travou — o middleware do Next.js revalida a sessão a cada
  request via `getUser()`, que chama o Supabase de novo.
- **Screenshots pra mostrar por imagem**: não foi possível gerar —
  qualquer carregamento de página protegida esbarra na mesma chamada
  travada.
- **Supabase local via Docker no PC do usuário**: Docker instalado mas
  Docker Desktop não estava rodando; primeira execução do
  `supabase start` levaria ~8-15min baixando imagens — não é solução
  para o momento da chamada.
- **Supabase local via Docker dentro do Codespace**: Codespace não tem
  Docker configurado no devcontainer; habilitar exigiria rebuild do
  container, derrubando a sessão e a porta pública que o cliente
  estava vendo — também descartado para o momento.
- Conclusão passada ao usuário: nenhuma solução rápida e segura
  disponível para o momento ao vivo; recomendado pausar a parte de
  navegação da demo e comunicar a instabilidade externa com
  transparência ao cliente, retomando depois.

### O que não foi feito
- Incidente **não resolvido** (depende do Supabase, não da nossa
  equipe) — última checagem confirmada: `HTTP:400 tempo:103.8s`,
  sem melhora.
- Ambiente Supabase local (Docker) planejado como plano B para
  próximas demonstrações, mas ainda **não construído** — combinado
  para ser feito com calma depois da chamada, sem pressa/risco.
- Aplicação da API v1 e GRANTs estreitos em produção — segue
  aguardando autorização explícita separada.

### Estado do produto
```
PRONTO PARA DEMONSTRAÇÃO CONTROLADA (ambiente/app em si)
DEMONSTRAÇÃO AO VIVO ATUAL COMPROMETIDA POR INCIDENTE EXTERNO
  DO SUPABASE (auth), FORA DO CONTROLE DA EQUIPE
NÃO PRONTO PARA PRODUÇÃO
```

### Pendências prioritárias (atualizado)
1. Acompanhar resolução do incidente do Supabase
   (status.supabase.com) — usuário pediu aviso assim que normalizar.
2. Construir ambiente Supabase local (Docker) como plano B de
   demonstração, sem pressa, fora de uma chamada ao vivo.
3. Autorização separada para aplicar API v1 + GRANTs estreitos em
   produção.
4. Sócio deveria ver a Agenda? (aberto desde sessão anterior)
5. Remover dados fictícios antes de qualquer dado real de cliente.

### Próximo passo recomendado
Enquanto o incidente do Supabase não normaliza, seguir o
desenvolvimento em paralelo pelas frentes que não dependem de auth ao
vivo (revisão de código, documentação, preparação do ambiente local
de Docker como plano B). Não repetir tentativas de login ao vivo até
`status.supabase.com` confirmar normalização.

---

## Continuação (2026-08-19) — plano de continuidade executado (auditoria, focus trap, tentativa de Docker no Codespace)

Execução do prompt "TAREFA: Executar plano de continuidade", em ordem.

### 1. Auditoria git (só leitura)
Confirmado: nenhum arquivo `0008` de GRANT existe (nem commitado, nem
solto) — só referências históricas em documentação. 33 commits locais
à frente de `origin/main` no início, nenhum push feito.

### 2. Documentação corrigida
`status-atual.md` reconciliado com staging/API v1/incidente;
`pendencias.md` ganhou seção única consolidando todas as decisões em
aberto.

### 3. Qualidade — tudo limpo
`lint`, `build`, 43/43 testes unitários, `git diff --check` (só avisos
de CRLF, sem erro real).

### 4. Focus trap no drawer mobile — implementado
`Sidebar`: `Tab`/`Shift+Tab` preso dentro do menu aberto, foco inicial
no botão fechar, foco devolvido ao botão que abriu o menu ao fechar.
Lint/build limpos depois. **Teste visual em viewport mobile real não
foi possível** — bloqueado pelo mesmo incidente do Supabase (ver
abaixo, item 5).

### 5. Testar error/loading/not-found no navegador — bloqueado
Confirmado no código (`middleware.ts`): o middleware roda em **todas**
as rotas (matcher cobre tudo, inclusive 404) e chama
`updateSession()` → `supabase.auth.getUser()` — a mesma chamada que
está travando 100+s no incidente. Ou seja, hoje **nenhuma** rota do
app é alcançável para teste, nem `not-found.tsx`. Não é um bug do
código, é o incidente externo ainda ativo.

### 6. Staging — saúde confirmada, suíte completa não executada
`curl` no health check do staging respondeu em 0,35s (saudável,
independente do incidente de produção). A suíte completa dos 27 testes
de isolamento (fixture já existe em `database/fixtures/`) **não foi
executada** nesta rodada — exige criar 6 contas via Admin API + seed
SQL + 27 casos manuais com múltiplos logins, desproporcional para
encaixar numa tarefa de continuidade. Registrado como pendência para
sessão dedicada.

### 7. Plano B Docker — tentado, bloqueado por limitação de ferramenta
Usuário corrigiu o rumo: Docker deveria ser habilitado **no Codespace
do projeto**, não na máquina local (parei a tentativa local em
andamento e limpei o `supabase init` feito ali). Sequência:
- `.devcontainer/devcontainer.json` do Codespace `expert-goggles-...`
  não tinha a feature `docker-in-docker` — adicionada, commitada
  (`e83979c`), sincronizada via bundle (sem push).
- Antes de reconstruir, confirmei com o usuário se a demonstração ao
  vivo já tinha terminado (rebuild derruba a sessão/porta pública) —
  confirmado que sim.
- `gh codespace rebuild` (simples e depois `--full`) no
  `expert-goggles-...`: Docker continuou ausente nos dois casos.
- Recriação do zero (`gh codespace delete` + `create -b main`):
  revelou a causa raiz — como nunca fazemos `push`, `origin/main` no
  GitHub ainda tinha o `devcontainer.json` **antigo**, e
  `codespace create` clona do GitHub, não da máquina local. Corrigido
  sincronizando o bundle pro codespace novo (`super-space-memory-...`)
  e rodando `rebuild --full` nele — **Docker continuou ausente mesmo
  assim**, confirmando que o `gh codespace rebuild` via CLI não
  reprocessa features de devcontainer de forma confiável, independente
  de rebuild simples, `--full`, ou recriação.
- **Causa raiz real, encontrada depois** (lendo o log de criação do
  Codespace, `/workspaces/.codespaces/.persistedshare/creation.log`):
  não era limitação da CLI — o build do container **falhava de
  verdade** (`docker buildx build`, erro `1302
  UnifiedContainersErrorFatalCreatingContainer`) ao processar a
  feature `docker-in-docker`, e o Codespaces caía **silenciosamente**
  para um "container de recuperação" mínimo (Alpine, sem Node, sem
  npm, sem Docker) — por isso nada funcionava, nem o próprio Node.
  Prova concreta encontrada só depois de reverter: `npm install`
  retornava `npm: command not found` mesmo em shell de login.
- **Ação corretiva:** revertido `docker-in-docker` do
  `devcontainer.json` (commit `02ea318`), sincronizado (bundle, sem
  push) e reconstruído (`rebuild --full`) — Node/npm confirmados de
  volta (`v22.23.2`/`10.9.8`), `.env.local` intacto. `npm install`
  disparado para deixar o Codespace utilizável de novo.
- **Conclusão:** Docker no Codespace **não é simplesmente uma questão
  de reprocessar features** — a instalação da feature
  `docker-in-docker` falha de fato nesse ambiente/conta (possível
  causa: nested virtualization não suportada na máquina
  `basicLinux32gb`/`standardLinux32gb` deste plano de Codespaces).
  Registrado em `pendencias.md` como investigação separada, não como
  simples "rebuild manual pendente".
- `.env.local` de produção salvo em backup local antes de apagar o
  Codespace antigo, e restaurado no novo (`super-space-memory-...`) —
  confirmado 11 linhas, igual ao original. `npm install` disparado no
  Codespace novo para deixá-lo pronto para uso assim que o usuário
  fizer o rebuild manual.

### Estado do Git ao final
Commit `e83979c` local, sincronizado (via bundle, sem push) em ambos
os Codespaces que existiram nesta etapa. Nenhum push feito.

---

## Continuação (2026-08-19) — Docker no Codespace (causa raiz + revert), incidente resolvido, testes de UX

### 1. Verificação da premissa "Docker via Codespace confirmado em uso"
Não era verdade — testado direto (`docker: command not found`),
confirmando o estado já registrado na rodada anterior (feature
revertida por falha real de build). Não insisti de novo, conforme
regra "se falhar, parar e reportar".

### 2. Parte B executada
- Backup do `.env.local` de produção confirmado (11 linhas, igual ao
  original) antes de qualquer ação.
- Senha do admin exposta: **não resolvido** — não há como identificar
  a conta admin com segurança sem acessar `usuario` (sem GRANT) ou sem
  o usuário informar o e-mail. Registrado como pendência com
  recomendação (usuário troca pelo painel, testa recuperação por
  e-mail ao mesmo tempo).
- Qualidade: lint, build, 43/43 testes, `git diff --check` — tudo
  limpo.
- **Incidente do Supabase confirmado RESOLVIDO**: latência caiu de
  100+s para 0,4-0,5s (3 medições seguidas), Supabase confirmou fix
  publicado em `status.supabase.com`.
- Dev server iniciado no Codespace atual; `not-found.tsx` testado e
  confirmado com evidência visual (screenshot); `error.tsx` já tinha
  evidência real de produção (visto pelo usuário durante o incidente).
  Focus trap do drawer mobile e `loading.tsx` **não testados** — exigem
  login, que não faço (nunca digito senha). Registrado como pendência.
- Item 8 (IDs dos dados fictícios): bloqueado pelo classificador de
  segurança ao tentar abrir o SQL Editor de produção sem autorização
  explícita para essa ação pontual nesta tarefa — respeitado, não
  contornado.
- `docs/plano-b-demonstracao.md` criado, documentando as tentativas de
  Docker (local e Codespace) e o estado real da contingência (staging
  saudável, Docker indisponível).

### O que não foi feito
- Troca da senha do admin (precisa do e-mail da conta ou ação direta
  do usuário).
- IDs exatos dos dados fictícios (precisa de autorização para SQL de
  produção).
- Focus trap e `loading.tsx` em navegador (precisa de login do
  usuário).
- Parte C (decisões do usuário) — apenas listada, não executada,
  conforme instrução.

### Estado do produto
```
INCIDENTE DO SUPABASE RESOLVIDO — sistema acessível normalmente
CODESPACE ATUAL FUNCIONAL (Node/npm/dev server OK, sem Docker)
PRONTO PARA DEMONSTRAÇÃO CONTROLADA
NÃO PRONTO PARA PRODUÇÃO
```
