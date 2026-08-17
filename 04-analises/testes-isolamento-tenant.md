# Plano de testes de isolamento entre tenants

> Migration **já aplicada** (2026-08-17, ver `00-gestao/changelog.md`).
> Os 21 casos abaixo continuam **não executados** — dependem de um
> segundo tenant de teste ("Empresa B") e usuários adicionais, que ainda
> não foram criados (só existe a Betel + 1 admin). Não criei esse
> tenant/usuários nesta rodada porque envolve criar dados novos (mesmo
> fictícios) num projeto real, o que pedi para confirmar antes — ver
> proposta na seção "Setup necessário" e o relatório final. Formato
> igual ao já usado em `06-testes-evidencias/testes-manuais/`: Cenário /
> Pré-condições / Passos / Resultado esperado / Resultado obtido /
> Status.

## Setup necessário antes de rodar

- Tenant "Betel Company" (já existe após a migration) + tenant fictício
  "Empresa B — Teste".
- Por tenant: 1 admin, 1 sócio, 1 cliente (6 usuários de teste no total).
- Por tenant: pelo menos 1 cliente, 1 evento, 1 tarefa_evento (para ter
  algo concreto para tentar acessar entre tenants).

## Grupo 1 — Usuários

| # | Cenário | Resultado esperado |
|---|---|---|
| T1 | Usuário da Betel acessa dados da Betel | Vê normalmente (RLS permite, mesma empresa) |
| T2 | Usuário da Empresa B acessa dados da Empresa B | Vê normalmente |
| T3 | Usuário da Betel **não** acessa dados da Empresa B | Lista vazia / 0 linhas — RLS nega, não erro visível diferenciado (não deve revelar "existe mas você não pode ver") |
| T4 | Usuário da Empresa B **não** acessa dados da Betel | Idem T3, invertido |

## Grupo 2 — URLs e IDs (troca manual)

Testar trocando manualmente o ID (via URL da tela e via chamada direta à
API REST do Supabase com o JWT do usuário) para um registro que existe,
mas pertence ao outro tenant:

| # | Recurso testado |
|---|---|
| T5 | ID de cliente |
| T6 | ID de serviço |
| T7 | ID de contrato |
| T8 | ID de evento |
| T9 | ID de tarefa (`tarefa_evento`) |
| T10 | ID de usuário |

**Resultado esperado em todos:** acesso negado no backend (RLS) — 0
linhas retornadas pela API, nunca um erro que revele que o registro
existe em outro tenant.

## Grupo 3 — Inserção e atualização maliciosa

| # | Tentativa | Resultado esperado |
|---|---|---|
| T11 | Inserir registro informando `empresa_id` de outra empresa (via payload direto na API, não pela UI) | Bloqueado pela `with check` da policy — a policy exige `empresa_id = current_empresa_id()`, então um `insert` com `empresa_id` diferente falha |
| T12 | Alterar `empresa_id` de um registro existente | Bloqueado — nenhuma policy libera update dessa coluna para `authenticated` (nem sócio/cliente nem admin-de-outra-empresa; admin só edita dentro do próprio tenant) |
| T13 | Mover registro de uma empresa para outra (equivalente a T12) | Mesmo bloqueio |
| T14 | Atualizar tarefa (`tarefa_evento`) de outro tenant | Bloqueado — `tarefa_evento_socio_update`/`_admin_all` exigem `empresa_id = current_empresa_id()` |
| T15 | Consultar histórico (`historico_tarefa`) de outro tenant | Bloqueado — mesma lógica, e histórico já não é gravável via API por ninguém além dos triggers |

## Grupo 4 — Por perfil (6 combinações)

| # | Perfil | O que deve ver |
|---|---|---|
| T16 | Gestor da Betel | Tudo da Betel, nada da Empresa B |
| T17 | Sócio da Betel | Só as próprias tarefas, dentro da Betel |
| T18 | Cliente da Betel | Só os próprios dados públicos, dentro da Betel |
| T19 | Gestor de outra empresa | Tudo da própria empresa, nada da Betel |
| T20 | Sócio de outra empresa | Só as próprias tarefas, dentro da própria empresa |
| T21 | Cliente de outra empresa | Só os próprios dados, dentro da própria empresa |

## Nota sobre execução

Todos os 21 casos exigem dados reais para testar (não dá pra testar
isolamento sem 2 tenants populados). Recomendo automatizar como teste de
integração (Vitest/Playwright, já previsto em
`06-testes-evidencias/relatorios/estrategia-de-testes.md`) em vez de só
manual, dado o volume — um teste de integração parametrizado por
(tenant, perfil, recurso) cobre a matriz inteira sem repetir 21 vezes na
mão.
