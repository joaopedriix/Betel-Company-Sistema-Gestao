-- =====================================================================
-- PROPOSTA — NAO EXECUTAR SEM APROVACAO EXPLICITA
-- Betel Company — Sistema de Gestão
-- Migration: multitenant (empresa/tenant)
-- =====================================================================
--
-- Este arquivo fica em database/proposals/, FORA do fluxo de deploy.
-- database/schema.sql + policies.sql + grants.sql continuam sendo a
-- unica fonte aplicada no banco real ate esta proposta ser aprovada e
-- promovida (ex.: renomeada para database/0002_multitenant.sql e
-- documentada como aplicada no changelog).
--
-- Estrategia completa e justificativa: 04-analises/plano-migration-tenant.md
-- Modelo e policies detalhados: 04-analises/arquitetura-multitenant.md
--
-- Ordem de execucao (dentro de uma unica transacao):
--   1. Criar tabela empresa
--   2. Inserir a Betel, capturar o id
--   3. Adicionar empresa_id (nullable) nas 10 tabelas
--   4. Backfill: empresa_id = Betel em todas as linhas existentes
--   5. Validar: nenhuma linha com empresa_id null
--   6. Tornar empresa_id not null + FK + indice nas 10 tabelas
--   7. Atualizar funcoes de autorizacao (current_empresa_id, is_admin)
--   8. Recriar as 23 policies com filtro de tenant
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Tabela empresa
-- ---------------------------------------------------------------------
create table public.empresa (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  ativo      boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_empresa_updated
  before update on public.empresa
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 2. Inserir a Betel (primeiro tenant)
-- ---------------------------------------------------------------------
do $$
declare
  v_betel_id uuid;
begin
  insert into public.empresa (nome) values ('Betel Company')
  returning id into v_betel_id;

  -- ---------------------------------------------------------------------
  -- 3. Adicionar empresa_id (nullable) nas 10 tabelas
  -- ---------------------------------------------------------------------
  alter table public.usuario           add column empresa_id uuid;
  alter table public.cliente           add column empresa_id uuid;
  alter table public.servico           add column empresa_id uuid;
  alter table public.checklist_modelo  add column empresa_id uuid;
  alter table public.tarefa_padrao     add column empresa_id uuid;
  alter table public.evento            add column empresa_id uuid;
  alter table public.contrato          add column empresa_id uuid;
  alter table public.contrato_servico  add column empresa_id uuid;
  alter table public.tarefa_evento     add column empresa_id uuid;
  alter table public.historico_tarefa  add column empresa_id uuid;

  -- ---------------------------------------------------------------------
  -- 4. Backfill: todas as linhas existentes pertencem a Betel
  -- (hoje so ha 1 linha real, em usuario; as demais tabelas estao
  -- vazias — ver 04-analises/auditoria-mvp.md)
  -- ---------------------------------------------------------------------
  update public.usuario           set empresa_id = v_betel_id where empresa_id is null;
  update public.cliente           set empresa_id = v_betel_id where empresa_id is null;
  update public.servico           set empresa_id = v_betel_id where empresa_id is null;
  update public.checklist_modelo  set empresa_id = v_betel_id where empresa_id is null;
  update public.tarefa_padrao     set empresa_id = v_betel_id where empresa_id is null;
  update public.evento            set empresa_id = v_betel_id where empresa_id is null;
  update public.contrato          set empresa_id = v_betel_id where empresa_id is null;
  update public.contrato_servico  set empresa_id = v_betel_id where empresa_id is null;
  update public.tarefa_evento     set empresa_id = v_betel_id where empresa_id is null;
  update public.historico_tarefa  set empresa_id = v_betel_id where empresa_id is null;
end $$;

-- ---------------------------------------------------------------------
-- 5. Validacao — deve retornar 0 linhas em todas. Se alguma falhar,
-- PARAR aqui e investigar antes de prosseguir (nao rodar o passo 6).
-- ---------------------------------------------------------------------
-- select 'usuario', count(*) from public.usuario where empresa_id is null
-- union all select 'cliente', count(*) from public.cliente where empresa_id is null
-- union all select 'servico', count(*) from public.servico where empresa_id is null
-- union all select 'checklist_modelo', count(*) from public.checklist_modelo where empresa_id is null
-- union all select 'tarefa_padrao', count(*) from public.tarefa_padrao where empresa_id is null
-- union all select 'evento', count(*) from public.evento where empresa_id is null
-- union all select 'contrato', count(*) from public.contrato where empresa_id is null
-- union all select 'contrato_servico', count(*) from public.contrato_servico where empresa_id is null
-- union all select 'tarefa_evento', count(*) from public.tarefa_evento where empresa_id is null
-- union all select 'historico_tarefa', count(*) from public.historico_tarefa where empresa_id is null;

-- ---------------------------------------------------------------------
-- 6. NOT NULL + FK + indice nas 10 tabelas
-- ---------------------------------------------------------------------
alter table public.usuario           alter column empresa_id set not null,
                                      add constraint usuario_empresa_fkey references public.empresa(id) on delete restrict;
alter table public.cliente           alter column empresa_id set not null,
                                      add constraint cliente_empresa_fkey references public.empresa(id) on delete restrict;
alter table public.servico           alter column empresa_id set not null,
                                      add constraint servico_empresa_fkey references public.empresa(id) on delete restrict;
alter table public.checklist_modelo  alter column empresa_id set not null,
                                      add constraint checklist_modelo_empresa_fkey references public.empresa(id) on delete restrict;
alter table public.tarefa_padrao     alter column empresa_id set not null,
                                      add constraint tarefa_padrao_empresa_fkey references public.empresa(id) on delete restrict;
alter table public.evento            alter column empresa_id set not null,
                                      add constraint evento_empresa_fkey references public.empresa(id) on delete restrict;
alter table public.contrato          alter column empresa_id set not null,
                                      add constraint contrato_empresa_fkey references public.empresa(id) on delete restrict;
alter table public.contrato_servico  alter column empresa_id set not null,
                                      add constraint contrato_servico_empresa_fkey references public.empresa(id) on delete restrict;
alter table public.tarefa_evento     alter column empresa_id set not null,
                                      add constraint tarefa_evento_empresa_fkey references public.empresa(id) on delete restrict;
alter table public.historico_tarefa  alter column empresa_id set not null,
                                      add constraint historico_tarefa_empresa_fkey references public.empresa(id) on delete restrict;

create index idx_usuario_empresa          on public.usuario (empresa_id);
create index idx_cliente_empresa          on public.cliente (empresa_id);
create index idx_servico_empresa          on public.servico (empresa_id);
create index idx_checklist_modelo_empresa on public.checklist_modelo (empresa_id);
create index idx_tarefa_padrao_empresa    on public.tarefa_padrao (empresa_id);
create index idx_evento_empresa           on public.evento (empresa_id);
create index idx_contrato_empresa         on public.contrato (empresa_id);
create index idx_contrato_servico_empresa on public.contrato_servico (empresa_id);
create index idx_tarefa_evento_empresa    on public.tarefa_evento (empresa_id);
create index idx_historico_tarefa_empresa on public.historico_tarefa (empresa_id);

-- ---------------------------------------------------------------------
-- 7. Funcoes de autorizacao
-- ---------------------------------------------------------------------
create or replace function public.current_empresa_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select empresa_id from public.usuario where id = auth.uid() and ativo;
$$;

-- is_admin(): agora so importa se o admin esta autenticado e ativo;
-- o filtro de empresa fica nas policies (empresa_id = current_empresa_id()),
-- nao aqui, para manter is_admin() reutilizavel sem acoplar a uma tabela
-- especifica.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.usuario
    where id = auth.uid() and perfil = 'admin' and ativo
  );
