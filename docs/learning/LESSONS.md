# Lições reutilizáveis

> Conceitos explicados de um jeito que vale reaproveitar depois — não
> um erro específico (isso vai em `MISTAKES.md`), mas uma forma de
> pensar sobre o sistema. Ver protocolo em `CLAUDE.md`.

## Testar depois de recarregar a página prova persistência, não só UI

Estado de componente React (`useState`) vive só na memória daquela aba
aberta. Clicar em algo e ver a tela mudar prova que o JavaScript sabe
esconder/mostrar um componente — não prova que um dado foi salvo no
banco. Isso valeria mesmo se a chamada ao servidor tivesse falhado
silenciosamente.

Um **reload de verdade** força o caminho completo de novo: o servidor
lê o banco (não confia em nada que já estava na tela) pra decidir o
que renderizar. Se o resultado depois do reload bate com o que se
espera após a ação, é evidência real de que o dado foi persistido — não
só escondido na tela.

Onde isso apareceu: validação do onboarding (o tour não reabrir sozinho
depois de "concluído" + reload prova que `onboarding_concluido` foi
gravado no banco, não só que o React escondeu o card).

## RLS e GRANT são duas camadas diferentes do Postgres

RLS (Row Level Security) decide **quais linhas** um usuário pode
ver/alterar — é a política de negócio ("sócio só vê a própria
tarefa"). GRANT decide se um **role do Postgres** pode sequer tentar a
operação na **tabela inteira** — é anterior e independente da RLS. Sem
o GRANT certo, toda query falha com "permission denied", mesmo que a
policy de RLS estivesse perfeita.

`service_role` do Supabase **ignora RLS por design** (é a chave
"confiada"), mas isso não significa que ela tem GRANT em tudo — GRANT
ainda precisa ser concedido explicitamente, tabela por tabela, role por
role. As duas camadas se complementam, não se substituem.

## Server Actions + middleware: toda requisição protegida passa por validação de sessão

No padrão `@supabase/ssr` usado no projeto, o `middleware.ts` roda em
**toda** requisição pra rota protegida — inclusive o POST que executa
uma Server Action, e inclusive o GET seguinte que seu `redirect()`
dispara. Cada uma dessas passagens chama `getUser()`, que valida (e, se
necessário, renova) a sessão contra o servidor de Auth. Isso é o que
faz o RLS funcionar de verdade no servidor (nunca confiar só no cookie)
— mas também significa que qualquer coisa que invalide a sessão nesse
meio-tempo (ex.: logout disparado por engano, token expirado) aparece
como "voltei pro login" sem nenhuma mensagem de erro clara.

## Modo dev do Next.js não mede a velocidade real

`next dev` com Turbopack compila cada rota **na primeira visita**
daquela sessão de desenvolvimento — por isso a primeira carga de uma
página pode levar segundos, enquanto builds de produção já vêm
pré-compilados. Rodar num ambiente com disco mais lento (como o
Codespace usado aqui, que o próprio Next.js avisou no log) agrava
isso ainda mais. Nunca julgar a performance real do produto observando
`next dev` num ambiente de desenvolvimento.
