-- =====================================================================
-- Betel Company — Sistema de Gestão
-- Schema definitivo — PostgreSQL / Supabase
-- =====================================================================
--
-- SUPOSIÇÕES DE MODELAGEM (pendências ainda abertas em 00-gestao/pendencias.md,
-- decisões tomadas aqui pelo caminho mais flexível/seguro; revisar com o usuário):
--
--   1. cliente -> evento é 1:N (um cliente pode ter vários eventos). É a opção
--      mais flexível; se o negócio confirmar 1:1, basta adicionar UNIQUE em
--      evento.cliente_id. (Pendência: "Se haverá clientes com mais de um evento".)
--   2. Sistema SINGLE-TENANT (uma empresa/Betel só). Não há coluna de tenant
--      porque a pendência "Necessidade de multiempresa/multitenancy" ainda não
--      foi resolvida. Se virar multi-tenant, adicionar empresa_id + RLS por tenant.
--   3. usuario.id = auth.users.id (mesmo UUID). Padrão Supabase: a linha em
--      public.usuario é o "perfil" da conta de auth. Cliente, sócio e admin
--      todos têm conta em auth.users (login próprio — confirmado 2026-08-17).
--   4. servico 1:1 checklist_modelo (o modelo referencia o serviço, UNIQUE).
--   5. tarefa_padrao.prazo_offset_dias = prazo relativo em dias em relação à
--      data do evento (ex.: "D-30" => -30). tarefa_evento.prazo = data absoluta
--      calculada no fechamento do contrato.
--
-- Autorização real fica em policies.sql (RLS). Este arquivo cria apenas
-- estrutura, tipos, índices, constraints e triggers de integridade/histórico.
-- As mutações do fluxo (fechamento de contrato, log de histórico) rodam no
-- servidor com a service role, que ignora RLS.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tipos enumerados
-- ---------------------------------------------------------------------
create type perfil_usuario as enum ('admin', 'socio', 'cliente');
create type status_contrato as enum ('rascunho', 'fechado');
create type status_tarefa   as enum ('pendente', 'em_andamento', 'concluida', 'bloqueada');
create type prioridade      as enum ('baixa', 'media', 'alta');
create type tipo_evento_historico as enum (
  'criacao',
  'alteracao_status',
  'conclusao',
  'reabertura',
  'troca_responsavel',
  'troca_prazo'
);

-- ---------------------------------------------------------------------
-- Função utilitária: manter updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =====================================================================
-- TABELAS
-- =====================================================================