$$;

-- ---------------------------------------------------------------------
-- 8. Policies — recriar as 23 com filtro de tenant.
-- Ver 04-analises/arquitetura-multitenant.md (Parte 5) para a tabela
-- completa de quem consulta/insere/atualiza/exclui por tabela.
-- Cada "_admin_all" abaixo ganha "and empresa_id = current_empresa_id()"
-- nos dois lados (using/with check) — sem isso, um admin de outra
-- empresa veria tudo (ponto critico identificado na analise).
-- ---------------------------------------------------------------------

-- usuario
drop policy if exists usuario_admin_all on public.usuario;
create policy usuario_admin_all on public.usuario
  for all
  using (public.is_admin() and empresa_id = public.current_empresa_id())
  with check (public.is_admin() and empresa_id = public.current_empresa_id());
-- usuario_self_select: sem mudanca (ja e por auth.uid(), 1 usuario so ve a si mesmo,
-- tenant e implicito por ser a propria linha).

-- cliente
drop policy if exists cliente_admin_all on public.cliente;
create policy cliente_admin_all on public.cliente
  for all
  using (public.is_admin() and empresa_id = public.current_empresa_id())
  with check (public.is_admin() and empresa_id = public.current_empresa_id());

drop policy if exists cliente_socio_select on public.cliente;
create policy cliente_socio_select on public.cliente
  for select using (
    empresa_id = public.current_empresa_id()
    and public.current_perfil() = 'socio'
    and exists (
      select 1 from public.evento e
      join public.tarefa_evento te on te.evento_id = e.id
      where e.cliente_id = cliente.id
        and te.responsavel_id = auth.uid()
    )
  );
