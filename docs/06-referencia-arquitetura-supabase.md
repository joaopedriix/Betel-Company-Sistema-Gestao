# Referência inicial de arquitetura — Supabase

> Registro de referência inicial. **Não é decisão definitiva.** Não criar
> banco de dados definitivo, migrations ou regras complexas antes da
> validação da arquitetura.

## Referência tecnológica inicial

- Aplicação web
- Supabase
- PostgreSQL
- Supabase Auth

## Entidades previstas (nível conceitual)

- Usuários
- Eventos
- Clientes
- Checklists
- Tarefas
- Histórico

## Preocupações de arquitetura já identificadas

- Necessidade de **isolamento adequado entre usuários e entidades** (quem
  vê o quê).
- Possibilidade futura de **controle de permissões** (perfis de acesso).
- Possível necessidade futura de multiempresa/multitenancy (ver
  `07-decisoes-pendentes.md` — ainda não confirmada).

## Status

Isto é apenas uma referência de ponto de partida. Nenhum schema, migration
ou regra de acesso foi criada nesta primeira execução.
