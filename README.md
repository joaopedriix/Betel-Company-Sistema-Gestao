# Betel Company — Sistema de Gestão

## Objetivo do projeto

Sistema de gestão para o grupo Betel (Betel Noivas, Betel Eventos, BTU
Eventos, Decoração, Betel Estúdio), cobrindo eventos, agenda, CRM/comercial,
financeiro, portal do cliente, checklists, gestão de terceiros, anexos/provas
e logística — com foco em transparência entre equipe e cliente ao longo do
ciclo de vida de cada evento.

Todo o contexto de negócio que fundamenta este projeto está documentado em
`01-documentacao/`, com base em informações reais fornecidas pelo cliente
(ver seção "Quais informações são reais" abaixo).

O projeto segue o método de organização e as fases descritas em
`05-prompts/00-organizacao-geral-do-projeto.md`. O estado atual sempre pode
ser consultado em `00-gestao/status-atual.md`.

## Tecnologias confirmadas

Nenhuma tecnologia foi confirmada como definitiva ainda. A arquitetura de
referência inicial (não definitiva) está documentada em
`01-documentacao/integracoes/06-referencia-arquitetura-supabase.md`:

- Aplicação web
- Supabase (PostgreSQL + Supabase Auth)

## Tecnologias ainda não decididas

- Framework/stack definitiva do frontend
- Hospedagem
- Domínio
- Mecanismo definitivo de autenticação e perfis de acesso
- Integrações (Google Calendar, Apple Calendar, WhatsApp)

Ver lista completa de decisões pendentes em `00-gestao/pendencias.md`.

## Como executar o projeto

Ainda não há código executável neste projeto. Apenas estrutura de pastas e
documentação de contexto foram criadas até o momento. Instruções de
execução serão adicionadas quando o código-base for iniciado, após
aprovação do plano técnico (Fase 3 e Fase 4).

## Quais informações são reais

Todo o conteúdo de negócio em
`01-documentacao/requisitos/00-contexto-real-do-negocio-betel.md`,
`01-documentacao/requisitos/01-requisitos-sistema-gestao.md`,
`01-documentacao/regras-de-negocio/02-regras-transparencia-portal-cliente.md`
e `01-documentacao/fluxos-do-sistema/04-checklists-e-rotinas-operacionais.md`
foi apresentado pelo cliente e é tratado como requisito/contexto real do
negócio — não foi inventado ou extrapolado.

A proposta societária registrada em
`01-documentacao/05-proposta-societaria-em-discussao.md` é **apenas
material de discussão**, não um contrato definitivo, e não deve ser usada
para gerar regras de sistema.

## Quais decisões ainda estão pendentes

Ver lista completa e detalhada em `00-gestao/pendencias.md`. Resumo das
áreas em aberto: identidade do produto, perfis de acesso, regras do portal
do cliente, integrações externas, regras financeiras/cobrança, política de
anexos/retenção, LGPD, multitenancy, e stack final de
frontend/hospedagem/domínio/autenticação.

## Estrutura do projeto

```
Betel-Company-Sistema-Gestao/
├── 00-gestao/              # status, escopo, decisões técnicas, pendências, riscos, changelog
├── 01-documentacao/        # requisitos, regras de negócio, fluxos, integrações
├── 02-original-cliente/    # sistema original do cliente (vazio — nenhum fornecido ainda)
├── 03-projeto-betel/       # código-fonte (src/, public/, tests/) — ainda não iniciado
├── 04-analises/            # inventário técnico e análises (Fase 1 — pendente de decisão)
├── 05-prompts/             # prompts de trabalho por etapa
├── 06-testes-evidencias/   # evidências de testes manuais e automatizados
├── 07-backups/             # backups antes de alterações estruturais
├── 08-arquivos-temporarios/# arquivos temporários
└── README.md
```

## Estado atual

Estrutura de pastas oficial e documentação de contexto criadas. Nenhuma
tela, banco de dados ou funcionalidade foi implementada ainda. Ver detalhes
em `00-gestao/status-atual.md`.
