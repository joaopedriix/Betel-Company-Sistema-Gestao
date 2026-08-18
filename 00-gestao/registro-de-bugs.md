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
