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
| Sistema single-tenant por enquanto | Implícito (pendência aberta) | ver seção abaixo |

## Provisórias — assumidas no schema, ainda não confirmadas pelo usuário

Estas decisões foram tomadas pelo caminho mais flexível/seguro para não
travar a modelagem, mas **precisam de confirmação explícita**:

1. **Cliente pode ter mais de um evento (relação 1:N).** Se o negócio
   confirmar que é sempre 1:1, é uma mudança pequena (`UNIQUE` em
   `evento.cliente_id`). Registrado em `00-gestao/pendencias.md`.
2. **Multiempresa/multitenancy: não implementado.** Nenhuma tabela tem
   `empresa_id`. Ver análise de impacto completa em
   `04-analises/auditoria-mvp.md`, seção 7.
3. **Nome oficial do produto e identidade visual:** ainda pendentes,
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
