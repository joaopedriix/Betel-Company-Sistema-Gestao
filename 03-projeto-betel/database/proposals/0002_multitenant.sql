-- =====================================================================
-- PROPOSTA — revisao 3 (correcoes aplicadas em 2026-08-17)
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
-- CORRECOES NESTA REVISAO (achadas na revisao final antes da execucao):
--   1. Tabela empresa agora tem RLS habilitado+forcado, 1 policy de
--      SELECT (cada usuario ve so a propria empresa) e GRANT SELECT
--      para authenticated. Faltava isso na v1 — mesmo bug de GRANT
--      ausente ja corrigido antes nas outras 10 tabelas.
--   2. Insercao da Betel agora e idempotente (select antes de insert) —
--      rodar o script 2x nao cria empresa duplicada.
--   3. Trocado o padrao "is_admin() and empresa_id = current_empresa_id()"
--      (repetido em cada policy, risco de esquecer o 2o termo numa
--      policy futura) por uma unica funcao is_admin_of(empresa_id) que
--      faz as duas checagens juntas. Adicionado tambem um trigger de
--      imutabilidade: empresa_id nunca pode ser alterado apos a criacao
--      da linha, nem por admin, em nenhuma das 10 tabelas.
--   4. (revisao 3) Corrigida a ORDEM: a policy de "empresa" so pode ser
--      criada DEPOIS de current_empresa_id() existir — na v2 a policy
--      vinha antes da funcao, o que causaria erro "function does not
--      exist". Movida para depois da secao de funcoes.
--
-- Ordem de execucao (dentro de uma unica transacao):
--   1. Criar tabela empresa (sem RLS ainda)
--   2. Inserir a Betel de forma idempotente, capturar o id
--   3. Adicionar empresa_id (nullable) nas 10 tabelas
--   4. Backfill: empresa_id = Betel em todas as linhas existentes
--   5. Validar explicitamente (RAISE EXCEPTION se sobrar NULL)
--   6. Tornar empresa_id not null + FK + indice nas 10 tabelas
--   7. Criar/atualizar funcoes de autorizacao
--   8. Habilitar RLS + policy + grant em empresa (agora que as funcoes existem)
--   9. Criar trigger de imutabilidade de empresa_id nas 10 tabelas
--  10. Recriar as 23 policies com is_admin_of(empresa_id)
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Tabela empresa (RLS vem depois, passo 8 — precisa das funcoes)
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
-- 2-5. Inserir a Betel (idempotente), adicionar colunas, backfill,
-- validar — tudo dentro de um unico bloco para usar a variavel v_betel_id.
-- ---------------------------------------------------------------------
do $$
declare
  v_betel_id uuid;
  v_null_count bigint;
begin
  -- 2. Betel idempotente
  select id into v_betel_id from public.empresa where nome = 'Betel Company';
  if v_betel_id is null then
    insert into public.empresa (nome) values ('Betel Company')
    returning id into v_betel_id;
  end if;

  -- 3. Colunas nullable
  alter table public.usuario           add column if not exists empresa_id uuid;
  alter table public.cliente           add column if not exists empresa_id uuid;
  alter table public.servico           add column if not exists empresa_id uuid;
  alter table public.checklist_modelo  add column if not exists empresa_id uuid;
  alter table public.tarefa_padrao     add column if not exists empresa_id uuid;
  alter table public.evento            add column if not exists empresa_id uuid;
  alter table public.contrato          add column if not exists empresa_id uuid;
  alter table public.contrato_servico  add column if not exists empresa_id uuid;
  alter table public.tarefa_evento     add column if not exists empresa_id uuid;
  alter table public.historico_tarefa  add column if not exists empresa_id uuid;

  -- 4. Backfill (hoje so ha 1 linha real, em usuario; as demais tabelas
  -- estao vazias — ver 04-analises/auditoria-mvp.md)
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

  -- 5. Validacao explicita — aborta a transacao inteira com mensagem
  -- clara se sobrar qualquer linha sem empresa_id, em vez de deixar a
  -- constraint NOT NULL do passo 6 falhar com erro generico.
  select
    (select count(*) from public.usuario           where empresa_id is null) +
    (select count(*) from public.cliente           where empresa_id is null) +
    (select count(*) from public.servico           where empresa_id is null) +
    (select count(*) from public.checklist_modelo  where empresa_id is null) +
    (select count(*) from public.tarefa_padrao     where empresa_id is null) +
    (select count(*) from public.evento            where empresa_id is null) +
    (select count(*) from public.contrato          where empresa_id is null) +
    (select count(*) from public.contrato_servico  where empresa_id is null) +
    (select count(*) from public.tarefa_evento     where empresa_id is null) +
    (select count(*) from public.historico_tarefa  where empresa_id is null)
  into v_null_count;

  if v_null_count > 0 then
    raise exception 'Migration abortada: % linha(s) sem empresa_id apos o backfill', v_null_count;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 6. NOT NULL + FK + indice nas 10 tabelas
