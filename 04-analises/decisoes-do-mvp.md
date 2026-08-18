# Decisões do MVP — confirmadas vs. provisórias

> Consolidação pedida na auditoria de 2026-08-17. Não duplica
> `00-gestao/decisoes-tecnicas.md` (arquitetura completa) nem
> `00-gestao/pendencias.md` (lista de perguntas em aberto) — só resume o
> que é firme e o que ainda pode mudar.

## Confirmadas pelo usuário

| Decisão | Data | Onde |
|---|---|---|
| Stack: Next.js (App Router) + Supabase (Postgres + Auth + RLS) | 2026-08-17 | `00-gestao/decisoes-tecnicas.md` |
| Cliente tem login próprio (não é visualização pública) | 2026-08-17 | idem |
| Hospedagem: Vercel + Supabase Cloud | 2026-08-17 | idem |
| Escopo do MVP (17 critérios de aceite) | 2026-08-17 | `01-documentacao/requisitos/mvp.md` |
| **Multiempresa/multitenancy DESDE o MVP** — Betel é o primeiro tenant, isolamento por RLS, sem billing/planos/assinatura por enquanto | 2026-08-17 | `04-analises/arquitetura-multitenant.md` (proposta técnica ainda não implementada) |
| **Cliente pode ter vários eventos** | 2026-08-17 | idem — resolve a pendência antiga |
| **Cliente pode ter vários contratos** | 2026-08-17 | novo |
| **Cada contrato pertence a 1 cliente + 1 evento**; no MVP cada evento tem um contrato "principal" | 2026-08-17 | ver `04-analises/arquitetura-multitenant.md` para a nuance entre isso e a constraint atual (sem `UNIQUE`) |
| Tarefa padrão continua separada da tarefa gerada para o evento | 2026-08-17 | já era assim no schema atual — confirmação, não mudança |

## Multitenant — de proposta a implementado (2026-08-17)

A forma técnica (detalhada em `04-analises/arquitetura-multitenant.md`,
`plano-migration-tenant.md`) foi revisada, corrigida (3 problemas
achados na revisão final) e **aplicada** contra o Supabase real da
Betel — schema/policies **não são mais single-tenant**. Ver
`00-gestao/changelog.md` para o resultado da execução e validações.
Pendente: testes de isolamento com um 2º tenant (`04-analises/testes-isolamento-tenant.md`)
ainda não criado — aguardando decisão do usuário para criar dados
fictícios de teste.

1. **Nome oficial do produto e identidade visual:** ainda pendentes,
   sem impacto técnico até agora.

## Cadastros base implementados e validados (2026-08-18)

Clientes, Sócios/Usuários e Serviços — os três primeiros CRUDs reais do
MVP, construídos sobre o schema multitenant já existente. Nenhuma
migration foi necessária: `cliente` e `servico` já tinham os campos
suficientes (nome/email/telefone/ativo e nome/descrição/ativo); `usuario`
idem. Ver `00-gestao/relatorio-sessao-2026-08-17-18.md` para o relato
completo da fase e `06-testes-evidencias/testes-manuais-cadastros.md`
para o roteiro de testes executado.

- **Só perfil `admin` cria/edita/inativa** nos três cadastros (rotas
  `/clientes`, `/usuarios`, `/servicos` estão em `ADMIN_ROUTES`,
  bloqueadas por middleware para outros perfis). `empresa_id` é sempre
  resolvido no servidor via `getUsuarioAtual()`, nunca aceito do
  formulário — reforçado pelo trigger de imutabilidade já existente.
- **Decisão confirmada:** cadastro de usuários cria só perfis
  `admin`/`socio`. Login do perfil `cliente` fica para quando o portal
  do cliente for implementado (fora do escopo desta fase).
- **`service_role` usado em um único ponto** (`criarUsuario`, só para
  `auth.admin.createUser` via Admin API) — nunca para ler/gravar linhas
  de negócio; confirmado também empiricamente: a chave `service_role`
  nem tem GRANT na tabela `usuario` via API REST, só o role
  `authenticated` tem.
- **Limitação conhecida, não corrigida nesta fase:** a senha temporária
  do usuário recém-criado é passada via query string
  (`/usuarios/[id]?senha=...`) e exibida uma única vez na tela — mas
  fica potencialmente no histórico do navegador caso alguém salve esse
  link específico. Risco baixo (só quem já tem acesso admin vê a tela),
  mas vale registrar para uma iteração futura (ex.: mostrar via estado
  de página em vez de query string).
