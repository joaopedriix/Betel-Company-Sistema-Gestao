# Testes de isolamento entre tenants

> ✅ **EXECUTADOS em 2026-08-17** contra o Supabase real. **27/27
> PASSARAM** — mas só depois de 2 correções de bugs reais encontrados
> durante a execução (não pegos por nenhuma revisão estática) — ver
> `00-gestao/changelog.md` e o cabeçalho de
> `03-projeto-betel/database/proposals/0002_multitenant.sql`.

## Setup usado (dados fictícios, criados nesta rodada)

- Tenant "Betel Company" (já existia) + tenant novo **"Empresa B —
  Teste"**.
- Usuários fictícios criados (emails sintéticos, nunca reais):
  - Betel: sócio (`socio.teste.betel@example.com`), cliente-login
    (`cliente.teste.betel@example.com`) — o admin já existia
    (`joaopedriix@gmail.com`).
  - Empresa B: admin, sócio, cliente-login (`*.teste.empresab@example.com`).
- Dados de negócio fictícios por tenant: 1 serviço, 1 modelo de
  checklist, 1 tarefa padrão, 1 cliente (linkado ao usuário-cliente), 1
  evento, 1 contrato (fechado), 1 tarefa do evento (responsável = sócio
  do tenant, visível ao cliente).

## Bugs encontrados DURANTE a execução (não pela revisão estática)

1. **`fn_log_tarefa_evento()` não preenchia `empresa_id`** ao gravar em
   `historico_tarefa` (agora `NOT NULL`) — toda criação de tarefa
   quebrava com erro de constraint. Trigger é **pré-existente desde a
   Fase 4**, não foi tocado pela migration original.
2. **Recursão infinita de RLS** (`42P17`) entre `evento` e
   `tarefa_evento` — `evento_socio_select` consultava `tarefa_evento`
   direto, e `tarefa_evento_cliente_select` consultava `evento` direto;
   cada uma reavaliava a RLS da outra, em loop. **Esse par de policies
   já existia desde a Fase 4**, antes de qualquer coisa de tenant — só
   apareceu agora porque foi a primeira vez que houve dados reais em
   `evento`+`tarefa_evento` com sócio/cliente testando ao mesmo tempo.

Ambos corrigidos e incorporados ao arquivo da migration (para quem
rodar do zero não bater nos mesmos bugs).

## Grupo 1 — Usuários (T1–T4)

| # | Cenário | Status |
|---|---|---|
| T1 | Sócio Betel vê a própria tarefa | ✅ PASSOU |
| T2 | Sócio Empresa B vê a própria tarefa | ✅ PASSOU |
| T3 | Sócio Betel **não** vê tarefa da Empresa B | ✅ PASSOU |
| T4 | Sócio Empresa B **não** vê tarefa da Betel | ✅ PASSOU |

## Grupo 2 — Troca de ID na URL/API (T5–T10)

| # | Recurso testado | Status |
|---|---|---|
| T5 | ID de cliente (outro tenant) | ✅ PASSOU (0 linhas) |
| T6 | ID de serviço (outro tenant) | ✅ PASSOU |
| T7 | ID de contrato (outro tenant) | ✅ PASSOU |
| T8 | ID de evento (outro tenant) | ✅ PASSOU |
| T9 | ID de tarefa (`tarefa_evento`, outro tenant) | ✅ PASSOU |
| T10 | ID de usuário (admin de outro tenant) | ✅ PASSOU |

Todos retornaram lista vazia (`[]`), nunca um erro que revelasse que o
registro existe em outro tenant.

## Grupo 3 — Inserção e atualização maliciosa (T11–T15)

| # | Tentativa | Status |
|---|---|---|
| T11 | Admin insere tarefa com `empresa_id` de outro tenant | ✅ PASSOU (HTTP 403) |
| T12 | Admin tenta alterar `empresa_id` de tarefa existente | ✅ PASSOU (HTTP 400 — trigger de imutabilidade) |
| T13 | Sócio tenta trocar o `responsavel_id` da própria tarefa | ✅ PASSOU (HTTP 400 — `fn_tarefa_evento_guard`) |
| T14 | Sócio de outro tenant tenta atualizar tarefa da Betel | ✅ PASSOU (0 linhas afetadas) |
| T15 | Sócio Betel consulta histórico da Empresa B | ✅ PASSOU (não vê) |

## Grupo 4 — Por perfil (T16–T21)

| # | Perfil | Status |
|---|---|---|
| T16 | Admin Betel vê contrato Betel, não vê da Empresa B | ✅ PASSOU (2/2) |
| T17 | Sócio Betel vê só a própria tarefa | ✅ PASSOU |
| T18 | Cliente Betel vê o próprio evento, não o da Empresa B | ✅ PASSOU (2/2) |
| T19 | Admin Empresa B vê contrato próprio, não o da Betel | ✅ PASSOU (2/2) |
| T20 | Sócio Empresa B vê só a própria tarefa | ✅ PASSOU |
| T21 | Cliente Empresa B vê o próprio evento, não o da Betel | ✅ PASSOU (2/2) |

## Conclusão

**Isolamento multitenant confirmado funcionando em todos os 27 casos**,
depois das 2 correções. Nenhum vazamento entre tenants detectado —
leitura, escrita, troca de ID por URL/API, e alteração maliciosa de
`empresa_id` todos bloqueados corretamente no backend (RLS), nunca só na
interface (não há interface ainda para nenhuma dessas telas).

Dados fictícios de teste permanecem no banco (tenant "Empresa B — Teste"
+ 5 usuários + registros de negócio de teste) — considerar limpá-los
antes de qualquer demonstração real para o cliente Betel, ou mantê-los
como fixture permanente de teste (decisão do usuário).
