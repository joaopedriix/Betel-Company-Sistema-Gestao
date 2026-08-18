-- =====================================================================
-- Betel Company — Sistema de Gestão
-- Migration: imutabilidade de contrato fechado (corrige risco R10)
-- =====================================================================
--
-- DEPENDÊNCIA: requer 0002_multitenant.sql e 0003_fechar_contrato.sql já
-- aplicadas.
--
-- Contexto (00-gestao/riscos.md, risco R10): a imutabilidade de um
-- contrato fechado hoje só é garantida pela aplicação (Server Action),
-- não pelo banco. Confirmado experimentalmente no gate final do MVP:
-- DELETE direto em contrato_servico (204) e UPDATE de status
-- fechado -> rascunho (200) funcionam via API mesmo com o contrato já
-- fechado, contornando a UI e as Server Actions.
--
-- Esta migration adiciona dois triggers de guarda, mesmo padrão de
-- fn_tarefa_evento_guard e fn_usuario_self_update_guard:
--
--   1. fn_contrato_fechado_immutable — bloqueia UPDATE/DELETE em
--      `contrato` quando a linha ANTES da operação (OLD.status) já é
--      'fechado'. Não afeta a transição rascunho -> fechado feita por
--      fechar_contrato(): nesse caso OLD.status ainda é 'rascunho' no
--      momento do UPDATE, então o trigger deixa passar. Confirmado lendo
--      0003_fechar_contrato.sql: o UPDATE de status é a última operação
--      da função, e ela nunca escreve em contrato_servico (só lê).
--   2. fn_contrato_servico_fechado_immutable — bloqueia INSERT/UPDATE/
--      DELETE em `contrato_servico` quando o contrato pai (via
--      contrato_id) já está fechado.
--
-- Puramente aditiva: não altera dado existente, só adiciona triggers.
-- Contratos em rascunho continuam totalmente editáveis.
--
-- Rollback:
--   drop trigger if exists trg_contrato_servico_fechado_immutable on public.contrato_servico;
--   drop function if exists public.fn_contrato_servico_fechado_immutable();
--   drop trigger if exists trg_contrato_fechado_immutable on public.contrato;
--   drop function if exists public.fn_contrato_fechado_immutable();
-- =====================================================================

begin;

create or replace function public.fn_contrato_fechado_immutable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'DELETE' then
    if OLD.status = 'fechado' then
      raise exception 'Contrato fechado não pode ser excluído';
    end if;
    return OLD;
  end if;

  if OLD.status = 'fechado' then
    raise exception 'Contrato fechado é imutável';
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_contrato_fechado_immutable on public.contrato;
create trigger trg_contrato_fechado_immutable
  before update or delete on public.contrato
  for each row execute function public.fn_contrato_fechado_immutable();

create or replace function public.fn_contrato_servico_fechado_immutable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status status_contrato;
begin
  select status into v_status
  from public.contrato
  where id = coalesce(OLD.contrato_id, NEW.contrato_id);

  if v_status = 'fechado' then
    raise exception 'Não é possível alterar os serviços de um contrato fechado';
  end if;

  if TG_OP = 'DELETE' then
    return OLD;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_contrato_servico_fechado_immutable on public.contrato_servico;
create trigger trg_contrato_servico_fechado_immutable
  before insert or update or delete on public.contrato_servico
  for each row execute function public.fn_contrato_servico_fechado_immutable();

commit;
