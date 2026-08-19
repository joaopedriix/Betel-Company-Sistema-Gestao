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

### Tentativa 3 — máquina maior (2026-08-19, mesmo dia)

Testado o caminho 1 acima: Codespace atualizado de `basicLinux32gb`
(2 cores/8GB) para `standardLinux32gb` (4 cores/16GB) via
`gh codespace edit -m standardLinux32gb`, depois nova tentativa de
`docker-in-docker` com rebuild `--full`.

**Resultado: falhou com o erro exatamente idêntico** —
`docker buildx build` → `Error code: 1302
(UnifiedContainersErrorFatalCreatingContainer)`. Mesmo comando, mesma
mensagem, byte a byte. Isso descarta a hipótese de nested
virtualization/tamanho de máquina como causa: o problema está em como
o `docker buildx` roda na infraestrutura de build de features do
Codespaces para esta conta/ambiente, não no hardware da VM. O log de
criação não expõe o stderr real do `buildx` (só o "Command failed"
genérico), então a causa exata de fundo permanece desconhecida sem
acesso a logs mais profundos da plataforma Codespaces (fora do nosso
alcance).

Revertido de novo (`.devcontainer/devcontainer.json` sem a feature),
ambiente restaurado e confirmado funcional (Node `v22.23.2`, npm
`10.9.8`, `.env.local` intacto).

## Conclusão — Docker local/Codespace descartado

**Docker como plano B de demonstração não é viável neste ambiente,
com as ferramentas disponíveis hoje.** Duas tentativas completas
(máquina padrão e máquina maior) falharam com erro idêntico de
infraestrutura (`1302`), não relacionado a configuração do projeto.
Não tentar de novo sem uma pista nova (ex.: suporte do GitHub
confirmando causa, ou tentativa manual pela interface web/VS Code que
exponha um erro mais específico — caminho 2 abaixo, ainda não
testado e de baixa prioridade).

### Caminho ainda não tentado (baixa prioridade)

Habilitar via "Rebuild Container" pela interface web do GitHub
Codespaces ou pelo VS Code, em vez da CLI `gh` — pode (ou não) dar uma
mensagem de erro mais específica sobre a causa real da falha de
`buildx`. Não é uma prioridade dado que já são 2 tentativas
fracassadas por uma causa que parece ser de plataforma, não de
configuração.

## Estado atual — o que existe de fato como contingência

**Staging (`betel-company-staging`) é o ambiente de teste principal e
único disponível hoje** — saudável, independente da produção, testado
e funcionando. Não usar Docker/Supabase local como dependência de
nenhum fluxo até uma decisão nova.

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
