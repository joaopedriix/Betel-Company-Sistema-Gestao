# MVP — Sistema de gestão de eventos, contratos, checklists e tarefas

> Origem: especificação de MVP fornecida em 2026-08-17. Classificação:
> CONFIRMADO como escopo do MVP (conteúdo fornecido diretamente para
> orientar a construção, não é hipótese).

## Objetivo principal

Permitir que, após o fechamento de um contrato, o sistema gere
automaticamente as tarefas do evento e distribua cada tarefa ao sócio
responsável por executá-la.

O sistema deve:

- permitir que o administrador cadastre clientes, serviços, sócios e
  modelos de tarefas;
- permitir criar um contrato associado a um cliente e a um evento;
- gerar automaticamente o checklist do evento ao fechar o contrato;
- vincular cada tarefa a um sócio responsável;
- restringir a visualização de cada sócio às suas próprias tarefas;
- permitir que o sócio marque sua tarefa como concluída;
- marcar automaticamente o item correspondente no checklist geral ao
  concluir uma tarefa;
- permitir que o gestor acompanhe o progresso completo do evento.

## Escopo — deve ser desenvolvido agora

- Autenticação
- Perfis de acesso (Administrador/Gestor, Sócio/Responsável, Cliente)
- Cadastro de clientes
- Cadastro de usuários e sócios
- Cadastro de serviços
- Modelos de checklist
- Cadastro de tarefas (padrão)
- Definição do responsável por tarefa
- Criação de contratos
- Fechamento do contrato
- Geração automática do checklist do evento
- Distribuição das tarefas por responsável
- Área "Minhas tarefas"
- Atualização de status da tarefa
- Conclusão de tarefas
- Atualização automática do checklist geral
- Cálculo do progresso do evento
- Histórico básico de alterações
- Dashboard do gestor

Ver backlog (fora do MVP) em `01-documentacao/requisitos/backlog.md`.
Ver perfis detalhados em `01-documentacao/perfis-de-usuario/perfis-iniciais.md`.
Ver regras de negócio em `01-documentacao/regras-de-negocio/regras-iniciais.md`.
Ver fluxos em `01-documentacao/fluxos-do-sistema/fluxos-iniciais.md`.
Ver modelo de dados e telas propostas em `00-gestao/decisoes-tecnicas.md`
(Fase 3 — ainda como proposta, pendente de aprovação).

## Critérios de aceite do MVP

O MVP será considerado funcional quando:

- [ ] o gestor conseguir cadastrar um serviço;
- [ ] o gestor conseguir criar um modelo de checklist;
- [ ] cada tarefa puder receber um responsável;
- [ ] o gestor conseguir criar um contrato;
- [ ] o contrato puder ser fechado;
- [ ] o fechamento gerar automaticamente o checklist do evento;
- [ ] as tarefas forem atribuídas aos sócios corretos;
- [ ] cada sócio visualizar somente suas próprias tarefas;
- [ ] o sócio conseguir alterar o status da tarefa;
- [ ] o sócio conseguir marcar uma tarefa como concluída;
- [ ] o checklist geral for atualizado automaticamente;
- [ ] o sistema registrar usuário, data e horário da conclusão;
- [ ] o progresso do evento for recalculado;
- [ ] o gestor conseguir visualizar todas as tarefas;
- [ ] o gestor conseguir reabrir uma tarefa;
- [ ] o sistema impedir acessos não autorizados (validado no backend);
- [ ] o modelo original do checklist permanecer inalterado.

## Diretrizes de design (referência para a UI)

- Interface simples, profissional, responsiva (desktop, tablet, celular);
- Foco em tarefas e prazos;
- Destaque visual para tarefas atrasadas;
- Status identificado por cor: verde = concluída, amarelo = em andamento,
  cinza = pendente, vermelho = atrasada, azul = informação/atividade em
  andamento;
- Checklist claro; navegação simples.