-- ---------------------------------------------------------------------
alter table public.usuario           alter column empresa_id set not null,
                                      add constraint usuario_empresa_fkey foreign key (empresa_id) references public.empresa(id) on delete restrict;
alter table public.cliente           alter column empresa_id set not null,
                                      add constraint cliente_empresa_fkey foreign key (empresa_id) references public.empresa(id) on delete restrict;
alter table public.servico           alter column empresa_id set not null,
                                      add constraint servico_empresa_fkey foreign key (empresa_id) references public.empresa(id) on delete restrict;
alter table public.checklist_modelo  alter column empresa_id set not null,
                                      add constraint checklist_modelo_empresa_fkey foreign key (empresa_id) references public.empresa(id) on delete restrict;
alter table public.tarefa_padrao     alter column empresa_id set not null,
                                      add constraint tarefa_padrao_empresa_fkey foreign key (empresa_id) references public.empresa(id) on delete restrict;
alter table public.evento            alter column empresa_id set not null,
                                      add constraint evento_empresa_fkey foreign key (empresa_id) references public.empresa(id) on delete restrict;
alter table public.contrato          alter column empresa_id set not null,
                                      add constraint contrato_empresa_fkey foreign key (empresa_id) references public.empresa(id) on delete restrict;
alter table public.contrato_servico  alter column empresa_id set not null,
                                      add constraint contrato_servico_empresa_fkey foreign key (empresa_id) references public.empresa(id) on delete restrict;
alter table public.tarefa_evento     alter column empresa_id set not null,
                                      add constraint tarefa_evento_empresa_fkey foreign key (empresa_id) references public.empresa(id) on delete restrict;
alter table public.historico_tarefa  alter column empresa_id set not null,
                                      add constraint historico_tarefa_empresa_fkey foreign key (empresa_id) references public.empresa(id) on delete restrict;

create index if not exists idx_usuario_empresa          on public.usuario (empresa_id);
create index if not exists idx_cliente_empresa          on public.cliente (empresa_id);
create index if not exists idx_servico_empresa          on public.servico (empresa_id);
create index if not exists idx_checklist_modelo_empresa on public.checklist_modelo (empresa_id);
create index if not exists idx_tarefa_padrao_empresa    on public.tarefa_padrao (empresa_id);
create index if not exists idx_evento_empresa           on public.evento (empresa_id);
create index if not exists idx_contrato_empresa         on public.contrato (empresa_id);
create index if not exists idx_contrato_servico_empresa on public.contrato_servico (empresa_id);
create index if not exists idx_tarefa_evento_empresa    on public.tarefa_evento (empresa_id);
create index if not exists idx_historico_tarefa_empresa on public.historico_tarefa (empresa_id);

-- ---------------------------------------------------------------------
-- 7. Funcoes de autorizacao
-- ---------------------------------------------------------------------

-- Tenant do usuario logado. NULL se o usuario nao existir/nao estiver
-- ativo/nao tiver empresa — nesse caso toda policy "empresa_id =
-- current_empresa_id()" avalia para NULL (nao TRUE), e RLS trata isso
-- como negado (fail-safe: nunca libera acesso por acidente).
create or replace function public.current_empresa_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select empresa_id from public.usuario where id = auth.uid() and ativo;
$$;

-- is_admin(): mantida sem escopo de tenant, para uso generico futuro
-- (ex.: uma tela de superadmin). NAO deve ser usada sozinha em nenhuma
-- policy de tabela de negocio — usar is_admin_of() abaixo, que exige o
-- tenant como parte da propria chamada.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.usuario
    where id = auth.uid() and perfil = 'admin' and ativo
  );
$$;

-- Admin E do tenant informado, nas duas checagens juntas — usada em
-- toda policy "_admin_all" das tabelas de negocio. Reduz o risco de uma
-- policy futura esquecer o filtro de empresa (bug critico encontrado na
-- revisao desta migration).
create or replace function public.is_admin_of(p_empresa_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.usuario
    where id = auth.uid() and perfil = 'admin' and ativo and empresa_id = p_empresa_id
  );
$$;

-- ---------------------------------------------------------------------
-- 8. RLS em empresa (so agora, com current_empresa_id() ja existindo)
-- ---------------------------------------------------------------------
alter table public.empresa enable row level security;
alter table public.empresa force row level security;

-- Cada usuario le apenas a propria empresa (nao a lista de todas). Sem
-- policy de INSERT/UPDATE/DELETE para authenticated: criar/editar
-- empresa e operacao de sistema, fora do escopo do MVP.
create policy empresa_self_select on public.empresa
  for select using (id = public.current_empresa_id());

grant select on public.empresa to authenticated;

