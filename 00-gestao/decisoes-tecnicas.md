# Decisões técnicas

> Fase 3 — Planejamento técnico. Este documento é uma **proposta** para
> aprovação, ainda não é decisão definitiva nem foi implementada.
> Baseado no MVP descrito em `01-documentacao/requisitos/mvp.md`.

## Status

APROVADO em 2026-08-17. Cliente terá login próprio (Supabase Auth), assim
como sócio e admin — não é apenas visualização pública.

## Arquitetura proposta

Aplicação web única (sem apps separados por perfil), com controle de
acesso por perfil de usuário (Administrador/Gestor, Sócio, Cliente) e
autorização aplicada no backend/banco, não só na interface.

## Tecnologias propostas

- **Frontend/Backend:** Next.js (App Router) + TypeScript — server actions
  para mutações, evitando expor lógica sensível no cliente.
- **Banco de dados e autenticação:** Supabase (PostgreSQL + Supabase
  Auth), conforme referência já registrada em
  `01-documentacao/integracoes/06-referencia-arquitetura-supabase.md`.
- **Autorização:** Row Level Security (RLS) no Postgres, por perfil e por
  responsável da tarefa — garante que a restrição "sócio só vê suas
  tarefas" valha mesmo se alguém tentar acessar direto pela API/URL.
- **UI:** componentes acessíveis (ex.: shadcn/ui) + Tailwind CSS, com
  cores de status conforme `01-documentacao/requisitos/mvp.md`.
- **Hospedagem:** Vercel (frontend/Next.js) + Supabase Cloud (banco/auth).

Justificativa: reaproveita a referência de arquitetura já validada com o
cliente, é rápido de montar para um MVP, e o RLS resolve diretamente a
regra crítica de segurança do sistema (sócio não acessar tarefa de outro).

Alternativas não escolhidas: stack própria com backend separado
(Node/Express + banco à parte) — descartada por enquanto por adicionar
complexidade de infraestrutura sem necessidade clara no MVP.

## Entidades (modelo de dados proposto)

- **usuario** — id, nome, email, perfil (`admin` | `socio` | `cliente`),
  status ativo/inativo
- **cliente** — id, nome, dados de contato, usuario_id (se tiver login)
- **servico** — id, nome, descrição, status ativo/inativo,
  checklist_modelo_id
- **checklist_modelo** — id, nome, servico_id
- **tarefa_padrao** — id, checklist_modelo_id, nome, descrição,
  responsavel_padrao_id (usuario), prazo (regra relativa, ex. "D-30"),
  prioridade, ordem, status ativo/inativo, visivel_ao_cliente (bool)
- **contrato** — id, cliente_id, evento_id, status (`rascunho` |
  `fechado`), data de criação, data de fechamento
- **contrato_servico** — contrato_id, servico_id (serviços contratados)
- **evento** — id, cliente_id, nome, data do evento
- **tarefa_evento** — id, evento_id, tarefa_padrao_id (origem),
  responsavel_id (usuario), nome, descrição, prazo (data calculada),
  prioridade, ordem, status (`pendente` | `em_andamento` | `concluida` |
  `bloqueada`), visivel_ao_cliente, concluida_por, concluida_em
- **historico_tarefa** — id, tarefa_evento_id, tipo_evento (criação,
  status, conclusão, reabertura, troca de responsável, troca de prazo),
  usuario_id, data/hora, detalhe

Regra chave: `tarefa_padrao` é o modelo; `tarefa_evento` é a cópia gerada
no fechamento do contrato. Nunca editar `tarefa_padrao` a partir de uma
`tarefa_evento`.

## Rotas / telas propostas

- `/login`
- `/dashboard` (gestor)
- `/clientes`, `/clientes/[id]`, `/clientes/novo`
- `/usuarios` (sócios/usuários), `/usuarios/[id]`, `/usuarios/novo`
- `/servicos`, `/servicos/[id]`, `/servicos/novo`
- `/checklists` (modelos), `/checklists/[id]`
- `/contratos`, `/contratos/[id]`, `/contratos/novo`
- `/eventos`, `/eventos/[id]` (checklist, progresso, tarefas, histórico)
- `/minhas-tarefas` (sócio logado, com filtros)
- `/portal-cliente` (visão restrita do cliente, com login próprio via
  Supabase Auth — CONFIRMADO em 2026-08-17)

## Permissões (resumo)

Ver detalhamento em
`01-documentacao/perfis-de-usuario/perfis-iniciais.md` e
`01-documentacao/regras-de-negocio/regras-iniciais.md`. Implementação via
RLS: cada tabela sensível (`tarefa_evento`, `historico_tarefa`) filtra por
`auth.uid()` cruzado com perfil e responsável.

## Integrações

Nenhuma integração externa no MVP (WhatsApp, Google/Apple Calendar ficam
para o backlog).

## Estratégia de testes

- Testes manuais do fluxo principal registrados em
  `06-testes-evidencias/testes-manuais/`, no formato definido no prompt
  mestre (cenário, pré-condições, passos, resultado esperado/obtido,
  status).
- Testes automatizados básicos (ex.: Vitest para regras de negócio como
  cálculo de progresso e geração de tarefas; Playwright para o fluxo
  crítico fechamento de contrato → checklist → conclusão de tarefa) em
  `06-testes-evidencias/testes-automatizados/`.

## Estratégia de backup

- Backup do banco (Supabase) antes de qualquer migração estrutural,
  registrado em `07-backups/antes-das-alteracoes/`.
- Versões estáveis marcadas em `07-backups/versoes-estaveis/` antes de
  cada publicação.

## Forma de publicação

Deploy do frontend/backend (Next.js) na Vercel, banco/auth no Supabase
Cloud. Variáveis sensíveis fora do Git (`.env`, com `.env.example`
versionado). Publicação apenas mediante aprovação explícita (Fase 8 do
prompt mestre).

## Pendências que este plano ainda não resolve

- Domínio definitivo
- Se haverá clientes com mais de um evento (afeta o modelo `cliente` x
  `evento`)
- Necessidade de multiempresa/multitenancy
- Nome oficial do produto e identidade visual
