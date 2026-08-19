# Decisões pendentes (perguntas bloqueadoras)

## [2026-08-19] — Consolidado: tudo que precisa de resposta do usuário agora

> Seção única reunindo todas as decisões em aberto espalhadas pelo
> documento (mantidas nas seções originais abaixo também, por
> rastreabilidade). Nada aqui foi assumido como resposta padrão.

1. **Autorizar API v1 em produção?** Validada de ponta a ponta em
   staging; falta autorizar a migration `0009_api_keys.sql` + GRANTs
   estreitos (`SELECT` em 3 tabelas) contra o Supabase real. Ver
   `04-analises/integracao-api.md`.
2. **Sócio deveria ver a Agenda?** Hoje só vê "Minhas tarefas". Aberto
   desde 2026-08-18.
3. **Portal do cliente entra nesta versão do MVP ou fica para depois?**
   Hoje é um stub ("Em Construção").
4. **Deploy real (Vercel) e domínio** — nenhuma decisão tomada; sistema
   só existe hoje rodando em Codespace de desenvolvimento.
5. **Autorização explícita de push** dos 33 commits locais para o
   GitHub — nunca solicitada nem dada.
6. **Nome oficial do produto e identidade visual** — em aberto desde a
   Fase 2.
7. **Se haverá clientes com mais de um evento** — o schema já assume
   1:N (um cliente, vários eventos); confirmar se está correto.
8. **Regras de cobrança/financeiro** e **política de anexos, retenção
   de dados, LGPD, aprovação jurídica** — nenhum endereçado; ficam
   relevantes assim que houver dado real de cliente trafegando.
9. **Senha do admin exposta em sessão anterior** (`Tochapado123@`) —
   status de troca não confirmado; recomenda-se validar/trocar antes
   do go-live.
10. **Executar a suíte completa de 27 testes de isolamento em
    staging?** Fixture já existe (`database/fixtures/`), mas é um
    trabalho grande (6 contas fictícias + 27 casos manuais com
    múltiplos logins) — não executado nesta rodada por ser
    desproporcional a uma tarefa de continuidade; sugiro sessão
    dedicada.
11. **Plano B — Supabase local via Docker no Codespace**: bloqueado
    por falha real de infraestrutura, não por limitação de ferramenta.
    Tentei habilitar a feature `docker-in-docker` no
    `.devcontainer/devcontainer.json` — em **todas** as tentativas
    (rebuild simples, `--full`, recriação do zero em 2 codespaces
    diferentes) o build do container falhou de verdade (log:
    `docker buildx build` → erro `1302
    UnifiedContainersErrorFatalCreatingContainer`), e o Codespaces caiu
    silenciosamente para um container de recuperação sem Node/npm/Docker
    — o ambiente ficou temporariamente inutilizável. **Já revertido**
    (commit `02ea318`): Codespace de volta ao normal, Node/npm
    confirmados, `.env.local` intacto.
    **Hipótese da causa:** a máquina do Codespace (`basicLinux32gb`)
    pode não suportar nested virtualization, exigido pelo
    `docker-in-docker`. **Precisa da sua decisão**: (a) tentar de novo
    numa máquina maior (`standardLinux32gb`, 4 cores/16GB — pode ter
    mais chance, mas não é garantido, e o plano gratuito pode não
    cobrir); (b) tentar habilitar Docker pela interface web/VS Code
    (pode dar mensagem de erro mais clara que a CLI); ou (c) desistir
    do Docker-no-Codespace e usar só o Supabase de staging (já
    saudável e funcionando) como ambiente de teste, sem Supabase local.
    **Efeito colateral já ocorrido:** o Codespace antigo
    (`expert-goggles-...`, usado na demonstração) foi apagado nesse
    processo — o atual é `super-space-memory-qvv747jqpx7p29x5q`, URL
    `https://super-space-memory-qvv747jqpx7p29x5q-3000.app.github.dev`
    (porta ainda não testada como pública). `.env.local` de produção
    restaurado nele (backup feito antes de apagar o antigo).

> Lista de perguntas que precisam ser respondidas antes de avançar em
> funcionalidades, banco de dados definitivo ou integrações reais.

## Produto / identidade

- [ ] Nome oficial do produto (sistema de gestão em si, distinto das marcas
      Betel Noivas/Eventos/BTU/etc.)
- [ ] Identidade visual definitiva

## Acesso e permissões

- [x] Quais perfis de acesso existirão — RESOLVIDO para o MVP (2026-08-17):
      Administrador/Gestor, Sócio/Responsável, Cliente. Ver
      `01-documentacao/perfis-de-usuario/perfis-iniciais.md`.
- [x] Quem poderá visualizar cada informação — RESOLVIDO para o MVP, ver
      mesmo arquivo acima e `01-documentacao/regras-de-negocio/regras-iniciais.md`.
- [ ] Se haverá clientes com mais de um evento
- [x] Regras exatas do portal do cliente (o que o cliente vê/edita) —
      RESOLVIDO para o MVP: cliente só vê dados/contratos/eventos próprios,
      progresso geral e etapas do checklist marcadas como públicas; não vê
      tarefas internas, comentários, problemas operacionais nem dados de
      outros sócios. Sem edição pelo cliente no MVP.

## Comunicação e integrações

- [x] Uso real de WhatsApp — RESOLVIDO: fora do escopo do MVP (ver
      `01-documentacao/requisitos/backlog.md`)