-- ---------------------------------------------------------------------
-- 9. Trigger de imutabilidade: empresa_id nunca muda apos criado, nem
-- por admin. Defesa em profundidade — nao depende so da logica (correta
-- mas sutil) do WITH CHECK das policies de UPDATE.
-- ---------------------------------------------------------------------
create or replace function public.fn_empresa_id_immutable()
returns trigger
language plpgsql
as $$
begin
  if new.empresa_id is distinct from old.empresa_id then
    raise exception 'empresa_id nao pode ser alterado apos a criacao do registro (tabela %)', tg_table_name;
  end if;
  return new;
end;
$$;

create trigger trg_usuario_empresa_immutable          before update on public.usuario          for each row execute function public.fn_empresa_id_immutable();
create trigger trg_cliente_empresa_immutable          before update on public.cliente          for each row execute function public.fn_empresa_id_immutable();
create trigger trg_servico_empresa_immutable          before update on public.servico          for each row execute function public.fn_empresa_id_immutable();
create trigger trg_checklist_modelo_empresa_immutable before update on public.checklist_modelo for each row execute function public.fn_empresa_id_immutable();
create trigger trg_tarefa_padrao_empresa_immutable    before update on public.tarefa_padrao    for each row execute function public.fn_empresa_id_immutable();
create trigger trg_evento_empresa_immutable           before update on public.evento           for each row execute function public.fn_empresa_id_immutable();
create trigger trg_contrato_empresa_immutable         before update on public.contrato         for each row execute function public.fn_empresa_id_immutable();
create trigger trg_contrato_servico_empresa_immutable before update on public.contrato_servico for each row execute function public.fn_empresa_id_immutable();
create trigger trg_tarefa_evento_empresa_immutable    before update on public.tarefa_evento    for each row execute function public.fn_empresa_id_immutable();
create trigger trg_historico_tarefa_empresa_immutable before update on public.historico_tarefa for each row execute function public.fn_empresa_id_immutable();

-- ---------------------------------------------------------------------
-- 10. Policies — recriar as 23 usando is_admin_of(empresa_id).
-- Ver 04-analises/arquitetura-multitenant.md (Parte 5) para a tabela
-- completa de quem consulta/insere/atualiza/exclui por tabela.
-- ---------------------------------------------------------------------

-- usuario
drop policy if exists usuario_admin_all on public.usuario;
create policy usuario_admin_all on public.usuario
  for all
  using (public.is_admin_of(empresa_id))
  with check (public.is_admin_of(empresa_id));
-- usuario_self_select: sem mudanca (ja e por auth.uid()).

-- cliente
drop policy if exists cliente_admin_all on public.cliente;
create policy cliente_admin_all on public.cliente
  for all
  using (public.is_admin_of(empresa_id))
  with check (public.is_admin_of(empresa_id));

drop policy if exists cliente_socio_select on public.cliente;
create policy cliente_socio_select on public.cliente
  for select using (
    empresa_id = public.current_empresa_id()
    and public.current_perfil() = 'socio'
    and exists (
      select 1
      from public.evento e
      join public.tarefa_evento te on te.evento_id = e.id
      where e.cliente_id = cliente.id
        and te.responsavel_id = auth.uid()
    )
  );
-- cliente_self_select: sem mudanca.

-- servico
drop policy if exists servico_admin_all on public.servico;
create policy servico_admin_all on public.servico
  for all
  using (public.is_admin_of(empresa_id))
  with check (public.is_admin_of(empresa_id));

drop policy if exists servico_auth_select on public.servico;
create policy servico_auth_select on public.servico
  for select using (auth.uid() is not null and empresa_id = public.current_empresa_id());

-- checklist_modelo
drop policy if exists checklist_modelo_admin_all on public.checklist_modelo;
create policy checklist_modelo_admin_all on public.checklist_modelo
  for all
  using (public.is_admin_of(empresa_id))
  with check (public.is_admin_of(empresa_id));

-- tarefa_padrao
drop policy if exists tarefa_padrao_admin_all on public.tarefa_padrao;
create policy tarefa_padrao_admin_all on public.tarefa_padrao
  for all
  using (public.is_admin_of(empresa_id))
  with check (public.is_admin_of(empresa_id));

-- evento
drop policy if exists evento_admin_all on public.evento;
create policy evento_admin_all on public.evento
  for all
  using (public.is_admin_of(empresa_id))
  with check (public.is_admin_of(empresa_id));

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
  using (public.is_admin_of(empresa_id))
  with check (public.is_admin_of(empresa_id));

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
  using (public.is_admin_of(empresa_id))
  with check (public.is_admin_of(empresa_id));

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
  using (public.is_admin_of(empresa_id))
  with check (public.is_admin_of(empresa_id));

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
  for select using (public.is_admin_of(empresa_id));

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
