# Fluxos iniciais — MVP

> Classificação: CONFIRMADO (fornecido em 2026-08-17 junto com a
> especificação do MVP).

## Fluxo principal (visão geral)

```
Cadastro inicial (clientes, sócios, serviços, checklists, tarefas, prazos)
        ↓
Criação do contrato (cliente + evento + serviços, status Rascunho)
        ↓
Fechamento do contrato (status → Fechado)
        ↓
Checklist do evento gerado automaticamente
        ↓
Tarefas do evento criadas (cópia das tarefas padrão dos serviços)
        ↓
Responsáveis definidos (herdados do modelo, sócio vê em "Minhas tarefas")
        ↓
Sócios executam e concluem as tarefas
        ↓
Checklist geral e progresso do evento atualizados automaticamente
```

## Cadastro inicial

O administrador cadastra, nesta ordem lógica: clientes; sócios ou
responsáveis; serviços; modelos de checklist; tarefas; responsáveis por
cada tarefa; prazos das tarefas.

## Criação do contrato

O administrador: seleciona um cliente; cadastra ou seleciona um evento;
seleciona os serviços contratados; informa os dados principais do
contrato; salva como rascunho; e, quando pronto, altera o status para
"Fechado" (ver regra de fechamento em
`01-documentacao/regras-de-negocio/regras-iniciais.md`).

## Checklist do evento

Exibe todas as tarefas geradas a partir dos serviços contratados,
específico daquele evento (não altera o modelo original). Exemplo:

```
Evento: Casamento de João e Maria

[✓] Confirmar briefing com o cliente
[ ] Definir equipe de fotografia
[✓] Confirmar estrutura da cerimônia
[ ] Revisar fornecedores
```

Cada item exibe, quando permitido pelo perfil do usuário: nome da tarefa,
responsável, prazo, prioridade, status, data de conclusão.

## Área "Minhas tarefas" (sócio)

Exibe somente as tarefas em que o usuário logado é o responsável. Cada
tarefa mostra: nome; evento relacionado; cliente; data do evento; prazo;
prioridade; status; descrição; botão para alterar status; botão para
marcar como concluída.

Filtros recomendados: pendentes; em andamento; concluídas; atrasadas; por
data; por prioridade; por evento.

## Conclusão de tarefa

Ver regra completa em
`01-documentacao/regras-de-negocio/regras-iniciais.md`. Resumo do fluxo:
sócio marca como concluída → status muda → checklist do evento atualiza
→ progresso do evento recalcula → visão do gestor (e do cliente, se
pública) atualiza → registro fica no histórico, tarefa nunca é excluída.

## Progresso do evento

Calculado como tarefas concluídas / total de tarefas do evento. Exibido
no painel do gestor, na página do evento, no checklist geral e para o
cliente quando autorizado.
