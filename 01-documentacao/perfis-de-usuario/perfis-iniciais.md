# Perfis de usuário — MVP

> Classificação: CONFIRMADO (fornecido em 2026-08-17 junto com a
> especificação do MVP).

## Administrador/Gestor

Pode:

- cadastrar e editar clientes;
- cadastrar serviços;
- cadastrar sócios e usuários;
- criar modelos de checklist;
- definir o responsável de cada tarefa;
- criar contratos;
- fechar contratos;
- visualizar todos os eventos;
- visualizar todas as tarefas;
- alterar responsáveis;
- alterar prazos;
- reabrir tarefas concluídas;
- acompanhar tarefas pendentes, concluídas e atrasadas;
- visualizar o progresso geral dos eventos.

## Sócio/Responsável

Pode:

- acessar sua conta;
- visualizar somente as tarefas atribuídas a ele;
- visualizar os eventos relacionados às suas tarefas;
- consultar detalhes, prazos e descrições;
- alterar o status de suas tarefas;
- marcar tarefas como concluídas;
- adicionar observações, se essa funcionalidade estiver disponível no MVP
  (ver `01-documentacao/requisitos/backlog.md`).

Não pode:

- visualizar tarefas de outros sócios;
- alterar tarefas de outros responsáveis;
- excluir tarefas;
- alterar o responsável da tarefa;
- acessar informações administrativas não autorizadas.

## Cliente

Pode acessar apenas:

- seus dados;
- seus contratos;
- seus eventos;
- progresso geral do evento;
- etapas autorizadas do checklist (itens marcados como visíveis ao
  cliente).

Não pode visualizar:

- tarefas internas individuais;
- comentários internos;
- problemas operacionais;
- tarefas de outros sócios;
- informações administrativas ou financeiras não autorizadas.

## Regra transversal de segurança

A filtragem por perfil deve ser aplicada no backend, não apenas na
interface — um sócio não pode acessar a tarefa de outro sócio apenas
alterando o identificador na URL. Ver detalhamento em
`01-documentacao/regras-de-negocio/regras-iniciais.md`.
