# Integração via API — desenho e decisões

> Pedido do usuário em 2026-08-18 (registrado em `00-gestao/pendencias.md`),
> autorizado para desenvolvimento em 2026-08-19. Escopo **v1: só
> leitura**, pensado pra ser pequeno o suficiente pra revisar e seguro
> o suficiente pra não precisar tocar produção antes de ser validado
> em staging.

## Decisões tomadas (v1)

- **Autenticação:** chave de API por empresa (tenant), não OAuth — mais
  simples de emitir/revogar, e o produto já é multiempresa por design.
  Enviada como `Authorization: Bearer <chave>`.
- **Armazenamento da chave:** só o hash (SHA-256) fica no banco, nunca
  o valor em texto puro — mesmo padrão de "mostrar uma vez só" já usado
  pra senha temporária de novo usuário.
- **Escopo:** **somente leitura** nesta v1. Escrita via API fica de
  fora de propósito — evita contornar regras de negócio importantes
  (ex.: fechamento de contrato tem lógica de geração de tarefas que não
  faz sentido replicar num endpoint de escrita ainda).
- **Recursos expostos:** `eventos` e `tarefas` (via `tarefa_evento`),
  os dois mais prováveis de interessar a uma integração externa
  (ex.: sincronizar agenda). `clientes`/`contratos` ficam de fora da v1
  — mais sensíveis, endereçar depois se houver demanda real.
- **Versionamento:** prefixo `/api/v1/...` desde o início.
- **Origem do `empresa_id`:** sempre resolvido a partir da chave de API
  validada no servidor — nunca de parâmetro de URL/body (mesma regra
  já aplicada em todas as Server Actions do projeto).

## Como a autorização funciona (evita repetir o risco R2)

O código do endpoint roda com `service_role` (necessário — não há
usuário logado nem JWT de sessão numa chamada de API externa), mas:

1. A chave é validada primeiro; se inválida, `401` antes de tocar
   qualquer tabela de negócio.
2. O `empresa_id` vem da linha da chave validada, nunca do request.
3. Toda query filtra explicitamente por esse `empresa_id` — o mesmo
   padrão que R2 exige para Server Actions, adaptado pra um contexto
   sem sessão de usuário.

## Bloqueio conhecido: `service_role` sem GRANT em produção

Como já documentado em `00-gestao/riscos.md`, `service_role` não tem
nenhum privilégio PostgREST em nenhuma tabela de negócio em produção
— por decisão explícita do usuário, essa alteração de GRANT em
produção foi rejeitada quando proposta pra viabilizar testes.

**Esta é uma proposta diferente e bem mais estreita**: só `SELECT`,
só em `evento` e `tarefa_evento` (as 2 tabelas que a v1 da API expõe),
não as 11 tabelas de negócio inteiras com escrita. Mesmo assim,
**não será aplicada em produção nesta sessão** — fica registrada como
decisão pendente (ver `00-gestao/pendencias.md`). A implementação e os
testes desta API vão rodar contra o ambiente de staging (a ser criado
em seguida), onde um GRANT amplo já é seguro por não haver dado real.

## O que falta decidir (produto, não técnico)

- Rate limiting — nenhum implementado ainda; precisa de decisão sobre
  infraestrutura (ex.: Upstash Redis) antes de produção.
- Quem emite/revoga chaves de API — hoje o código assume que só admin
  pode (mesma regra de perfil das outras telas), mas não há tela de
  gestão de chaves ainda, só a tabela e os endpoints de leitura.
- Preço/plano associado ao acesso via API (fora do escopo técnico).

## Validado em staging (2026-08-19)

Testado de ponta a ponta contra `betel-company-staging` (chave e
dados fictícios, removidos após o teste):

- `GET /api/v1/eventos` sem `Authorization` → `401` `{"error":"Chave de
  API inválida ou ausente."}`
- `GET /api/v1/eventos` com chave válida → `200`, retorna só os eventos
  da empresa dona da chave
- `GET /api/v1/tarefas` com chave válida → `200`, lista vazia (sem
  tarefas cadastradas ainda no fixture de teste)

## Estrutura implementada

- `03-projeto-betel/database/proposals/0009_api_keys.sql` — migration
  proposta (**não aplicada** em produção nem em staging ainda).
- `src/lib/api/auth.ts` — validação da chave e resolução do `empresa_id`.
- `src/app/api/v1/eventos/route.ts` — `GET`, lista eventos da empresa.
- `src/app/api/v1/tarefas/route.ts` — `GET`, lista tarefas (campos
  não-sensíveis: nome, prazo, status, evento; sem observações internas).
