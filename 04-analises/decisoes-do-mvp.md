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

## Provisórias — propostas técnicas aguardando aprovação de implementação

Decisões de **produto** já confirmadas acima (não mude de novo); o que
falta aprovar é a **forma técnica** de implementar, detalhada em
`04-analises/arquitetura-multitenant.md`, `plano-migration-tenant.md` e
`testes-isolamento-tenant.md` — nenhuma dessas foi executada ainda
(schema/policies atuais continuam single-tenant até aprovação explícita).

1. **Nome oficial do produto e identidade visual:** ainda pendentes,
   sem impacto técnico até agora.

## Não decidido / não aplicável ainda

- Domínio de produção.
- Regras de cobrança/financeiro (fora do MVP, ver
  `01-documentacao/requisitos/backlog.md`).
- LGPD/retenção de dados (fora do escopo desta fase).

## Regra geral

Nenhuma decisão provisória deve ser tratada como definitiva ao
implementar a próxima funcionalidade sem confirmação do usuário —
mesma regra já estabelecida em `00-gestao/pendencias.md`.