- [x] Integração com Google Calendar — fora do escopo do MVP
- [x] Integração com Apple Calendar — fora do escopo do MVP
- [x] **Integração via API** — desenhada, implementada e **validada
      de ponta a ponta em staging** em 2026-08-19: autenticação por
      chave de API/empresa, só leitura, `/api/v1/eventos` e
      `/api/v1/tarefas`. Sem chave → 401; com chave válida → 200,
      dados corretamente escopados pela empresa. Ver
      `04-analises/integracao-api.md`. **Ainda não aplicada em
      produção** — precisa da migration `0009_api_keys.sql` e dos
      GRANTs estreitos de `service_role` (só `SELECT` em 3 tabelas),
      que exigem autorização separada antes de tocar produção. Rate
      limiting e tela de gestão de chaves ainda não existem. Não
      prometer no material de demonstração ao cliente enquanto não
      estiver em produção.

## Financeiro

- [ ] Regras de cobrança e taxas
- [ ] Regras financeiras (além da proposta societária em discussão)

## Dados e conformidade

- [ ] Política de anexos
- [ ] Retenção de conversas e provas
- [ ] Requisitos da LGPD aplicáveis
- [ ] Aprovação jurídica das mensagens e fluxos

## Arquitetura e infraestrutura

- [x] Necessidade de multiempresa ou multitenancy — RESOLVIDO 2026-08-17:
      multiempresa desde o MVP, Betel é o primeiro tenant. Ver
      `04-analises/arquitetura-multitenant.md`
- [x] Tecnologia final do frontend — APROVADO 2026-08-17: Next.js + Supabase
      (ver `00-gestao/decisoes-tecnicas.md`)
- [x] Hospedagem — APROVADO: Vercel + Supabase Cloud
- [ ] Domínio
- [x] Autenticação (mecanismo definitivo) — APROVADO: Supabase Auth,
      inclusive para o cliente (login próprio)

## [2026-08-19] — Resolvido: projeto de staging criado

Você autorizou explicitamente ("pode criar o projeto Supabase de
staging, autorizado") depois do classificador ter pedido confirmação.
Projeto `betel-company-staging` criado na mesma organização da
produção (`DevSoldier`, plano gratuito), schema completo aplicado
(schema, policies, grants, migrations 0002-0007 e 0009). Detalhes em
`04-analises/ambiente-staging.md`.

**Único passo restante — precisa ser feito por você (não por mim):**
copiar a `anon key` e a `service_role key` de
`Project Settings > API Keys` do projeto `betel-company-staging` (o
classificador de segurança bloqueou minha leitura automática dessa
página, pra evitar que os valores aparecessem no transcript da
conversa — proteção correta). Com essas duas chaves eu configuro o
ambiente de teste e valido a integração via API e os testes de
integração de ponta a ponta.

## [2026-08-19] — RESOLVIDO: incidente externo do Supabase

Normalizado: latência do endpoint de auth caiu de 100+s para 0,4-0,5s
consistente (3 medições seguidas), Supabase confirmou fix implantado
em `status.supabase.com`. Login e navegação testados de novo no
Codespace atual (`super-space-memory-...`) e funcionando normalmente.
Ver `docs/plano-b-demonstracao.md` para o registro completo das
tentativas de contingência.

## [2026-08-19] — Aberto: testes de UX que exigem login (não posso fazer sozinho)

Com o incidente resolvido, `not-found.tsx` foi confirmado com
evidência visual (screenshot). `error.tsx` já tem evidência real de
produção (apareceu durante o próprio incidente). Faltam dois testes
que só acontecem **depois do login** (dashboard, sidebar) — e eu nunca
digito senha, por política. Pendente: você logar uma vez no Codespace
atual (`https://super-space-memory-qvv747jqpx7p29x5q-3000.app.github.dev`)
e avisar, para eu confirmar o focus trap do drawer mobile e o
`loading.tsx` em navegação real.

## [2026-08-19] — Aberto: IDs dos dados fictícios (item 8)

`docs/dados-demo.md` já lista os registros por nome/e-mail. Os UUIDs
exatos exigiriam consulta SQL direta em produção (SQL Editor), que o
classificador de segurança bloqueou por falta de autorização explícita
para esta ação específica nesta tarefa. Se quiser os IDs agora, preciso
de autorização explícita para essa leitura pontual (só leitura, sem
alterar nada).

## [2026-08-19] — Aberto: identificar conta do admin (item 6)

Não consigo identificar com segurança qual conta é a do admin sem
acessar a tabela `usuario` (sem GRANT para `service_role`, por
desenho) ou sem você informar o e-mail. Ação mais segura: você mesmo
troca a senha pelo painel do Supabase (Authentication → Users → conta
admin → gerar nova senha ou enviar link de recuperação) — isso também
testa o fluxo de recuperação por e-mail.

## [2026-08-19] — Aberto: incidente externo do Supabase durante demo ao vivo

Durante demonstração ao vivo ao cliente, login/autenticação ficou
extremamente lento (100+s) por incidente ativo e público do Supabase
("401 errors due to JWT rejections", `status.supabase.com`, aberto
desde 14/08/2026). Causa 100% externa. Nenhuma solução rápida
encontrada (local, Codespace, Docker) — detalhes completos em
`00-gestao/memoria-execucao.md`, seção "Continuação (2026-08-19)".

**Ação combinada:** construir um ambiente Supabase local (via Docker,
`supabase start`) como plano B testado para próximas demonstrações,
sem pressa, fora de uma chamada ao vivo. Ainda não iniciado.

## Regra geral

Nenhuma decisão acima deve ser assumida como resposta padrão. Cada uma
precisa de confirmação explícita do cliente/usuário antes de virar
implementação.
