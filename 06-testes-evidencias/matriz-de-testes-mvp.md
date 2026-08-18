# Matriz de testes — MVP completo (Contratos → Dashboard)

> Executados em 2026-08-18, via navegador contra o Codespace de teste e via
> API REST do Supabase (Auth + PostgREST) para os testes de segurança.
> Fluxo E2E real: login → cliente → serviço+checklist → evento → contrato
> → fechamento → geração automática de tarefa → minhas tarefas → conclusão
> → progresso → dashboard. Dados fictícios (`*.teste.local` / sem email),
> removidos ao final — ver seção "Limpeza" no relatório final.

| ID | Funcionalidade | Perfil | Cenário | Resultado esperado | Resultado real | Status |
|---|---|---|---|---|---|---|
| T01 | Checklist | admin | Criar checklist_modelo para um serviço sem checklist | Botão "Criar checklist" cria o modelo, mostra "Nova tarefa" | Criado, tela mudou corretamente | Passou |
| T02 | Checklist | admin | Criar tarefa_padrao (nome, prazo -30, prioridade, visível ao cliente) | Tarefa aparece na listagem do checklist | OK | Passou |
| T03 | Evento | admin | Criar evento vinculado a um cliente | Evento aparece na listagem com cliente e data | OK | Passou |
| T04 | Contrato | admin | Criar contrato (evento + 1 serviço) | Contrato criado como "Rascunho" | OK | Passou |
| T05 | Contrato | admin | Fechar contrato | Status muda para "Fechado", `data_fechamento` preenchida | OK | Passou |
| T06 | Geração automática | sistema | Verificar `tarefa_evento` gerada a partir da `tarefa_padrao` do serviço contratado | 1 tarefa criada, prazo = data do evento + offset | 1 tarefa criada; prazo calculado bateu exatamente (evento 10/12/2026, offset -30 → tarefa 10/11/2026) | Passou |
| T07 | Idempotência | sistema | Chamar `fechar_contrato()` de novo no mesmo contrato já fechado (via RPC direta) | Nenhuma tarefa duplicada, sem erro | HTTP 204, contagem de tarefas continuou em 1 | Passou |
| T08 | Bloqueio pós-fechamento | admin | Acessar `/contratos/[id]/editar` de um contrato fechado | Redireciona de volta ao detalhe, sem permitir edição | OK | Passou |
| T09 | Atribuição de responsável | admin | Atribuir sócio a uma tarefa gerada, na tela do evento | `responsavel_id` atualizado | OK (confirmado no banco) | Passou |
| T10 | Minhas Tarefas | sócio | Login do sócio, ver tarefa atribuída | Tarefa aparece em "Pendentes" com prazo/prioridade corretos | OK | Passou |
| T11 | Concluir tarefa | sócio | Clicar "Concluir" | Tarefa move para "Concluídas"; `concluida_por`/`concluida_em` preenchidos pela trigger | OK | Passou |
| T12 | Dashboard | admin | Ver indicadores após o fluxo completo | Contratos fechados=1, eventos=1, tarefas concluídas=1, progresso do evento=100% | Todos os números bateram exatamente | Passou |
| T13 (segurança) | RLS | sócio | Tentar reabrir a própria tarefa concluída via API | Bloqueado pelo trigger `fn_tarefa_evento_guard` | `P0001 — Apenas administrador/gestor pode reabrir uma tarefa concluída` | Passou |
| T14 (segurança) | RLS | sócio | SELECT em `tarefa_padrao`/`checklist_modelo` (config interna) | Sem policy de SELECT para sócio → vazio/bloqueado | **Executado de verdade no gate final (2026-08-18):** HTTP 200, 0 linhas nas duas tabelas | Passou |
| T15 (regressão) | isolamento multitenant | — | Nenhuma policy/função de tenant alterada nesta fase (só função nova aditiva `fechar_contrato`) | Sem impacto nos 27 testes anteriores | **Reexecutado de verdade no gate final:** 29/29 (27 casos originais + 2 checks do T14) — ver `04-analises/testes-isolamento-tenant.md` (seção do gate) | Passou |
| T16 (gate) | Contrato fechado — 3 caminhos | admin | Editar via UI/Server Action / via API direta (banco) | UI bloqueia; banco não bloqueia (só `is_admin_of`, sem checar `status`) | UI: bloqueado (T08). API direta: `DELETE contrato_servico` → HTTP 204 (funcionou); `PATCH status→'rascunho'` → HTTP 200 (funcionou). **Risco confirmado, registrado como R10** em `00-gestao/riscos.md` | Passou (comportamento confirmado, risco documentado, não corrigido nesta fase por decisão de escopo) |
| T17 (gate) | Concorrência real | sistema | 2 chamadas HTTP simultâneas a `fechar_contrato()` no mesmo contrato | Nenhuma duplicação, lock `FOR UPDATE` funcionando | Ambas HTTP 204/200, sem erro, sem tarefa duplicada | Passou |

## Observação sobre T14 (histórico da decisão)

Na primeira rodada desta matriz, T14 tinha sido marcado como "não
executado" (só revisão estática das policies `checklist_modelo_admin_all`/
`tarefa_padrao_admin_all`). No gate final de validação antes do push
(2026-08-18), foi executado de verdade contra o Supabase real — resultado
bateu com o esperado pela revisão estática.

## Reexecução dos 27 testes de isolamento (gate final, 2026-08-18)

Fixture completa recriada do zero: 5 contas novas via Admin API, seed
rodado (`Empresa B — Teste` + dados extras dentro da Betel para o Grupo
1), 6 logins reais, 29 verificações via API REST (os 27 casos originais
da matriz de `04-analises/testes-isolamento-tenant.md`, com os testes do
Grupo 4 contando 2 sub-checks cada, + os 2 checks do T14 desta fase).
**Resultado: 29/29 passaram.** Fixture removida ao final (SQL de cleanup
+ 5 contas Auth deletadas), Betel validada como intacta.
