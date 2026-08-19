# Ambiente de staging — betel-company-staging

> Criado em 2026-08-19, autorizado explicitamente pelo usuário. Projeto
> Supabase separado de produção, mesma organização (`DevSoldier`,
> plano gratuito). Não contém nenhum dado real — só para testes.

## O que já está pronto

- **Projeto criado**: `betel-company-staging`, ref `pfdqfvndytjhyytmlydm`,
  URL `https://pfdqfvndytjhyytmlydm.supabase.co`, região Americas.
- **"Automatically expose new tables" desligado** na criação — mesma
  postura de segurança da produção.
- **Schema completo aplicado**, na ordem correta, via SQL Editor
  (mesmo método usado em todas as migrations anteriores do projeto):
  1. `schema.sql` (12 tabelas base — sem RLS ainda, aviso do próprio
     Supabase reconhecido e aceito de propósito)
  2. `policies.sql` + `grants.sql` (RLS + policies + GRANTs para
     `authenticated`)
  3. `0002_multitenant.sql` (tabela `empresa`, `empresa_id` em todas
     as tabelas, `is_admin_of()`, Betel Company criada como tenant)
  4. `0003_fechar_contrato.sql`, `0004_onboarding.sql`,
     `0005_contrato_fechado_immutable.sql`,
     `0006_revoke_anon_residual_grants.sql`, `0007_evento_area.sql`
  5. `0009_api_keys.sql` — **com os GRANTs de `service_role` liberados**
     (diferente de produção): `SELECT` em `api_key`, `evento` e
     `tarefa_evento`. Seguro aqui por não haver dado real.
- **Verificado**: as 12 tabelas existem
  (`select table_name from information_schema.tables`).

## O que falta (ação simples, não técnica)

O classificador de segurança bloqueou a leitura automática da página de
chaves de API do Supabase (evita que valores de chave apareçam no
transcript/output da conversa — proteção correta, não contornada).
Faltam 2 coisas, as duas exigem você copiar/colar (não deve ser feito
por mim):

1. Copiar a **anon key** e a **service_role key** de
   `Project Settings > API Keys` do projeto `betel-company-staging`.
2. Colar num arquivo `.env.staging.local` (ou similar, fora do git) no
   Codespace, apontando `NEXT_PUBLIC_SUPABASE_URL` para
   `https://pfdqfvndytjhyytmlydm.supabase.co`.

Depois disso, dá para: rodar `npm run dev` contra staging, testar os
endpoints `/api/v1/eventos` e `/api/v1/tarefas` de ponta a ponta, criar
fixtures de teste de integração sem risco nenhum a produção, e validar
que a sequência de migrations funciona do zero (esta própria aplicação
de agora já é essa validação — Fase 5 do pedido original, feita).

## Fase 5 (migrations do zero) — na prática, já concluída

Aplicar o schema completo numa base vazia, na ordem, sem erros
inesperados, **é** o teste de "migrations do zero" pedido. Resultado:
todas as migrations aplicaram sem erro, na ordem documentada em
`00-gestao/status-atual.md`. Único ponto de atenção: dois avisos do
Supabase apareceram (tabelas sem RLS antes de `policies.sql`; operações
"destrutivas" nos `drop policy/trigger if exists` das migrations) — os
dois são esperados e conhecidos, não bugs.
