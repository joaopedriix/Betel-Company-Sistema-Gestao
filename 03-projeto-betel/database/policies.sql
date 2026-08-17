-- =====================================================================
-- Betel Company — Sistema de Gestão
-- Row Level Security (RLS) — PostgreSQL / Supabase
-- =====================================================================
--
-- Modelo de autorização imposto NO BANCO (não só na UI):
--   admin  -> acesso total a tudo.
--   socio  -> lê/atualiza apenas tarefa_evento onde responsavel_id = auth.uid();
--             lê (somente contexto) cliente/evento/contrato ligados às suas tarefas.
--   cliente-> lê apenas dados do próprio cliente_id (cliente/contrato/evento/
--             contrato_servico) e, em tarefa_evento, apenas linhas com
--             visivel_ao_cliente = true. Sem escrita. Não vê histórico.
--   historico_tarefa -> somente leitura para socio; escrita apenas via
--             trigger/servidor (service role). Cliente não acessa.
--
-- A service role do Supabase (usada nas server actions do Next.js: fechamento
-- de contrato, geração de tarefas, etc.) IGNORA RLS por padrão. Portanto o
-- fluxo de escrita administrativa acontece pelo servidor, não por estas policies.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Funções auxiliares (SECURITY DEFINER para evitar recursão de RLS ao
-- consultar a própria tabela usuario dentro das policies).
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.usuario
    where id = auth.uid() and perfil = 'admin' and ativo
  );
$$;

create or replace function public.current_perfil()
returns perfil_usuario
language sql
stable
security definer
set search_path = public
as $$
  select perfil from public.usuario where id = auth.uid() and ativo;
$$;

-- cliente_id vinculado à conta logada (para o perfil cliente).
create or replace function public.current_cliente_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.cliente where usuario_id = auth.uid();
$$;

-- =====================================================================
-- Habilitar RLS em todas as tabelas de negócio
-- =====================================================================
alter table public.usuario           enable row level security;
alter table public.cliente           enable row level security;
alter table public.servico           enable row level security;
alter table public.checklist_modelo  enable row level security;
alter table public.tarefa_padrao     enable row level security;
alter table public.evento            enable row level security;
alter table public.contrato          enable row level security;
alter table public.contrato_servico  enable row level security;
alter table public.tarefa_evento     enable row level security;
alter table public.historico_tarefa  enable row level security;

-- FORCE: aplica o RLS também para o dono da tabela (ex.: role usada por
-- ferramentas de migração/admin do Postgres), fechando o risco R4 do
-- parecer de segurança (00-gestao/riscos.md) de RLS "habilitado mas não
-- forçado". A service role do Supabase continua ignorando RLS por design
-- (usada só nas server actions administrativas — ver R2 em riscos.md).
alter table public.usuario           force row level security;
alter table public.cliente           force row level security;
alter table public.servico           force row level security;
alter table public.checklist_modelo  force row level security;
alter table public.tarefa_padrao     force row level security;
alter table public.evento            force row level security;
alter table public.contrato          force row level security;
alter table public.contrato_servico  force row level security;
alter table public.tarefa_evento     force row level security;
alter table public.historico_tarefa  force row level security;

-- =====================================================================
-- usuario
-- =====================================================================
-- Admin: total.
create policy usuario_admin_all on public.usuario
  for all using (public.is_admin()) with check (public.is_admin());

-- Qualquer conta autenticada lê o próprio perfil.
create policy usuario_self_select on public.usuario
  for select using (id = auth.uid());

-- =====================================================================
-- cliente
-- =====================================================================
create policy cliente_admin_all on public.cliente
  for all using (public.is_admin()) with check (public.is_admin());

-- Cliente lê o próprio registro.
create policy cliente_self_select on public.cliente
  for select using (id = public.current_cliente_id());

-- Sócio lê (contexto) clientes que têm alguma tarefa atribuída a ele.
create policy cliente_socio_select on public.cliente
  for select using (
    public.current_perfil() = 'socio'
    and exists (
      select 1
      from public.evento e
      join public.tarefa_evento te on te.evento_id = e.id
      where e.cliente_id = cliente.id
        and te.responsavel_id = auth.uid()
    )
  );

-- =====================================================================
-- servico  (catálogo; nome não é sensível)
-- =====================================================================
create policy servico_admin_all on public.servico
  for all using (public.is_admin()) with check (public.is_admin());

