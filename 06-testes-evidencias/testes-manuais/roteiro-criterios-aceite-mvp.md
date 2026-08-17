# Roteiro de teste manual — Critérios de aceite do MVP

> Data: 2026-08-17. Cobre cada item da lista de critérios de aceite em
> `01-documentacao/requisitos/mvp.md`. Formato: Cenário / Pré-condições /
> Passos / Resultado esperado / Resultado obtido / Status.
>
> **Ainda não há código.** Todos os itens estão com Resultado obtido em branco e
> Status "Não executado ainda". Preencher conforme a implementação avançar.
>
> Valores de Status: `Não executado ainda` | `Aprovado` | `Reprovado` |
> `Bloqueado`.

## Dados de apoio (setup recomendado antes de executar)

Para reaproveitar entre cenários, criar uma vez:

- Admin/Gestor: `gestor@betel.test`
- Sócio A: `socioA@betel.test` — Sócio B: `socioB@betel.test`
- Cliente 1: `cliente1@betel.test` — Cliente 2: `cliente2@betel.test`
- Serviço "Fotografia" com modelo de checklist e ao menos 2 tarefas padrão
  (uma com responsável Sócio A, outra com responsável Sócio B).
- Evento "Casamento de João e Maria" para o Cliente 1.

---

## CA-01 — Gestor cadastra um serviço

- **Cenário:** Administrador/Gestor cadastra um novo serviço.
- **Pré-condições:** Logado como gestor.
- **Passos:** 1) Ir em `/servicos/novo`. 2) Preencher nome, descrição, status
  ativo e modelo de checklist. 3) Salvar.
- **Resultado esperado:** Serviço criado, listado em `/servicos` com status
  ativo.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-02 — Gestor cria um modelo de checklist

- **Cenário:** Gestor cria um modelo de checklist associado a um serviço.
- **Pré-condições:** Logado como gestor; serviço existente.
- **Passos:** 1) Ir em `/checklists`. 2) Criar modelo com nome e serviço
  associado. 3) Adicionar tarefas padrão. 4) Salvar.
- **Resultado esperado:** Modelo de checklist criado com suas tarefas padrão.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-03 — Cada tarefa pode receber um responsável

- **Cenário:** Definir o responsável padrão de uma tarefa do modelo.
- **Pré-condições:** Modelo de checklist com tarefas; sócios cadastrados.
- **Passos:** 1) Abrir uma tarefa padrão. 2) Selecionar o Sócio A como
  responsável padrão. 3) Salvar.
- **Resultado esperado:** Tarefa padrão fica vinculada ao Sócio A.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-04 — Gestor cria um contrato

- **Cenário:** Gestor cria um contrato para um cliente e evento.
- **Pré-condições:** Cliente, evento e serviços cadastrados.
- **Passos:** 1) Ir em `/contratos/novo`. 2) Selecionar Cliente 1 e evento.
  3) Selecionar serviços contratados. 4) Salvar como rascunho.
- **Resultado esperado:** Contrato criado com status "Rascunho".
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-05 — O contrato pode ser fechado

- **Cenário:** Gestor altera o status do contrato para "Fechado".
- **Pré-condições:** Contrato em rascunho (CA-04).
- **Passos:** 1) Abrir o contrato. 2) Alterar status para "Fechado". 3) Confirmar.
- **Resultado esperado:** Contrato passa a "Fechado" com data de fechamento.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-06 — Fechamento gera automaticamente o checklist do evento

- **Cenário:** Ao fechar o contrato, o checklist do evento é gerado.
- **Pré-condições:** Contrato fechado (CA-05).
- **Passos:** 1) Abrir `/eventos/[id]` do evento do contrato. 2) Verificar o
  checklist.
- **Resultado esperado:** Checklist do evento contém uma cópia das tarefas dos
  serviços contratados, específico do evento.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-07 — Tarefas atribuídas aos sócios corretos

- **Cenário:** Cada tarefa do evento herda o responsável do modelo.
- **Pré-condições:** Checklist do evento gerado (CA-06).
- **Passos:** 1) No checklist do evento, verificar o responsável de cada tarefa.
- **Resultado esperado:** Tarefa da fotografia atribuída ao Sócio A; a outra ao
  Sócio B, conforme os modelos.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-08 — Cada sócio visualiza somente suas próprias tarefas

- **Cenário:** Isolamento de tarefas por responsável (inclui tentativa por URL).
- **Pré-condições:** Tarefas atribuídas a Sócio A e Sócio B (CA-07).
- **Passos:** 1) Logar como Sócio A e abrir `/minhas-tarefas`. 2) Confirmar que
  só aparecem tarefas do Sócio A. 3) Tentar acessar a tarefa do Sócio B pela URL
  direta (trocando o id).
