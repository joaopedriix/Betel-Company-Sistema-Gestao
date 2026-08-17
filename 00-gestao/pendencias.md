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

## Financeiro

- [ ] Regras de cobrança e taxas
- [ ] Regras financeiras (além da proposta societária em discussão)

## Dados e conformidade

- [ ] Política de anexos
- [ ] Retenção de conversas e provas
- [ ] Requisitos da LGPD aplicáveis
- [ ] Aprovação jurídica das mensagens e fluxos

## Arquitetura e infraestrutura

- [ ] Necessidade de multiempresa ou multitenancy
- [x] Tecnologia final do frontend — APROVADO 2026-08-17: Next.js + Supabase
      (ver `00-gestao/decisoes-tecnicas.md`)
- [x] Hospedagem — APROVADO: Vercel + Supabase Cloud
- [ ] Domínio
- [x] Autenticação (mecanismo definitivo) — APROVADO: Supabase Auth,
      inclusive para o cliente (login próprio)

## Regra geral

Nenhuma decisão acima deve ser assumida como resposta padrão. Cada uma
precisa de confirmação explícita do cliente/usuário antes de virar
implementação.