-- cliente_self_select: sem mudanca necessaria (current_cliente_id() ja
-- resolve para o cliente do proprio usuario, que so pode ser da mesma
-- empresa por construcao — mas considerar adicionar o filtro por defesa
-- em profundidade, ver plano-migration-tenant.md).

-- servico
drop policy if exists servico_admin_all on public.servico;
create policy servico_admin_all on public.servico
  for all
  using (public.is_admin() and empresa_id = public.current_empresa_id())
  with check (public.is_admin() and empresa_id = public.current_empresa_id());

drop policy if exists servico_auth_select on public.servico;
create policy servico_auth_select on public.servico
  for select using (auth.uid() is not null and empresa_id = public.current_empresa_id());

-- checklist_modelo
drop policy if exists checklist_modelo_admin_all on public.checklist_modelo;
create policy checklist_modelo_admin_all on public.checklist_modelo
  for all
  using (public.is_admin() and empresa_id = public.current_empresa_id())
  with check (public.is_admin() and empresa_id = public.current_empresa_id());

-- tarefa_padrao
drop policy if exists tarefa_padrao_admin_all on public.tarefa_padrao;
create policy tarefa_padrao_admin_all on public.tarefa_padrao
  for all
  using (public.is_admin() and empresa_id = public.current_empresa_id())
  with check (public.is_admin() and empresa_id = public.current_empresa_id());

-- evento
drop policy if exists evento_admin_all on public.evento;
create policy evento_admin_all on public.evento
  for all
  using (public.is_admin() and empresa_id = public.current_empresa_id())
  with check (public.is_admin() and empresa_id = public.current_empresa_id());

drop policy if exists evento_cliente_select on public.evento;
create policy evento_cliente_select on public.evento
  for select using (empresa_id = public.current_empresa_id() and cliente_id = public.current_cliente_id());

drop policy if exists evento_socio_select on public.evento;
create policy evento_socio_select on public.evento
  for select using (
    empresa_id = public.current_empresa_id()
    and public.current_perfil() = 'socio'
    and exists (
      select 1 from public.tarefa_evento te
      where te.evento_id = evento.id and te.responsavel_id = auth.uid()
    )
  );

