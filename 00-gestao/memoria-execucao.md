# Memória de execução

## Data
2026-08-18/19

## Contexto
Consolidação do MVP Betel para demonstração comercial controlada.
Escopo congelado pelo usuário: só o fluxo principal + onboarding básico
+ dados/roteiro de demo. Sem staging, sem produção, sem GRANT amplo a
`service_role`.

## Decisões importantes
- **GRANT a `service_role` nas 11 tabelas de negócio: REJEITADO.**
  Nunca executado contra o Supabase real. Migration removida do
  repositório antes de ser commitada. Decisão completa registrada em
  `00-gestao/riscos.md`.
- Escopo congelado: sem portal do cliente, integrações, tema escuro,
  CI completo, LGPD jurídica, produção/domínio nesta rodada.
- Gatilho de geração automática de tarefas mantido como está
  (fechamento de contrato, não criação de evento) — confirmado com o
  usuário.
- Próxima etapa técnica real (não produção): projeto Supabase separado
  para staging — ainda não criado, decisão em aberto.

## O que foi executado
- Onboarding admin reduzido de 10→6 passos, sócio mantido em 5.
- 2 bugs reais corrigidos: contagem de tarefas em `/checklists`
  (reescrita da query, embed aninhado do Supabase não funcionava) e
  navegação de volta da Agenda diária ("← Ver mês").
- Indicador de dev do Next.js reposicionado (colidia com "Sair").
- Menu reagrupado: Agenda/Checklists/Tarefas em "Acompanhamento".
- 43 testes unitários (Vitest) criados — validação e cálculo de
  progresso/atraso.
- Dados fictícios de demonstração criados e validados end-to-end no
  navegador (2 clientes, 1 sócia, 1 serviço com checklist de 2 tarefas,
  2 eventos, 1 contrato fechado + 1 rascunho).
- Documentação: `docs/dados-demo.md`, `docs/roteiro-demonstracao-cliente.md`,
  `docs/limites-da-demonstracao.md`, `00-gestao/matriz-prontidao-uso-real.md`,
  `00-gestao/relatorio-sessao-2026-08-18-19.md`.

## O que não foi executado
- Testes de integração/E2E automatizados (bloqueado — sem ambiente
  isolado; `service_role` não tem GRANT em produção, por decisão).
- Validação de migrations do zero (mesmo bloqueio).
- Backup formal, deploy/Vercel, domínio, LGPD — fora do escopo desta
  rodada.
- Re-execução do onboarding/fluxo principal no navegador nesta
  continuação — **não repetida por não haver mudança de código desde a
  última validação real** (evidência em
  `06-testes-evidencias/testes-manuais/onboarding-navegacao.md` e no
  fluxo de demo já documentado). Nenhum arquivo de onboarding ou das
  telas do fluxo principal foi alterado depois dessa validação.

## Testes realizados
- `npm run lint`: 0 erros/warnings.
- `npm run build`: limpo.
- `npm run test:unit` (script real; `npm test` não existe no
  `package.json`): 43/43 passando.
- `git diff --check`: sem problemas de whitespace.

## Estado do produto
```
PRONTO PARA DEMONSTRAÇÃO CONTROLADA
NÃO PRONTO PARA PILOTO
NÃO PRONTO PARA PRODUÇÃO
```

## Pendências prioritárias
1. Decidir sobre projeto Supabase separado para staging (desbloqueia
   testes de integração e migrations do zero).
2. Sócio deveria ver a Agenda além de "Minhas tarefas"? (aberto)
3. Escopo da integração via API (pedido novo, só registrado).
4. Remover dados fictícios antes de qualquer dado real de cliente.

## Próximo passo recomendado
Apresentar a demonstração ao cliente usando
`docs/roteiro-demonstracao-cliente.md`; só depois decidir sobre
staging.

---

## Sessão adicional (2026-08-19, madrugada) — tarefas seguras sem autorização

Usuário pediu para continuar só com tarefas seguras (sem permissão
necessária) enquanto dormia. Nada do escopo congelado foi expandido —
só correções de lacunas já identificadas em `04-analises/melhorias-ux.md`
e documentação pedida pelo próprio protocolo do projeto.

### O que foi executado
- `docs/learning/MISTAKES.md` e `docs/learning/LESSONS.md` criados
  (referenciados em `LEARNING.md`/`CLAUDE.md`, mas nunca existiam) —
  4 erros reais + 4 lições conceituais desta sessão.
- Drawer mobile da sidebar agora fecha com `Escape` (mesmo padrão do
  tour de onboarding). Foco ainda não é preso dentro do menu — não
  corrigido (precisa de teste real em viewport mobile).
- `loading.tsx`, `error.tsx`, `not-found.tsx` adicionados na raiz do
  app — nenhuma rota tinha isso antes, caía tudo na tela genérica do
  Next.js. Não testados no navegador (só lint/build).
- `04-analises/melhorias-ux.md` atualizado: itens 2, 3 e 4 marcados
  como corrigidos.
- Regressão completa após cada mudança: lint, build, 43 testes
  unitários — todos limpos o tempo todo.

### O que não foi feito (exige decisão/autorização do usuário)
- Criar projeto Supabase de staging.
- Decidir se sócio vê a Agenda.
- Desenhar/implementar integração via API.
- Breadcrumbs e título de página por rota — deixados como "melhoria
  futura" (baixa prioridade, risco de virar "melhoria cosmética
  extensa" fora do escopo congelado).
- Testar loading/error/not-found no navegador — precisa forçar erro/404
  de propósito, melhor numa sessão com o Codespace ativo e o usuário
  presente.

### Estado do Git ao final desta rodada
27 commits locais à frente de `origin/main`, working tree limpo, nenhum
push feito.

---

## Continuação (2026-08-19) — GRANT reconfirmado, API + staging autorizados

Usuário reconfirmou cancelamento do GRANT amplo em produção (nada
executado, arquivo `0008` nunca existiu commitado) e autorizou
explicitamente seguir com integração via API e staging, nessa ordem.

### O que foi executado
- **Integração via API v1** desenhada e implementada: chave por
  empresa (hash SHA-256), só leitura, `/api/v1/eventos` e
  `/api/v1/tarefas`. Migration proposta `0009_api_keys.sql`. Ver
  `04-analises/integracao-api.md`.
- **Projeto Supabase de staging criado** (`betel-company-staging`,
  mesma organização da produção, plano gratuito) após confirmação
  explícita do usuário — o classificador de segurança tinha bloqueado
  a criação até essa confirmação direta.
- **Schema completo aplicado do zero em staging**, via SQL Editor
  (schema, policies, grants, migrations 0002-0007, 0009 com GRANTs de
  `service_role` liberados só ali). 12 tabelas confirmadas. Isso
  também serve como a validação de "migrations do zero" (Fase 5).
- Achado técnico: digitação simulada no editor Monaco corrompe texto
  (autocomplete interfere); resolvido usando a API do Monaco
  (`window.monaco.editor.getEditors()[0].getModel().setValue(...)`)
  para setar o SQL diretamente, sem simular teclas — registrado em
  `docs/learning/MISTAKES.md`.

### O que não foi feito
- **Copiar as chaves de API do staging (anon + service_role) e testar
  os endpoints de ponta a ponta** — o classificador de segurança
  bloqueou minha leitura da página de chaves do Supabase (evita expor
  os valores no transcript da conversa). Só o usuário pode copiar essas
  duas chaves. Ver `04-analises/ambiente-staging.md`.

### Estado do Git ao final
30 commits locais à frente de `origin/main`, working tree limpo, nenhum
push feito.
