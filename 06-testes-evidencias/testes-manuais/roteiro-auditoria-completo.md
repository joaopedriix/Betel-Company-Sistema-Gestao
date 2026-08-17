# Roteiro de teste manual — Auditoria completa do MVP

> Índice consolidado pedido na auditoria de 2026-08-17. Não duplica o que
> já existe — só referencia e completa as lacunas.

## Onde cada item já está coberto

| Item pedido | Onde está |
|---|---|
| Login | `06-testes-evidencias/testes-manuais/autenticacao.md` (executado — ver resultado) |
| Cadastro de serviço | CA-01 em `roteiro-criterios-aceite-mvp.md` |
| Criação do modelo de checklist | CA-02 |
| Criação de tarefas padrão | CA-03 |
| Criação de contrato | CA-04 |
| Fechamento do contrato | CA-05 |
| Geração das tarefas | CA-06, CA-07 |
| Acesso do sócio (isolamento) | CA-08 |
| Conclusão de tarefa | CA-09, CA-10 |
| Progresso | CA-13 |
| Reabertura | CA-15 |
| Histórico | CA-12 |
| Tentativa de acesso indevido | CA-16 |
| Modelo original inalterado | CA-17 |

## Lacunas — cenários que faltavam

### Cadastro de cliente

- **Cenário:** Administrador/Gestor cadastra um novo cliente.
- **Pré-condições:** Logado como gestor.
- **Passos:** 1) Ir em `/clientes`. 2) Criar cliente (nome, email, telefone).
  3) Salvar.
- **Resultado esperado:** Cliente criado e listado.
- **Resultado obtido:** Não executado — tela é um stub "Em construção",
  cadastro de cliente ainda não implementado.
- **Status:** Bloqueado (funcionalidade ausente)

### Cadastro de sócio/usuário

- **Cenário:** Administrador/Gestor cadastra um novo sócio, vinculado a
  uma conta de login (Supabase Auth) com `perfil='socio'`.
- **Pré-condições:** Logado como gestor.
- **Passos:** 1) Ir em `/usuarios`. 2) Criar sócio (nome, email, perfil).
  3) Salvar.
- **Resultado esperado:** Conta criada em `auth.users` + linha em
  `public.usuario` com o perfil correto.
- **Resultado obtido:** Não executado — tela é um stub "Em construção",
  cadastro de usuário/sócio ainda não implementado (o único usuário
  existente hoje foi criado manualmente pelo painel do Supabase, não pela
  aplicação).
- **Status:** Bloqueado (funcionalidade ausente)

## Nota sobre os demais cenários (CA-01 a CA-17)

Todos ainda em "Não executado ainda" — dependem das funcionalidades
listadas na seção 5 de `04-analises/auditoria-mvp.md`, nenhuma
implementada ainda. Não reexecutar/reescrever esses cenários aqui; ver o
arquivo original.