- **Resultado esperado:** Sócio A vê apenas as suas tarefas; o acesso à tarefa
  do Sócio B por URL é **negado no backend** (RLS), não só escondido.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-09 — Sócio altera o status da tarefa

- **Cenário:** Sócio muda o status de uma tarefa sua.
- **Pré-condições:** Logado como Sócio A com tarefa pendente.
- **Passos:** 1) Em `/minhas-tarefas`, abrir uma tarefa. 2) Alterar status para
  "Em andamento". 3) Salvar.
- **Resultado esperado:** Status atualizado para "Em andamento" e refletido na
  lista.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-10 — Sócio marca uma tarefa como concluída

- **Cenário:** Sócio conclui uma tarefa sua.
- **Pré-condições:** Logado como Sócio A com tarefa em andamento.
- **Passos:** 1) Abrir a tarefa. 2) Clicar em "Marcar como concluída". 3) Confirmar.
- **Resultado esperado:** Status muda para "Concluída"; tarefa não é excluída.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-11 — Checklist geral atualizado automaticamente

- **Cenário:** Concluir a tarefa marca o item no checklist do evento.
- **Pré-condições:** Tarefa concluída (CA-10).
- **Passos:** 1) Abrir `/eventos/[id]`. 2) Verificar o item correspondente no
  checklist.
- **Resultado esperado:** Item aparece marcado (✓) no checklist do evento.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-12 — Sistema registra usuário, data e horário da conclusão

- **Cenário:** Conclusão gera registro auditável.
- **Pré-condições:** Tarefa concluída (CA-10).
- **Passos:** 1) Abrir o histórico do evento/tarefa. 2) Verificar o registro de
  conclusão.
- **Resultado esperado:** Histórico mostra "concluída por Sócio A", data e hora.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-13 — Progresso do evento recalculado

- **Cenário:** Conclusão de tarefa atualiza o percentual de progresso.
- **Pré-condições:** Evento com total de tarefas conhecido; ao menos uma
  concluída (CA-10).
- **Passos:** 1) Abrir `/eventos/[id]` e o dashboard do gestor. 2) Conferir o %.
- **Resultado esperado:** Progresso = concluídas / total (ex.: 1 de 2 = 50%),
  consistente no evento, checklist e dashboard.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-14 — Gestor visualiza todas as tarefas

- **Cenário:** Gestor enxerga as tarefas de todos os sócios.
- **Pré-condições:** Logado como gestor; evento com tarefas de Sócio A e B.
- **Passos:** 1) Abrir `/eventos/[id]` e/ou `/dashboard`. 2) Verificar a lista.
- **Resultado esperado:** Gestor vê todas as tarefas do evento,
  independentemente do responsável.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-15 — Gestor reabre uma tarefa

- **Cenário:** Admin/gestor reabre uma tarefa concluída (e sócio não consegue).
- **Pré-condições:** Tarefa concluída (CA-10).
- **Passos:** 1) Como gestor, abrir a tarefa concluída e reabrir. 2) Verificar
  status, checklist, progresso e histórico. 3) Logar como Sócio A e tentar
  reabrir uma tarefa concluída.
- **Resultado esperado:** Gestor: status volta a "Pendente", check removido,
  progresso recalculado, ação no histórico. Sócio: reabertura **negada no
  backend**.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-16 — Sistema impede acessos não autorizados (validado no backend)

- **Cenário:** Isolamento por perfil e entre clientes na camada de dados.
- **Pré-condições:** Cliente 1 e Cliente 2 com eventos distintos; Sócios A e B.
- **Passos:** 1) Logar como Cliente 1 e tentar acessar dados do evento do
  Cliente 2 pela URL/API. 2) Logar como Cliente 1 e tentar ver tarefa interna
  não pública do próprio evento. 3) Repetir tentativas de IDOR entre sócios
  (reforço do CA-08) direto na API.
- **Resultado esperado:** Todas as tentativas de acesso indevido **falham no
  backend (RLS)**; cliente vê apenas os dados públicos do próprio evento.
- **Resultado obtido:**
- **Status:** Não executado ainda

## CA-17 — Modelo original do checklist permanece inalterado

- **Cenário:** Alterações no evento não afetam o modelo (tarefa_padrao).
- **Pré-condições:** Checklist do evento gerado (CA-06); tarefas concluídas e/ou
  reabertas no evento.
- **Passos:** 1) Após concluir/reabrir/editar tarefas do evento, abrir o modelo
  de checklist original em `/checklists/[id]`. 2) Comparar com o estado inicial.
- **Resultado esperado:** Tarefas padrão e modelo permanecem inalterados; nenhum
  status/conclusão do evento vazou para o modelo.
- **Resultado obtido:**
- **Status:** Não executado ainda