-- usuario: perfil da conta de auth.users
create table public.usuario (
  id         uuid primary key references auth.users (id) on delete cascade,
  nome       text not null,
  email      text not null unique,
  perfil     perfil_usuario not null,
  ativo      boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_usuario_perfil on public.usuario (perfil) where ativo;

create trigger trg_usuario_updated
  before update on public.usuario
  for each row execute function public.set_updated_at();

-- cliente
create table public.cliente (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  email      text,
  telefone   text,
  -- Vínculo opcional com a conta de login do cliente (portal do cliente).
  usuario_id uuid unique references public.usuario (id) on delete set null,
  ativo      boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_cliente_usuario_id on public.cliente (usuario_id);

create trigger trg_cliente_updated
  before update on public.cliente
  for each row execute function public.set_updated_at();

-- servico
create table public.servico (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  descricao  text,
  ativo      boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_servico_updated
  before update on public.servico
  for each row execute function public.set_updated_at();

-- checklist_modelo (1:1 com servico)
create table public.checklist_modelo (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  servico_id uuid not null unique references public.servico (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_checklist_modelo_servico on public.checklist_modelo (servico_id);

create trigger trg_checklist_modelo_updated
  before update on public.checklist_modelo
  for each row execute function public.set_updated_at();

-- tarefa_padrao: MODELO. Nunca alterado pela execução de um evento.
create table public.tarefa_padrao (
  id                  uuid primary key default gen_random_uuid(),
  checklist_modelo_id uuid not null references public.checklist_modelo (id) on delete cascade,
  nome                text not null,
  descricao           text,
  -- Sócio responsável padrão (aplicado a cada tarefa_evento gerada).
  responsavel_padrao_id uuid references public.usuario (id) on delete set null,
  -- Prazo relativo à data do evento, em dias. Ex.: "D-30" => -30.
  prazo_offset_dias   integer not null default 0,
  prioridade          prioridade not null default 'media',
  ordem               integer not null default 0,
  ativo               boolean not null default true,
  visivel_ao_cliente  boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index idx_tarefa_padrao_checklist on public.tarefa_padrao (checklist_modelo_id, ordem);

create trigger trg_tarefa_padrao_updated
  before update on public.tarefa_padrao
  for each row execute function public.set_updated_at();

-- evento
create table public.evento (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references public.cliente (id) on delete cascade,
  nome        text not null,
  data_evento date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_evento_cliente on public.evento (cliente_id);

create trigger trg_evento_updated
  before update on public.evento
  for each row execute function public.set_updated_at();

-- contrato
create table public.contrato (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid not null references public.cliente (id) on delete cascade,
  evento_id       uuid not null references public.evento (id) on delete cascade,
  status          status_contrato not null default 'rascunho',
  data_criacao    timestamptz not null default now(),
  data_fechamento timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_contrato_cliente on public.contrato (cliente_id);
create index idx_contrato_evento  on public.contrato (evento_id);
create index idx_contrato_status  on public.contrato (status);

create trigger trg_contrato_updated
  before update on public.contrato
  for each row execute function public.set_updated_at();

-- contrato_servico: N:N contrato <-> servico (serviços contratados)
create table public.contrato_servico (
  contrato_id uuid not null references public.contrato (id) on delete cascade,
  servico_id  uuid not null references public.servico (id) on delete restrict,
  primary key (contrato_id, servico_id)
);
create index idx_contrato_servico_servico on public.contrato_servico (servico_id);

-- tarefa_evento: CÓPIA gerada no fechamento do contrato.
create table public.tarefa_evento (
  id                 uuid primary key default gen_random_uuid(),
  evento_id          uuid not null references public.evento (id) on delete cascade,
  -- Origem (modelo). SET NULL para não travar exclusão de modelo antigo;
  -- a tarefa do evento é independente do modelo após gerada.
  tarefa_padrao_id   uuid references public.tarefa_padrao (id) on delete set null,
  nome               text not null,
  descricao          text,
  responsavel_id     uuid references public.usuario (id) on delete set null,
  prazo              date,
  prioridade         prioridade not null default 'media',
  ordem              integer not null default 0,
  status             status_tarefa not null default 'pendente',
  visivel_ao_cliente boolean not null default false,
  concluida_por      uuid references public.usuario (id) on delete set null,
  concluida_em       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index idx_tarefa_evento_evento      on public.tarefa_evento (evento_id, ordem);
create index idx_tarefa_evento_responsavel on public.tarefa_evento (responsavel_id);
create index idx_tarefa_evento_status      on public.tarefa_evento (status);

create trigger trg_tarefa_evento_updated
  before update on public.tarefa_evento
  for each row execute function public.set_updated_at();

-- historico_tarefa: append-only (escrito apenas via trigger/servidor)
-- ON DELETE RESTRICT (não CASCADE): reforça no banco a regra de negócio
-- "nunca excluir" — qualquer tentativa de apagar uma tarefa_evento (ou,
-- em cascata, o evento/contrato pai) que já tenha histórico falha em vez
-- de apagar o audit trail silenciosamente (risco R8 do parecer de
-- segurança em 00-gestao/riscos.md).
create table public.historico_tarefa (
  id               uuid primary key default gen_random_uuid(),
  tarefa_evento_id uuid not null references public.tarefa_evento (id) on delete restrict,
  tipo_evento      tipo_evento_historico not null,
  usuario_id       uuid references public.usuario (id) on delete set null,
  detalhe          jsonb,
  created_at       timestamptz not null default now()
);
create index idx_historico_tarefa_tarefa on public.historico_tarefa (tarefa_evento_id, created_at);

-- =====================================================================
-- TRIGGERS DE REGRA DE NEGÓCIO / HISTÓRICO
-- =====================================================================
-- SECURITY DEFINER: os triggers precisam inserir em historico_tarefa
-- (append-only para usuários comuns) ignorando o RLS.

-- Guarda de mutação: automatiza concluida_por/concluida_em e barra
-- reabertura por não-admin diretamente no banco (defesa contra bypass de UI).
create or replace function public.fn_tarefa_evento_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_perfil perfil_usuario;
begin
  -- Perfil do usuário atual (null quando executado pela service role/servidor).
  select perfil into v_perfil from public.usuario where id = auth.uid();

  -- Reabertura (concluida -> outro status): somente admin.
  if old.status = 'concluida' and new.status <> 'concluida' then
    if v_perfil is not null and v_perfil <> 'admin' then
      raise exception 'Apenas administrador/gestor pode reabrir uma tarefa concluída';
    end if;
    new.concluida_por := null;
    new.concluida_em  := null;
  end if;

  -- Conclusão: registra quem concluiu e quando.
  if new.status = 'concluida' and old.status <> 'concluida' then
    new.concluida_por := coalesce(new.concluida_por, auth.uid());
    new.concluida_em  := coalesce(new.concluida_em, now());
  end if;

  -- Sócio não pode reatribuir responsável nem mudar visibilidade ao cliente.
  if v_perfil = 'socio' then
    if new.responsavel_id is distinct from old.responsavel_id then
      raise exception 'Sócio não pode alterar o responsável da tarefa';
    end if;
    if new.visivel_ao_cliente is distinct from old.visivel_ao_cliente then
      raise exception 'Sócio não pode alterar a visibilidade ao cliente';
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_tarefa_evento_guard
  before update on public.tarefa_evento
  for each row execute function public.fn_tarefa_evento_guard();

-- Log de histórico das mudanças relevantes em tarefa_evento.
create or replace function public.fn_log_tarefa_evento()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if tg_op = 'INSERT' then
    insert into public.historico_tarefa (tarefa_evento_id, tipo_evento, usuario_id, detalhe)
    values (new.id, 'criacao', v_uid,
            jsonb_build_object('nome', new.nome, 'status', new.status));
    return new;
  end if;

  -- UPDATE: um registro por tipo de mudança relevante.
  if new.status <> old.status then
    if new.status = 'concluida' then
      insert into public.historico_tarefa (tarefa_evento_id, tipo_evento, usuario_id, detalhe)
      values (new.id, 'conclusao', v_uid, jsonb_build_object('de', old.status, 'para', new.status));
    elsif old.status = 'concluida' then
      insert into public.historico_tarefa (tarefa_evento_id, tipo_evento, usuario_id, detalhe)
      values (new.id, 'reabertura', v_uid, jsonb_build_object('de', old.status, 'para', new.status));
    else
      insert into public.historico_tarefa (tarefa_evento_id, tipo_evento, usuario_id, detalhe)
      values (new.id, 'alteracao_status', v_uid, jsonb_build_object('de', old.status, 'para', new.status));
    end if;
  end if;

  if new.responsavel_id is distinct from old.responsavel_id then
    insert into public.historico_tarefa (tarefa_evento_id, tipo_evento, usuario_id, detalhe)
    values (new.id, 'troca_responsavel', v_uid,
            jsonb_build_object('de', old.responsavel_id, 'para', new.responsavel_id));
  end if;

  if new.prazo is distinct from old.prazo then
    insert into public.historico_tarefa (tarefa_evento_id, tipo_evento, usuario_id, detalhe)
    values (new.id, 'troca_prazo', v_uid,
            jsonb_build_object('de', old.prazo, 'para', new.prazo));
  end if;

  return new;
end;
$$;

create trigger trg_log_tarefa_evento_ins
  after insert on public.tarefa_evento
  for each row execute function public.fn_log_tarefa_evento();

create trigger trg_log_tarefa_evento_upd
  after update on public.tarefa_evento
  for each row execute function public.fn_log_tarefa_evento();
