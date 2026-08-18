# Limites da demonstração

> O que **não** prometer nem assumir como resolvido ao apresentar o
> sistema, mesmo que o roteiro funcione de ponta a ponta.

## Ambiente

- **Não existe ambiente de staging nem produção.** A demonstração roda
  num Codespace de desenvolvimento (URL temporária, cai quando o
  Codespace é pausado). Nunca foi publicado na Vercel.
- **Sem domínio definitivo.**
- Modo de desenvolvimento (`next dev`) é mais lento que produção —
  cada rota compila na primeira visita nesta sessão (o Codespace tem
  disco mais lento que o normal, o próprio Next.js avisou isso no log).
  Isso **não** reflete a velocidade real que o cliente teria em
  produção (build otimizado, sem recompilação).

## Segurança e dados

- Os dados usados na demonstração são **fictícios**, criados no mesmo
  banco da Betel (não há tenant de demonstração separado) — precisam
  ser removidos antes de qualquer cliente real usar o sistema (ver
  `docs/dados-demo.md`).
- R10 (contrato fechado editável via API direta) já foi corrigido via
  trigger de banco. R7 (grants residuais de `anon`) também corrigido.
  R8 não era um problema real. R9 confirmado, mas de impacto zero hoje
  (feature que usaria o campo não existe ainda).
- **Não há testes de integração ou E2E automatizados** cobrindo RLS/
  isolamento entre contas — a suíte automatizada hoje é só unitária
  (43 testes de validação e cálculo). A validação de isolamento entre
  usuários foi manual, numa sessão anterior (27/29 casos aprovados,
  ver `04-analises/testes-isolamento-tenant.md`), não repetível
  automaticamente.

## Funcionalidades que não existem ainda

- **Portal do cliente** — tela stub ("Em Construção"), sem
  funcionalidade real.
- **Integração via API** — pedido pelo usuário nesta sessão, ainda sem
  desenho nem implementação (registrado em `00-gestao/pendencias.md`).
- **Tema escuro** — as variáveis CSS existem (gerado pelo scaffold do
  shadcn/ui), mas **não há nenhum botão ou mecanismo para ativá-lo** —
  não reage nem à preferência do sistema operacional. Se perguntarem,
  a resposta é "ainda não foi implementado", não "tem bug".
- Backups formais, política de LGPD, regras financeiras/cobrança: nada
  disso foi endereçado (ver `00-gestao/status-atual.md`).
- Zero monitoramento/observabilidade em produção (não existe produção
  ainda).

## Achados durante esta sessão (transparência)

Ao validar o fluxo ao vivo com dados reais de demonstração, dois bugs
reais foram encontrados e corrigidos na hora:
- `/checklists` não mostrava a contagem certa de tarefas (consulta
  aninhada do Supabase que não funcionava corretamente — reescrita).
- Navegar para um dia específico na Agenda não tinha um jeito óbvio de
  voltar ao mês (link adicionado).

Isso é normal em qualquer sistema em desenvolvimento ativo — mas é
honesto dizer que **outros bugs semelhantes, ainda não encontrados,
provavelmente existem**, já que a cobertura de testes automatizados
ainda é baixa (só unitária). Não declarar o sistema "sem bugs" com base
nesta demonstração.

## Classificação

Ver `00-gestao/matriz-prontidao-uso-real.md` (a ser criado) para a
classificação formal. Resumo: **pronto para demonstração controlada**,
**não pronto para piloto** (faltam testes automatizados de integração,
backup, ambiente real), **não pronto para produção** (faltam deploy,
domínio, LGPD, dados de teste limpos).
