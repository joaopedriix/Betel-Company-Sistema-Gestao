# Registro de bugs

> Um bloco por fase, mais recente primeiro. Fases anteriores (cadastros
> base, multitenant) já tiveram seus bugs registrados em
> `04-analises/testes-isolamento-tenant.md` e no changelog — não duplicado
> aqui.

## Fase — Contratos, Eventos, Checklist automático, Tarefas, Dashboard (2026-08-18)

**Nenhum bug de aplicação foi encontrado nesta fase** (diferente das fases
anteriores, que acharam bugs reais de RLS/trigger só ao rodar dados de
verdade). O fluxo E2E completo (login → cadastros → checklist → evento →
contrato → fechamento → geração automática → conclusão de tarefa →
progresso → dashboard) funcionou de ponta a ponta na primeira tentativa
funcional, incluindo o teste de idempotência da geração de tarefas e o
bloqueio de reabertura pelo trigger `fn_tarefa_evento_guard` (já existente
desde a Fase 4, não uma correção desta fase).

### Ajuste de configuração (não é bug de comportamento)

- **O quê:** `eslint.config.mjs` não tinha `argsIgnorePattern`/`varsIgnorePattern`
  configurado para `@typescript-eslint/no-unused-vars`. A regra padrão só
  ignora parâmetros não usados que vêm *antes* do último parâmetro usado
  ("after-used") — funcionava por acaso nos cadastros anteriores porque o
  parâmetro não usado (`_prevState`) sempre vinha primeiro. Em
  `fecharContrato(contratoId, _prevState, _formData)`, `_formData` é o
  último parâmetro e não é usado, então a regra padrão o sinalizava mesmo
  com o prefixo `_`.
- **Correção:** adicionado `argsIgnorePattern: "^_"` explícito à config.
  `npm run lint` volta a 0 warnings.
- **Arquivo:** `03-projeto-betel/eslint.config.mjs`.

## Gate final de validação antes do push (2026-08-18)

Reexecução completa da suíte de isolamento (não por inferência) + testes
adicionais pedidos no gate. Nenhum bug de aplicação novo — um risco já
suspeitado foi **confirmado experimentalmente** (deixa de ser hipótese):

- **R10 — Contrato fechado editável via API direta.** Já estava
  documentado como "imutabilidade só na aplicação" (suposição, baseada
  em leitura de código). Neste gate, testado de verdade: `DELETE` em
  `contrato_servico` e `PATCH status→'rascunho'` via API REST, com JWT de
  admin, funcionaram (HTTP 204/200) mesmo com o contrato já `fechado`.
  Pela interface/Server Actions da aplicação continua bloqueado
  corretamente. Detalhe completo e mitigação recomendada em
  `00-gestao/riscos.md` (R10). Não corrigido nesta fase — fora do escopo
  do gate ("não faça uma mudança estrutural grande nesta etapa").
- **T14 (sócio tenta ler `tarefa_padrao`/`checklist_modelo`)** — estava
  marcado como "não executado" (só revisão estática). Executado de
  verdade neste gate: `HTTP 200`, `0 linhas` nas duas tabelas. Confirma
  o comportamento esperado.
- **27 testes de isolamento** — reexecutados de verdade com fixture nova
  (5 contas criadas, seed rodado, 6 logins reais, requisições reais via
  API). Resultado: **29/29** (os 27 casos originais + os 2 checks extras
  do T14 desta fase). Nenhuma falha. Fixture removida ao final (5 contas
  Auth deletadas, `Empresa B — Teste` e registros extras na Betel
  apagados, validado que só o admin real restou).
- **Concorrência real** de `fechar_contrato()` (2 chamadas HTTP paralelas
  no mesmo contrato) testada de verdade: ambas retornaram sucesso, sem
  erro e sem duplicar tarefa.

## Correção de segurança pós-gate (2026-08-18)

Auditoria de segurança pedida pelo usuário antes de preparar o MVP para
uso real. Cruzou o parecer de segurança original (`00-gestao/riscos.md`,
Fase 4, anterior à implementação) com o estado real do banco (triggers,
grants, foreign keys) — não confiou cegamente no documento antigo.

- **R10 corrigido:** migration `0005_contrato_fechado_immutable.sql`
  aplicada contra o Supabase real (autorização explícita do usuário via
  pergunta direta antes de tocar produção). Dois triggers de guarda
  (`fn_contrato_fechado_immutable`, `fn_contrato_servico_fechado_immutable`)
  bloqueiam UPDATE/DELETE em contrato/contrato_servico quando o contrato
  já está fechado. Testado com fixture 100% transacional — cria dados
  fictícios, roda 6 cenários (rascunho editável, fechamento permitido,
  reabertura bloqueada, delete de contrato bloqueado, delete/update de
  contrato_servico bloqueados), `ROLLBACK` no final. Confirmado
  diretamente no banco que zero dados de teste ficaram (`0/0/0/0`).
  Teste de fumaça em `/contratos` sem regressão.
- **R5/R6 descobertos já mitigados:** o trigger `fn_tarefa_evento_guard`
  já existia e cobre exatamente os dois riscos (sócio alterar campos
  sensíveis, reabrir tarefa concluída) — o documento de riscos nunca
  tinha sido atualizado para refletir isso.
- **R8 descoberto como não sendo mais um problema:** a FK real usa
  `ON DELETE RESTRICT` em `historico_tarefa`, não `CASCADE` como o
  parecer original temia.
- **R7 corrigido:** `anon` tinha GRANT residual de `TRUNCATE`/`TRIGGER`/
  `REFERENCES` (nunca `SELECT`/`INSERT`/`UPDATE`/`DELETE`) em todas as
  11 tabelas de negócio. Migration `0006_revoke_anon_residual_grants.sql`
  aplicada contra o Supabase real (autorização explícita do usuário).
  Validado: zero grants residuais para `anon` após o REVOKE. Teste de
  fumaça no dashboard sem regressão.
- **R9 confirmado, correção adiada:** `cliente.usuario_id` sem
  constraint cross-tenant, mas o campo não é usado por nenhuma tela
  ainda (`portal-cliente` é stub). Corrigir agora seria especulativo.
