# Plano B de demonstração — tentativas e estado atual

> Contexto: durante uma demonstração ao vivo ao cliente (2026-08-19), o
> login travou por um incidente externo do Supabase Auth ("401 errors
> due to JWT rejections", ver `status.supabase.com`). Este documento
> registra o que foi tentado como contingência e o que existe hoje.

## Incidente original — resolvido

Confirmado normalizado em 2026-08-19: latência do endpoint de auth
caiu de 100+s para 0,4-0,5s consistente (3 medições seguidas). O
Supabase publicou que o fix foi implantado. Ver
`00-gestao/memoria-execucao.md` para o histórico completo do
diagnóstico.

## Tentativa 1 — Supabase local via Docker na máquina do usuário

Avaliado e descartado no momento da demo: Docker Desktop instalado mas
não rodando, primeira execução de `supabase start` levaria ~8-15min
baixando imagens. Não seria uma solução rápida o suficiente para uma
chamada ao vivo.

## Tentativa 2 — Supabase local via Docker no Codespace do projeto

**Não funcionou — bloqueado por falha real de infraestrutura, não por
configuração.**

- `.devcontainer/devcontainer.json` teve a feature
  `ghcr.io/devcontainers/features/docker-in-docker:2` adicionada.
- Testado em 2 codespaces diferentes, com rebuild simples, rebuild
  `--full` e recriação completa do zero (`gh codespace delete` +
  `create`) — em **todas** as tentativas, o build do container falhou
  de verdade: `docker buildx build` retornou erro `1302
  UnifiedContainersErrorFatalCreatingContainer`.
- Quando isso acontece, o GitHub Codespaces cai **silenciosamente**
  para um "container de recuperação" mínimo (Alpine, sem Node, sem
  npm, sem Docker) — o ambiente de desenvolvimento inteiro fica
  temporariamente inutilizável, não só o Docker.
- **Hipótese da causa:** a máquina do Codespace (`basicLinux32gb`, 2
  cores/8GB) provavelmente não suporta a virtualização aninhada
  (nested virtualization) que o `docker-in-docker` exige.
- **Ação tomada:** a feature foi **revertida** do
  `devcontainer.json` para restaurar um ambiente de desenvolvimento
  funcional. Confirmado: Node `v22.23.2`, npm `10.9.8`, `.env.local`
  intacto, `npm install` concluído sem erro (650 pacotes).

### Caminhos possíveis, ainda não tentados

1. Tentar de novo numa máquina maior (`standardLinux32gb`, 4
   cores/16GB) — pode ter mais chance de suportar a virtualização
   necessária, mas não há garantia, e pode não estar coberta pelo
   plano gratuito de Codespaces da conta.
2. Tentar habilitar via "Rebuild Container" pela interface web do
   GitHub Codespaces ou pelo VS Code, em vez da CLI `gh` — pode dar
   uma mensagem de erro mais específica sobre a causa real da falha
   de `buildx`.
3. Desistir do Docker local/Codespace como plano B e usar só o
   ambiente de staging (`betel-company-staging`, já criado e saudável
   — ver `04-analises/ambiente-staging.md`) como alternativa de teste
   sempre que a produção estiver instável.

## Estado atual — o que existe de fato como contingência

- **Ambiente de staging** (`betel-company-staging`): projeto Supabase
  separado, schema completo aplicado, saudável e testado
  independentemente da produção (confirmado respondendo em 0,35s
  mesmo durante o incidente de produção). É a contingência real
  disponível hoje — não para mostrar ao cliente (não tem os dados de
  demonstração), mas para continuar testando/desenvolvendo sem
  depender da produção.
- **Supabase local (Docker)**: não disponível. Ver seção acima.

## Recomendação

Não prometer "ambiente local pronto" como plano B até uma das opções
1-3 acima ser resolvida. Para a próxima demonstração ao cliente,
depender da produção normalizada é aceitável (o incidente foi raro e
já resolvido), mas vale ter um roteiro de fallback verbal combinado
com o cliente (ex.: "instabilidade pontual de infraestrutura,
remarcamos essa parte") — já usado com sucesso durante o incidente
real.