- **Gap de infraestrutura encontrado durante o teste, corrigido:** não
  havia nenhum botão de logout montado em nenhuma tela (o componente
  `LogoutButton` existia mas órfão). Adicionado minimamente em
  `/dashboard` e `/minhas-tarefas` — sem isso não era possível trocar de
  sessão para testar bloqueio de rota por perfil.
- **Bug real de infraestrutura encontrado e corrigido:** ao testar via
  navegador pelo túnel do Codespace, o proxy de port-forwarding reescreve
  o header `Origin` para `localhost:3000` ao repassar a requisição
  internamente (preservando `x-forwarded-host` com o domínio real do
  túnel) — a proteção CSRF de Server Actions do Next.js rejeitava por
  isso. Corrigido adicionando `"localhost:3000"` a
  `experimental.serverActions.allowedOrigins` em `next.config.ts`,
  restrito a `NODE_ENV !== "production"`.

## Contratos, Eventos, Checklist automático, Tarefas e Dashboard (2026-08-18)

MVP funcional completo — fluxo principal ponta a ponta implementado e
validado com dados reais (não simulados). Nenhuma migration de RLS/policy
foi necessária: schema e as 23 policies multitenant já cobriam `evento`,
`contrato`, `contrato_servico`, `tarefa_evento`, `checklist_modelo` e
`tarefa_padrao` desde a migration da Fase 6. Única migration nova: a
função `public.fechar_contrato(uuid)`
(`03-projeto-betel/database/proposals/0003_fechar_contrato.sql`),
puramente aditiva, `SECURITY INVOKER` (roda com a identidade de quem
chama — RLS decide, nenhum privilégio novo concedido).

- **Geração automática de tarefas:** ao fechar um contrato, para cada
  serviço contratado, cada `tarefa_padrao` ativa do checklist daquele
  serviço vira uma `tarefa_evento`, com `prazo = data_evento +
  prazo_offset_dias`. **Idempotente por design:** `SELECT ... FOR UPDATE`
  trava a linha do contrato durante a transação — uma segunda chamada
  (duplo clique, requisição repetida) espera a primeira, vê
  `status = 'fechado'` e não faz nada. Testado com chamada RPC repetida
  diretamente: confirmado que não duplica.
- **Contrato fechado é imutável na aplicação:** `/contratos/[id]/editar`
  redireciona de volta ao detalhe se `status = 'fechado'` (checagem na
  Server Action e na própria página). **Limitação registrada:** essa
  imutabilidade não tem um trigger de banco reforçando (diferente de
  `empresa_id`, que tem `fn_empresa_id_immutable`) — hoje só a camada de
  aplicação impede a edição. Risco baixo (só admin chega lá de qualquer
  forma), mas é uma melhoria futura recomendada se o modelo de permissões
  mudar.
- **Cálculo de progresso:** `tarefas concluídas / tarefas totais` do
  evento. Casos extremos documentados: zero tarefas (contrato sem
  checklist configurado nos serviços, ou ainda em rascunho) mostra
  mensagem em vez de dividir por zero; não existe status "cancelada" no
  enum `status_tarefa` (só pendente/em_andamento/concluida/bloqueada),
  então não há caso de tarefa cancelada a excluir do cálculo; tarefas
  reabertas voltam a contar como não concluídas (comportamento
  intencional).
- **Dashboard:** indicadores 100% reais via `count` do Postgres,
  filtrados implicitamente por tenant via RLS — nenhuma consulta global.
- **Atribuição de responsável:** adicionada na própria tela de detalhe do
  evento (fora do escopo original do prompt de fechamento, mas necessária
  — sem isso, a tarefa gerada não tem `responsavel_id` e o sócio nunca a
  vê em "Minhas tarefas", a menos que `tarefa_padrao.responsavel_padrao_id`
  já esteja configurado).
- **Gap de infraestrutura, não corrigido nesta fase:** ainda não existe
  layout/navegação compartilhado entre as telas — cada página precisa
  incluir `<LogoutButton />` manualmente. Ver `00-gestao/pendencias.md`.

## Não decidido / não aplicável ainda

- Domínio de produção.
- Regras de cobrança/financeiro (fora do MVP, ver
  `01-documentacao/requisitos/backlog.md`).
- LGPD/retenção de dados (fora do escopo desta fase).

## Regra geral

Nenhuma decisão provisória deve ser tratada como definitiva ao
implementar a próxima funcionalidade sem confirmação do usuário —
mesma regra já estabelecida em `00-gestao/pendencias.md`.
