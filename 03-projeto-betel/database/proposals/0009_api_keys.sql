-- =====================================================================
-- Proposta 0009 — chaves de API para integração externa (v1, só leitura)
-- =====================================================================
--
-- NÃO APLICADA em produção nem em staging ainda. Proposta pendente de
-- decisão — ver 04-analises/integracao-api.md e 00-gestao/pendencias.md.
--
-- Guarda só o hash da chave (SHA-256, hex), nunca o valor em texto
-- puro — mesmo princípio da senha temporária de usuário
-- (src/lib/validation/usuario.ts: gerarSenhaTemporaria).
-- =====================================================================

create table public.api_key (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid not null references public.empresa (id) on delete cascade,
  nome          text not null,
  chave_hash    text not null unique,
  criado_por    uuid references public.usuario (id) on delete set null,
  ultimo_uso_em timestamptz,
  ativo         boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_api_key_empresa_id on public.api_key (empresa_id);
-- Lookup pela chave precisa ser rápido e não pode vazar por qual tenant
-- filtrar antes de validar o hash — índice único em chave_hash já cobre.

create trigger trg_api_key_updated
  before update on public.api_key
  for each row execute function public.set_updated_at();

alter table public.api_key enable row level security;
alter table public.api_key force row level security;

-- Gestão de chaves (criar/ver/revogar) é só do admin da própria empresa,
-- via app normal (JWT do usuário) -- não é o caminho usado pelos
-- endpoints /api/v1/*, que validam a chave com service_role antes de
-- saber a qual empresa ela pertence (ver 04-analises/integracao-api.md).
create policy api_key_admin_all on public.api_key
  for all using (public.is_admin_of(empresa_id)) with check (public.is_admin_of(empresa_id));

-- GRANT necessário pra authenticated (gestão de chaves pelo admin, via app):
-- grant select, insert, update, delete on public.api_key to authenticated;
--
-- GRANT necessário pra service_role (validação da chave nos endpoints
-- /api/v1/*, e leitura de evento/tarefa_evento pra servir as respostas)
-- -- proposta estreita, só SELECT, só nestas 3 tabelas, diferente da
-- proposta ampla rejeitada anteriormente (ver 00-gestao/riscos.md):
-- grant select on public.api_key to service_role;
-- grant select on public.evento to service_role;
-- grant select on public.tarefa_evento to service_role;
--
-- Os GRANTs acima ficam comentados de propósito — aplicar primeiro em
-- staging pra validar os endpoints; produção só com autorização
-- explícita separada.