-- Leitura para qualquer autenticado (exibir nomes de serviço no portal/UI).
create policy servico_auth_select on public.servico
  for select using (auth.uid() is not null);

-- =====================================================================
-- checklist_modelo  (configuração interna — admin apenas)
-- =====================================================================
create policy checklist_modelo_admin_all on public.checklist_modelo
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- tarefa_padrao  (modelo interno — admin apenas)
-- =====================================================================
create policy tarefa_padrao_admin_all on public.tarefa_padrao
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- evento
-- =====================================================================
create policy evento_admin_all on public.evento
  for all using (public.is_admin()) with check (public.is_admin());

-- Cliente lê os próprios eventos.
create policy evento_cliente_select on public.evento
  for select using (cliente_id = public.current_cliente_id());

-- Sócio lê eventos onde tem tarefa atribuída.
create policy evento_socio_select on public.evento
  for select using (
    public.current_perfil() = 'socio'
    and exists (
      select 1 from public.tarefa_evento te
      where te.evento_id = evento.id
        and te.responsavel_id = auth.uid()
    )
  );

-- =====================================================================
-- contrato
-- =====================================================================
create policy contrato_admin_all on public.contrato
  for all using (public.is_admin()) with check (public.is_admin());

-- Cliente lê os próprios contratos.
create policy contrato_cliente_select on public.contrato
  for select using (cliente_id = public.current_cliente_id());

-- Sócio lê (contexto) contratos de eventos onde tem tarefa atribuída.
create policy contrato_socio_select on public.contrato
  for select using (
    public.current_perfil() = 'socio'
    and exists (
      select 1 from public.tarefa_evento te
      where te.evento_id = contrato.evento_id
        and te.responsavel_id = auth.uid()
    )
  );

-- =====================================================================
-- contrato_servico
-- =====================================================================
create policy contrato_servico_admin_all on public.contrato_servico
  for all using (public.is_admin()) with check (public.is_admin());

-- Cliente lê os serviços dos próprios contratos.
create policy contrato_servico_cliente_select on public.contrato_servico
  for select using (
    exists (
      select 1 from public.contrato c
      where c.id = contrato_servico.contrato_id
        and c.cliente_id = public.current_cliente_id()
    )
  );

-- =====================================================================
-- tarefa_evento
-- =====================================================================
create policy tarefa_evento_admin_all on public.tarefa_evento
  for all using (public.is_admin()) with check (public.is_admin());

-- Sócio: lê apenas as próprias tarefas.
create policy tarefa_evento_socio_select on public.tarefa_evento
  for select using (
    public.current_perfil() = 'socio'
    and responsavel_id = auth.uid()
  );

-- Sócio: atualiza apenas as próprias tarefas (colunas restritas via trigger
-- fn_tarefa_evento_guard: não pode reabrir, trocar responsável nem visibilidade).
create policy tarefa_evento_socio_update on public.tarefa_evento
  for update
  using (
    public.current_perfil() = 'socio'
    and responsavel_id = auth.uid()
  )
  with check (
    public.current_perfil() = 'socio'
    and responsavel_id = auth.uid()
  );

-- Cliente: lê apenas tarefas públicas dos próprios eventos.
create policy tarefa_evento_cliente_select on public.tarefa_evento
  for select using (
    visivel_ao_cliente = true
    and exists (
      select 1 from public.evento e
      where e.id = tarefa_evento.evento_id
        and e.cliente_id = public.current_cliente_id()
    )
  );

-- =====================================================================
-- historico_tarefa  (append-only; escrita só via trigger/servidor)
-- =====================================================================
-- Admin lê tudo.
create policy historico_admin_select on public.historico_tarefa
  for select using (public.is_admin());

-- Sócio lê o histórico apenas das próprias tarefas.
create policy historico_socio_select on public.historico_tarefa
  for select using (
    public.current_perfil() = 'socio'
    and exists (
      select 1 from public.tarefa_evento te
      where te.id = historico_tarefa.tarefa_evento_id
        and te.responsavel_id = auth.uid()
    )
  );

-- Sem policies de INSERT/UPDATE/DELETE para qualquer perfil:
-- toda escrita é feita pelos triggers SECURITY DEFINER (fn_log_tarefa_evento)
-- ou pela service role no servidor, ambos ignorando RLS. Cliente não tem
-- policy de SELECT aqui, portanto não enxerga histórico (dado interno).
