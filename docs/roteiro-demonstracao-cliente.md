# Roteiro de demonstração ao cliente

> Usa os dados fictícios descritos em `docs/dados-demo.md`. Ambiente:
> Codespace de desenvolvimento (URL temporária) — deixar claro ao
> cliente que **isto não é o ambiente definitivo**, é uma demonstração
> controlada do que o sistema já faz.

## Mensagem central

> "O sistema transforma o serviço contratado em uma sequência
> organizada de execução, distribui responsabilidades e permite
> acompanhar o progresso sem depender de controles paralelos."

## Passo a passo

1. **Login** — mostrar a tela de login, entrar como administrador.
2. **Onboarding** — se for a primeira vez logada com essa conta (ou
   clicar em "Refazer dicas" na barra lateral), o tour guiado abre
   sozinho: 6 passos rápidos mostrando cadastros, checklist, eventos e
   contratos, fechamento, e acompanhamento. Pode pular a qualquer
   momento.
3. **Visão geral da navegação** — menu lateral: Cadastros (clientes,
   sócios, serviços), Eventos (eventos, contratos), Acompanhamento
   (agenda, checklists, tarefas).
4. **Cadastro de cliente** — abrir "Clientes", mostrar Ana Beatriz e
   Carlos já cadastrados; opcionalmente cadastrar um cliente novo ao
   vivo para mostrar o formulário.
5. **Cadastro de serviço + checklist** — abrir "Serviços" →
   "Decoração de Casamento (demonstração)" → mostrar o checklist com
   as 2 tarefas padrão, cada uma já com responsável definido
   (Mariana Costa) e prazo relativo à data do evento.
6. **Criação de evento** — "Eventos" → mostrar o evento "Casamento Ana
   & Rafael", vinculado à cliente Ana Beatriz, com área "Betel Noivas".
7. **Criação de contrato** — "Contratos" → abrir o contrato de Ana
   Beatriz, mostrando os serviços contratados.
8. **Fechamento do contrato** — este é o momento-chave: explicar que ao
   clicar "Fechar contrato", o sistema **gera automaticamente** as
   tarefas do checklist do serviço contratado, já atribuídas ao sócio
   responsável, com prazo calculado a partir da data do evento. Mostrar
   o contrato do Carlos ainda em rascunho como contraste (nada foi
   gerado ainda para ele).
9. **Tarefas geradas** — "Acompanhamento" → "Tarefas": mostrar as 2
   tarefas do Casamento Ana & Rafael, com prazo já calculado
   (12/09 e 01/10) e responsável (Mariana Costa) preenchidos sozinhos.
10. **Minhas tarefas (perfil sócio)** — explicar que, do ponto de vista
    da Mariana, ela só vê as tarefas atribuídas a ela em
    "Minhas tarefas" — sem acesso a áreas administrativas.
11. **Progresso** — no Dashboard, mostrar "Progresso por evento":
    0 de 2 tarefas concluídas (0%) para o Casamento Ana & Rafael —
    explicar que esse número sobe conforme as tarefas são concluídas.
12. **Dashboard** — visão geral: contratos em rascunho/fechados,
    eventos, tarefas pendentes/atrasadas/concluídas.
13. **Agenda** — "Acompanhamento" → "Agenda", navegar até setembro/
    outubro de 2026 para mostrar os dois eventos no calendário, com
    cor por área de negócio e link de WhatsApp do cliente no dia.

## Encerramento

Reforçar o valor: organização de clientes, padronização da execução
por serviço, rastreabilidade (quem fez o quê e quando), e uma visão
única de progresso — sem precisar de planilha paralela.

Ver `docs/limites-da-demonstracao.md` para o que **não** prometer
nesta etapa.
