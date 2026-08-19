# Decisões pendentes (perguntas bloqueadoras)

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
- [x] **Integração via API** — desenhada e implementada (v1) em
      2026-08-19: autenticação por chave de API/empresa, só leitura,
      `/api/v1/eventos` e `/api/v1/tarefas`. Ver
      `04-analises/integracao-api.md`. Migration `0009_api_keys.sql`
      **já aplicada em staging** (`betel-company-staging`), com os
      GRANTs de `service_role` liberados lá (seguro, sem dado real).
      Falta só copiar as chaves de API do staging pra um `.env` e
      testar os endpoints de ponta a ponta (ver
      `04-analises/ambiente-staging.md`). Produção continua exigindo
      autorização separada pros GRANTs, mesmo sendo um escopo bem menor
      que a proposta ampla já rejeitada. Rate limiting e tela de gestão
      de chaves ainda não existem. Não prometer no material de
      demonstração ao cliente enquanto não estiver validado.

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

## Regra geral

Nenhuma decisão acima deve ser assumida como resposta padrão. Cada uma
precisa de confirmação explícita do cliente/usuário antes de virar
implementação.
