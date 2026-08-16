# Betel Company — Sistema de Gestão

## Objetivo do projeto

Sistema de gestão para o grupo Betel (Betel Noivas, Betel Eventos, BTU
Eventos, Decoração, Betel Estúdio), cobrindo eventos, agenda, CRM/comercial,
financeiro, portal do cliente, checklists, gestão de terceiros, anexos/provas
e logística — com foco em transparência entre equipe e cliente ao longo do
ciclo de vida de cada evento.

Todo o contexto de negócio que fundamenta este projeto está documentado em
`docs/`, com base em informações reais fornecidas pelo cliente (ver seção
"Quais informações são reais" abaixo).

## Tecnologias confirmadas

Nenhuma tecnologia foi confirmada como definitiva ainda nesta primeira
execução. A arquitetura de referência inicial (não definitiva) está
documentada em `docs/06-referencia-arquitetura-supabase.md`:

- Aplicação web
- Supabase (PostgreSQL + Supabase Auth)

## Tecnologias ainda não decididas

- Framework/stack definitiva do frontend
- Hospedagem
- Domínio
- Mecanismo definitivo de autenticação e perfis de acesso
- Integrações (Google Calendar, Apple Calendar, WhatsApp)

Ver lista completa de decisões pendentes em
`docs/07-decisoes-pendentes.md`.

## Como executar o projeto

Ainda não há código executável neste projeto. Esta é a primeira execução do
setup: apenas estrutura de pastas e documentação de contexto foram criadas.
Instruções de execução serão adicionadas quando o código-base for iniciado,
após aprovação do plano técnico.

## Quais informações são reais

Todo o conteúdo de negócio em `docs/00-contexto-real-do-negocio-betel.md`,
`docs/01-requisitos-sistema-gestao.md`, `docs/02-regras-transparencia-portal-cliente.md`
e `docs/04-checklists-e-rotinas-operacionais.md` foi apresentado pelo
cliente e é tratado como requisito/contexto real do negócio — não foi
inventado ou extrapolado.

A proposta societária registrada em
`docs/05-proposta-societaria-em-discussao.md` é **apenas material de
discussão**, não um contrato definitivo, e não deve ser usada para gerar
regras de sistema.

## Quais decisões ainda estão pendentes

Ver lista completa e detalhada em `docs/07-decisoes-pendentes.md`. Resumo
das áreas em aberto: identidade do produto, perfis de acesso, regras do
portal do cliente, integrações externas, regras financeiras/cobrança,
política de anexos/retenção, LGPD, multitenancy, e stack final de
frontend/hospedagem/domínio/autenticação.

## Estrutura do projeto

```
Betel-Company-Sistema-Gestao/
├── docs/     # documentação de contexto de negócio e arquitetura
├── src/      # código-fonte (ainda não iniciado)
├── public/   # ativos públicos (ainda não iniciado)
├── tests/    # testes (ainda não iniciado)
└── README.md
```

## Estado atual

Primeira execução: apenas estrutura e documentação de contexto criadas.
Nenhuma tela, banco de dados ou funcionalidade foi implementada ainda,
conforme escopo definido para esta etapa.
