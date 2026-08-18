# Dados de demonstração

> Criados em 2026-08-19, direto pelas telas reais do sistema (não por
> SQL manual), no mesmo tenant "Betel Company" — não existe hoje um
> tenant de demonstração separado (decisão de escopo: congelado para a
> demo comercial, ver `00-gestao/status-atual.md`). Todos os nomes e
> e-mails são fictícios, claramente marcados "(demonstração)" e com
> domínio `exemplo.com`/`example.com`.

## O que existe

**Clientes**
- Ana Beatriz Ferreira (demonstração) — ana.demo@exemplo.com
- Carlos Eduardo Souza (demonstração) — carlos.demo@exemplo.com

**Sócio**
- Mariana Costa (demonstração) — mariana.demo@exemplo.com — responsável
  pelas tarefas do checklist abaixo. Senha temporária gerada na criação,
  não registrada aqui (ver "Novo usuário" no app para gerar de novo se
  precisar logar como ela).

**Serviço + checklist**
- "Decoração de Casamento (demonstração)", com 2 tarefas padrão:
  1. "Reunião de alinhamento com o cliente" — prazo padrão: 20 dias
     antes do evento — responsável: Mariana Costa
  2. "Montagem da decoração no local" — prazo padrão: 1 dia antes do
     evento — responsável: Mariana Costa

**Eventos**
- "Casamento Ana & Rafael" — cliente Ana Beatriz — área "Betel Noivas"
- "Aniversário de 15 anos - Filha do Carlos" — cliente Carlos Eduardo —
  área "Betel Eventos"

**Contratos**
- Casamento Ana & Rafael: **fechado** — gerou as 2 tarefas do checklist
  automaticamente, com prazos calculados a partir da data do evento e
  já atribuídas à Mariana Costa (visível em `/tarefas`, `/dashboard` e
  na agenda do evento)
- Aniversário do Carlos: deixado **em rascunho**, de propósito — para
  demonstrar os dois estados de contrato lado a lado

## Por que esse conjunto

Cobre o fluxo principal ponta a ponta pedido para a demonstração:
cliente → serviço → checklist → evento → contrato → fechamento →
geração automática de tarefas → responsável atribuído → progresso →
dashboard. Um contrato fechado e um em rascunho mostram os dois estados
sem precisar improvisar durante a apresentação.

## Antes de qualquer uso real com dados de cliente de verdade

Esses registros **precisam ser removidos** do banco antes do go-live —
já está registrado como pendência bloqueante em
`00-gestao/status-atual.md` ("Dados de teste — confirmar que não
sobrou nenhum registro fictício"). Não há tenant separado hoje, então
a limpeza é manual: apagar os 2 clientes, o serviço/checklist, os 2
eventos, os 2 contratos e a conta de Mariana Costa antes de o primeiro
cliente real usar o sistema.
