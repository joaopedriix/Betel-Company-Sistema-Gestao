-- =====================================================================
-- Betel Company — Sistema de Gestão
-- Migration: onboarding guiado de primeiro acesso
-- =====================================================================
--
-- DEPENDÊNCIA: requer 0002_multitenant.sql já aplicada (usa
-- current_perfil(), já criada em policies.sql/0002).
--
-- Puramente aditiva: 3 colunas novas em usuario (com default, não quebra
-- linhas existentes) + 1 policy de UPDATE nova + 1 trigger de guarda.
-- Não altera empresa_id, não altera dado existente, não apaga nada.
--
-- Rollback:
--   drop trigger if exists trg_usuario_self_update_guard on public.usuario;
--   drop function if exists public.fn_usuario_self_update_guard();
--   drop policy if exists usuario_self_update_onboarding on public.usuario;
--   alter table public.usuario
--     drop column if exists onboarding_concluido,
--     drop column if exists onboarding_versao,
--     drop column if exists onboarding_concluido_em;
-- =====================================================================

begin;

alter table public.usuario
  add column if not exists onboarding_concluido boolean not null default false,
  add column if not exists onboarding_versao integer,
  add column if not exists onboarding_concluido_em timestamptz;

-- ---------------------------------------------------------------------
-- RLS: o próprio usuário pode atualizar a própria linha (hoje só existe
-- usuario_admin_all para UPDATE — precisamos que o usuário não-admin
-- também consiga, mas SOMENTE nos campos de onboarding).
-- ---------------------------------------------------------------------
drop policy if exists usuario_self_update_onboarding on public.usuario;
create policy usuario_self_update_onboarding on public.usuario
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- Trigger de guarda: RLS é row-level, não column-level — sem isto, a
-- policy acima abriria uma brecha para o próprio usuário alterar
-- nome/email/perfil/ativo/empresa_id via API REST direta (não só via
-- Server Action). Mesmo padrão já usado em fn_tarefa_evento_guard.
-- Admin continua podendo alterar qualquer campo normalmente.
-- ---------------------------------------------------------------------
create or replace function public.fn_usuario_self_update_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_perfil perfil_usuario;
begin
  select perfil into v_perfil from public.usuario where id = auth.uid();

  if v_perfil = 'admin' then
    return new;
  end if;

  if new.nome is distinct from old.nome
     or new.email is distinct from old.email
     or new.perfil is distinct from old.perfil
     or new.ativo is distinct from old.ativo
     or new.empresa_id is distinct from old.empresa_id then
    raise exception 'Você só pode atualizar o próprio progresso de onboarding';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_usuario_self_update_guard on public.usuario;
create trigger trg_usuario_self_update_guard
  before update on public.usuario
  for each row execute function public.fn_usuario_self_update_guard();

commit;
