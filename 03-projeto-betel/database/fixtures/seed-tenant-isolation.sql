-- =====================================================================
-- FIXTURE DE TESTE — isolamento multitenant
-- =====================================================================
-- EXCLUSIVO PARA AMBIENTE DE TESTE. NÃO EXECUTAR EM PRODUÇÃO SEM
-- REVISAR. NÃO EXECUTA AUTOMATICAMENTE EM NENHUM PIPELINE.
--
-- Não contém credenciais reais, tokens, nem e-mails reais — todos os
-- e-mails usam o domínio reservado para documentação/teste
-- (example.com, RFC 2606) e nomes claramente marcados "Teste".
--
-- PRÉ-REQUISITO: os usuários de Auth abaixo (`p_ids`) precisam já
-- existir em `auth.users` — este script NÃO cria contas de login (SQL
-- puro não tem acesso ao Supabase Auth). Crie-os primeiro via Admin API
-- (`POST /auth/v1/admin/users`, com `service_role`, nunca exposta em
-- código versionado) e cole os UUIDs retornados nas variáveis abaixo.
-- Ver `database/fixtures/tenant-isolation-test.md` para o passo a passo
-- completo (criação dos usuários, execução deste script, e limpeza).
--
-- O que este script cria (idempotente — pode rodar mais de uma vez):
--   - Tenant "Empresa B — Teste" (segundo tenant, para testar isolamento
--     contra a Betel)
--   - 3 usuários (perfil) vinculados a esse tenant: admin, sócio, cliente
--   - 1 registro mínimo de negócio por tenant (servico, checklist_modelo,
--     tarefa_padrao, cliente, evento, contrato, contrato_servico,
--     tarefa_evento) — tanto para "Empresa B — Teste" quanto,
--     opcionalmente, dentro do tenant já existente informado em
--     `p_tenant_principal_nome` (útil para comparar sócio×sócio e
--     cliente×cliente dentro do MESMO tenant real, não só entre tenants)
-- =====================================================================

begin;

do $$
declare
  -- >>> PREENCHER antes de rodar: UUIDs retornados pela criação dos
  -- usuários via Admin API (ver tenant-isolation-test.md) <<<
  p_socio_tenant_principal_id   uuid := '00000000-0000-0000-0000-000000000000'; -- sócio fictício no tenant principal
  p_cliente_tenant_principal_id uuid := '00000000-0000-0000-0000-000000000000'; -- cliente-login fictício no tenant principal
  p_admin_empresa_b_id  uuid := '00000000-0000-0000-0000-000000000000';
  p_socio_empresa_b_id  uuid := '00000000-0000-0000-0000-000000000000';
  p_cliente_empresa_b_id uuid := '00000000-0000-0000-0000-000000000000';

  -- Nome do tenant real já existente (ex.: 'Betel Company') onde os
  -- usuários "tenant_principal" acima serão vinculados.
  p_tenant_principal_nome text := 'Betel Company';

  v_tenant_principal_id uuid;
  v_empresa_b_id uuid;
  v_servico uuid; v_checklist uuid; v_padrao uuid; v_cliente uuid; v_evento uuid; v_contrato uuid; v_tarefa uuid;
begin
  select id into v_tenant_principal_id from public.empresa where nome = p_tenant_principal_nome;
  if v_tenant_principal_id is null then
    raise exception 'Tenant principal "%" não encontrado.', p_tenant_principal_nome;
  end if;

  select id into v_empresa_b_id from public.empresa where nome = 'Empresa B — Teste';
  if v_empresa_b_id is null then
    insert into public.empresa (nome) values ('Empresa B — Teste') returning id into v_empresa_b_id;
  end if;

  insert into public.usuario (id, nome, email, perfil, empresa_id) values
    (p_socio_tenant_principal_id, 'Sócio Teste (fixture)', 'socio.teste.fixture@example.com', 'socio', v_tenant_principal_id),
    (p_cliente_tenant_principal_id, 'Cliente Teste (fixture)', 'cliente.teste.fixture@example.com', 'cliente', v_tenant_principal_id),
    (p_admin_empresa_b_id, 'Admin Teste Empresa B (fixture)', 'admin.teste.empresab.fixture@example.com', 'admin', v_empresa_b_id),
    (p_socio_empresa_b_id, 'Sócio Teste Empresa B (fixture)', 'socio.teste.empresab.fixture@example.com', 'socio', v_empresa_b_id),
    (p_cliente_empresa_b_id, 'Cliente Teste Empresa B (fixture)', 'cliente.teste.empresab.fixture@example.com', 'cliente', v_empresa_b_id)
  on conflict (id) do nothing;

  -- Dados mínimos de negócio — Empresa B
  insert into public.servico (nome, descricao, empresa_id)
    values ('Serviço Fixture — Empresa B', 'Fixture de teste', v_empresa_b_id) returning id into v_servico;
  insert into public.checklist_modelo (nome, servico_id, empresa_id)
    values ('Checklist Fixture — Empresa B', v_servico, v_empresa_b_id) returning id into v_checklist;
  insert into public.tarefa_padrao (checklist_modelo_id, nome, responsavel_padrao_id, empresa_id, visivel_ao_cliente)
    values (v_checklist, 'Tarefa Fixture', p_socio_empresa_b_id, v_empresa_b_id, true) returning id into v_padrao;
  insert into public.cliente (nome, email, usuario_id, empresa_id)
    values ('Cliente Fixture — Empresa B', 'cliente.teste.empresab.fixture@example.com', p_cliente_empresa_b_id, v_empresa_b_id)
    returning id into v_cliente;
  insert into public.evento (cliente_id, nome, data_evento, empresa_id)
    values (v_cliente, 'Evento Fixture — Empresa B', current_date + 30, v_empresa_b_id) returning id into v_evento;
  insert into public.contrato (cliente_id, evento_id, status, empresa_id)
    values (v_cliente, v_evento, 'fechado', v_empresa_b_id) returning id into v_contrato;
  insert into public.contrato_servico (contrato_id, servico_id, empresa_id)
    values (v_contrato, v_servico, v_empresa_b_id);
  insert into public.tarefa_evento (evento_id, tarefa_padrao_id, nome, responsavel_id, status, visivel_ao_cliente, empresa_id)
    values (v_evento, v_padrao, 'Tarefa Fixture — Evento Empresa B', p_socio_empresa_b_id, 'pendente', true, v_empresa_b_id)
    returning id into v_tarefa;

  raise notice 'Fixture criado. Empresa B id=%, tenant principal id=%', v_empresa_b_id, v_tenant_principal_id;
end $$;

commit;
