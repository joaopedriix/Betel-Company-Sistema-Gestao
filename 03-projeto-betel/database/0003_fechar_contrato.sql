-- =====================================================================
-- Betel Company — Sistema de Gestão
-- Migration: função fechar_contrato() — geração automática de tarefas
-- =====================================================================
--
-- DEPENDÊNCIA: requer 0002_multitenant.sql já aplicada (usa empresa_id
-- em contrato/evento/tarefa_evento/tarefa_padrao/checklist_modelo e as
-- policies is_admin_of() criadas naquela migration). Ordem de execução
-- em instalação nova: schema.sql, policies.sql, grants.sql,
-- 0002_multitenant.sql, 0003_fechar_contrato.sql (nesta ordem).
--
-- Puramente aditiva: cria só uma função nova (public.fechar_contrato).
-- Não altera nenhuma tabela, coluna, policy ou dado existente.
--
-- SECURITY INVOKER (padrão, não DEFINER): a função roda com a identidade
-- de quem a chama, então RLS se aplica normalmente. INSERT em
-- tarefa_evento e UPDATE em contrato só funcionam porque o caller passa
-- por tarefa_evento_admin_all/contrato_admin_all (is_admin_of), exatamente
-- como qualquer outra escrita administrativa no sistema — nenhum
-- privilégio novo é concedido.
--
-- Idempotência: SELECT ... FOR UPDATE trava a linha do contrato durante
-- a transação. Uma segunda chamada concorrente (ex.: duplo clique) espera
-- a primeira terminar, vê status = 'fechado' e não faz nada — nenhuma
-- tarefa é duplicada, mesmo sob concorrência real.
--
-- Rollback: drop function if exists public.fechar_contrato(uuid);
-- =====================================================================

create or replace function public.fechar_contrato(p_contrato_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_contrato   record;
  v_evento     record;
  v_servico_id uuid;
  v_tarefa     record;
  v_ordem      integer := 0;
begin
  select * into v_contrato from public.contrato where id = p_contrato_id for update;
  if not found then
    raise exception 'Contrato não encontrado';
  end if;

  -- Idempotente: contrato já fechado, não gera tarefas de novo.
  if v_contrato.status = 'fechado' then
    return;
  end if;

  select * into v_evento from public.evento where id = v_contrato.evento_id;
  if not found then
    raise exception 'Evento do contrato não encontrado';
  end if;

  for v_servico_id in
    select cs.servico_id from public.contrato_servico cs where cs.contrato_id = p_contrato_id
  loop
    for v_tarefa in
      select tp.*
      from public.tarefa_padrao tp
      join public.checklist_modelo cm on cm.id = tp.checklist_modelo_id
      where cm.servico_id = v_servico_id
        and tp.ativo
      order by tp.ordem
    loop
      v_ordem := v_ordem + 1;
      insert into public.tarefa_evento (
        evento_id, tarefa_padrao_id, nome, descricao, responsavel_id, prazo,
        prioridade, ordem, visivel_ao_cliente, empresa_id
      ) values (
        v_contrato.evento_id,
        v_tarefa.id,
        v_tarefa.nome,
        v_tarefa.descricao,
        v_tarefa.responsavel_padrao_id,
        case when v_evento.data_evento is not null
             then v_evento.data_evento + v_tarefa.prazo_offset_dias
             else null end,
        v_tarefa.prioridade,
        v_ordem,
        v_tarefa.visivel_ao_cliente,
        v_contrato.empresa_id
      );
    end loop;
  end loop;

  update public.contrato
     set status = 'fechado', data_fechamento = now()
   where id = p_contrato_id;
end;
$$;
