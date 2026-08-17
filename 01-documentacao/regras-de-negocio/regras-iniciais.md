# Regras de negócio iniciais — MVP

> Classificação: CONFIRMADO (fornecido em 2026-08-17 junto com a
> especificação do MVP).

## Serviços e tarefas padrão

- Cada serviço possui: nome, descrição, status ativo/inativo, modelo de
  checklist associado, lista de tarefas padrão.
- Um serviço pode ter diversas tarefas associadas.
- Cada tarefa padrão possui: nome, descrição, serviço relacionado,
  responsável padrão, prazo, prioridade, ordem de execução, status
  ativo/inativo, indicação se é visível ao cliente, e (opcional, fora do
  MVP) dependência de outra tarefa.
- No MVP, cada tarefa possui apenas um responsável principal.

## Tarefa padrão vs. tarefa do evento

- A tarefa padrão (modelo) é diferente da tarefa gerada para o evento.
  Exemplo: tarefa padrão "Confirmar equipe de fotografia" gera a tarefa do
  evento "Confirmar equipe de fotografia do casamento de João e Maria".
- A conclusão ocorre sempre na tarefa específica do evento, nunca no
  modelo original — o modelo original deve permanecer inalterado.
- O checklist é específico de cada evento; alterações num evento não
  alteram o modelo original do checklist.

## Fechamento de contrato

Quando um contrato é marcado como "Fechado", o sistema deve:

1. identificar os serviços contratados;
2. localizar os modelos de checklist associados a esses serviços;
3. gerar uma cópia das tarefas para aquele evento;
4. vincular cada tarefa ao sócio previamente definido;
5. calcular os prazos;
6. criar o checklist do evento;
7. disponibilizar cada tarefa somente para o seu responsável.

## Status das tarefas

Status possíveis: `Pendente`, `Em andamento`, `Concluída`, `Bloqueada`.

Uma tarefa é identificada visualmente como **atrasada** quando o prazo
está vencido **e** o status não é "Concluída" (atraso é um estado visual
derivado, não um status próprio).

## Conclusão de tarefa

Ao marcar uma tarefa como concluída, o sistema deve:

- alterar o status da tarefa para "Concluída";
- marcar automaticamente o item correspondente no checklist do evento;
- registrar o usuário que concluiu, data e horário;
- atualizar o progresso do evento;
- atualizar a visão do gestor e, se a etapa for pública, a visão do
  cliente;
- manter a tarefa no histórico do evento (nunca excluir após concluída).

## Reabertura de tarefa

Somente administrador/gestor pode reabrir uma tarefa concluída. Ao
reabrir:

- o status retorna para "Pendente";
- o check é removido do checklist do evento;
- o progresso do evento é recalculado;
- a ação é registrada no histórico.

## Progresso do evento

Progresso = (tarefas concluídas / total de tarefas do evento). Exemplo: 6
de 10 tarefas concluídas = 60%. Deve aparecer no painel do gestor, na
página do evento, no checklist geral e para o cliente quando autorizado.

## Segurança e permissões

- A filtragem de tarefas por perfil deve ser aplicada no **backend**, não
  apenas na interface.
- Sócio acessa apenas as tarefas atribuídas a ele.
- Gestor acessa todas as tarefas autorizadas.
- Cliente acessa apenas os dados públicos do próprio evento.
- Usuários não podem acessar dados de outros clientes.
- Alterações importantes devem ser registradas (ver histórico).
- Tarefas não devem ser excluídas sem autorização administrativa.
- Um sócio não pode visualizar tarefa de outro apenas alterando o
  identificador/endereço da página (proteção contra IDOR).

## Histórico de alterações (mínimo obrigatório)

Registrar, para cada item: criação da tarefa, alteração de status,
conclusão, reabertura, mudança de responsável, alteração de prazo,
usuário responsável pela alteração, data e horário.
