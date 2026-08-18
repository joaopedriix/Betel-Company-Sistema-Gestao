-- =====================================================================
-- Betel Company — Sistema de Gestão
-- Migration: revoga grants residuais de `anon` (corrige risco R7)
-- =====================================================================
--
-- Contexto (00-gestao/riscos.md, risco R7): o role `anon` (requisições
-- não autenticadas via PostgREST) tem GRANT de TRUNCATE/TRIGGER/
-- REFERENCES em todas as 11 tabelas de negócio — confirmado em
-- 2026-08-18 consultando information_schema.role_table_grants
-- diretamente. Nunca teve SELECT/INSERT/UPDATE/DELETE (nenhuma policy
-- libera `anon`), e o PostgREST não expõe TRUNCATE via REST, então o
-- risco prático hoje é baixo — mas é um resquício de GRANT amplo demais
-- (provável `GRANT ALL ... TO anon` seguido de revogação parcial) que
-- viola least-privilege.
--
-- Esta migration revoga os três privilégios residuais de `anon` em
-- todas as tabelas do schema public. Não afeta `authenticated` (que
-- continua com todos os privilégios necessários, controlados por RLS).
--
-- Puramente reversível: um GRANT equivalente desfaz, se algum dia for
-- necessário liberar algo específico para `anon` (ex.: quando o portal
-- do cliente público for reavaliado).
--
-- Rollback:
--   grant truncate, trigger, references on all tables in schema public to anon;
-- =====================================================================

begin;

revoke truncate, trigger, references on all tables in schema public from anon;

commit;