-- contrato
drop policy if exists contrato_admin_all on public.contrato;
create policy contrato_admin_all on public.contrato
  for all
  using (public.is_admin() and empresa_id = public.current_empresa_id())
  with check (public.is_admin() and empresa_id = public.current_empresa_id());

drop policy if exists contrato_cliente_select on public.contrato;
create policy contrato_cliente_select on public.contrato
  for select using (empresa_id = public.current_empresa_id() and cliente_id = public.current_cliente_id());

drop policy if exists contrato_socio_select on public.contrato;
create policy contrato_socio_select on public.contrato
  for select using (
    empresa_id = public.current_empresa_id()
    and public.current_perfil() = 'socio'
    and exists (
      select 1 from public.tarefa_evento te
      where te.evento_id = contrato.evento_id and te.responsavel_id = auth.uid()
    )
  );

-- contrato_servico
drop policy if exists contrato_servico_admin_all on public.contrato_servico;
create policy contrato_servico_admin_all on public.contrato_servico
  for all
  using (public.is_admin() and empresa_id = public.current_empresa_id())
  with check (public.is_admin() and empresa_id = public.current_empresa_id());

drop policy if exists contrato_servico_cliente_select on public.contrato_servico;
create policy contrato_servico_cliente_select on public.contrato_servico
  for select using (
    empresa_id = public.current_empresa_id()
    and exists (
      select 1 from public.contrato c
      where c.id = contrato_servico.contrato_id and c.cliente_id = public.current_cliente_id()
    )
  );

-- tarefa_evento
drop policy if exists tarefa_evento_admin_all on public.tarefa_evento;
create policy tarefa_evento_admin_all on public.tarefa_evento
  for all
  using (public.is_admin() and empresa_id = public.current_empresa_id())
  with check (public.is_admin() and empresa_id = public.current_empresa_id());

drop policy if exists tarefa_evento_socio_select on public.tarefa_evento;
create policy tarefa_evento_socio_select on public.tarefa_evento
  for select using (
    empresa_id = public.current_empresa_id()
    and public.current_perfil() = 'socio'
    and responsavel_id = auth.uid()
  );

drop policy if exists tarefa_evento_socio_update on public.tarefa_evento;
create policy tarefa_evento_socio_update on public.tarefa_evento
  for update
  using (
    empresa_id = public.current_empresa_id()
    and public.current_perfil() = 'socio'
    and responsavel_id = auth.uid()
  )
  with check (
    empresa_id = public.current_empresa_id()
    and public.current_perfil() = 'socio'
    and responsavel_id = auth.uid()
  );

drop policy if exists tarefa_evento_cliente_select on public.tarefa_evento;
create policy tarefa_evento_cliente_select on public.tarefa_evento
  for select using (
    empresa_id = public.current_empresa_id()
    and visivel_ao_cliente = true
    and exists (
      select 1 from public.evento e
      where e.id = tarefa_evento.evento_id and e.cliente_id = public.current_cliente_id()
    )
  );

-- historico_tarefa (sem policy de escrita para authenticated, igual hoje)
drop policy if exists historico_admin_select on public.historico_tarefa;
create policy historico_admin_select on public.historico_tarefa
  for select using (public.is_admin() and empresa_id = public.current_empresa_id());

drop policy if exists historico_socio_select on public.historico_tarefa;
create policy historico_socio_select on public.historico_tarefa
  for select using (
    empresa_id = public.current_empresa_id()
    and public.current_perfil() = 'socio'
    and exists (
      select 1 from public.tarefa_evento te
      where te.id = historico_tarefa.tarefa_evento_id and te.responsavel_id = auth.uid()
    )
  );

commit;

-- =====================================================================
-- Apos aplicar (quando aprovado):
-- 1. Validar com o plano de testes em 04-analises/testes-isolamento-tenant.md
-- 2. Promover este arquivo para database/0002_multitenant.sql
-- 3. Registrar em 00-gestao/changelog.md
-- =====================================================================
