-- =====================================================================
-- FIXTURE DE TESTE — limpeza do isolamento multitenant
-- =====================================================================
-- EXCLUSIVO PARA AMBIENTE DE TESTE. NÃO EXECUTA AUTOMATICAMENTE.
-- Remove SOMENTE o que `seed-tenant-isolation.sql` cria: o tenant
-- "Empresa B — Teste" inteiro (por empresa_id) + os registros
-- fictícios específicos dentro do tenant principal (por nome/email
-- exatos do fixture — nunca por empresa_id do tenant principal, que
-- apagaria dados reais também).
--
-- Depois de rodar este script, remova as 5 contas de teste do Supabase
-- Auth via Admin API (DELETE /auth/v1/admin/users/<id>) — SQL puro não
-- alcança auth.users diretamente com segurança.
-- =====================================================================

begin;

do $$
declare
  v_empresa_b_id uuid;
begin
  select id into v_empresa_b_id from public.empresa where nome = 'Empresa B — Teste';

  if v_empresa_b_id is not null then
    delete from public.historico_tarefa where empresa_id = v_empresa_b_id;
    delete from public.tarefa_evento     where empresa_id = v_empresa_b_id;
    delete from public.contrato_servico  where empresa_id = v_empresa_b_id;
    delete from public.contrato          where empresa_id = v_empresa_b_id;
    delete from public.evento            where empresa_id = v_empresa_b_id;
    delete from public.cliente           where empresa_id = v_empresa_b_id;
    delete from public.tarefa_padrao     where empresa_id = v_empresa_b_id;
    delete from public.checklist_modelo  where empresa_id = v_empresa_b_id;
    delete from public.servico           where empresa_id = v_empresa_b_id;
    delete from public.usuario           where empresa_id = v_empresa_b_id;
    delete from public.empresa           where id = v_empresa_b_id;
  end if;

  -- Usuários fictícios no tenant principal (o fixture só cria usuários
  -- lá, não dados de negócio — ver seed-tenant-isolation.sql)
  delete from public.usuario where email in (
    'socio.teste.fixture@example.com',
    'cliente.teste.fixture@example.com'
  );
end $$;

commit;
