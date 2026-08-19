# Erros e aprendizados

> Um bloco por erro real encontrado — não todo erro pequeno, só os que
> deixam uma lição reaproveitável. Ver protocolo em `CLAUDE.md`.

## Consulta aninhada do Supabase não retorna contagem certa (2026-08-19)

**O quê:** `/checklists` usava
`servico(checklist_modelo(tarefa_padrao(count)))` — um embed de dois
níveis com agregação. Mostrava "Nenhuma tarefa" mesmo com tarefas
cadastradas de verdade.

**Por que enganou:** parecia um problema de cache (`revalidatePath`
faltando nas Server Actions — isso também era verdade e foi corrigido
junto), mas o bug persistiu mesmo depois de reiniciar o servidor do
zero com cache limpo. Só ficou claro que era a própria consulta quando
comparei com `servicos/[id]/page.tsx`, que busca a mesma informação
com duas consultas separadas (`checklist_modelo` e depois
`tarefa_padrao` filtrando por `checklist_modelo_id`) — e essa sempre
funcionou.

**Lição:** embeds aninhados com agregação (`tabela(sub(count))`) no
PostgREST/Supabase merecem desconfiança extra — teste comparando com
uma versão em duas consultas antes de confiar no resultado. Se o app já
tem um padrão comprovado pra buscar o mesmo dado, é mais barato copiar
esse padrão do que confiar num embed novo.

## `service_role` sem nenhum GRANT em nenhuma tabela de negócio (2026-08-18)

**O quê:** tentativa de usar `service_role` para criar/apagar uma linha
de teste em `usuario` falhou com "permission denied for table usuario"
— não é erro de RLS (que devolveria silêncio, zero linhas), é erro de
GRANT do Postgres, anterior à RLS. Testado depois em todas as 11
tabelas de negócio: todas recusam `service_role`.

**Por que aconteceu:** `grants.sql` do projeto só concede privilégios
pra `authenticated` — nunca precisou conceder nada pra `service_role`
porque o único uso real dela no código é a Auth Admin API
(`auth.admin.createUser`/`deleteUser`), que não passa pelo PostgREST.

**Lição:** "confiei que `service_role` ignora tudo" é uma suposição
perigosa — ela ignora RLS por design, mas GRANT de tabela é uma camada
Postgres separada, e nada garante que existe só porque a chave é
"privilegiada". Vale testar na prática, não assumir.

## Selecionar `button[type=submit]` sem escopo pega o botão errado (2026-08-19)

**O quê:** um script de automação de navegador usava
`document.querySelector('button[type=submit]')` pra clicar em "salvar"
num formulário de cadastro. Como a barra lateral (que tem o botão
"Sair", também `type="submit"`) é renderizada **antes** do conteúdo da
página no HTML, o seletor genérico sempre pegava "Sair" primeiro —
deslogando a cada tentativa, em vez de salvar o formulário.

**Por que enganou:** o sintoma (sessão caindo a cada submit) parecia um
bug de autenticação/CSRF/cache — várias hipóteses erradas foram
investigadas (Origin do proxy do Codespace, manifesto de Server Action
desatualizado por hot-reload, corrida de refresh token entre abas)
antes de olhar o log do servidor e ver que a função executada era
`signOut()`, não a esperada.

**Lição:** ao automatizar cliques em página com múltiplos formulários
(ex.: sidebar + conteúdo), sempre escopar o seletor ao formulário
específico (`campo.closest('form').querySelector(...)`), nunca
`document.querySelector` genérico. E: quando um sintoma parece "grande
demais" (perda de sessão a cada ação), checar o log do servidor **antes**
de investigar hipóteses de infraestrutura — ele mostra exatamente qual
função rodou.

## Páginas novas não seguiam o padrão de tratamento de erro já estabelecido (2026-08-19)

**O quê:** `dashboard/page.tsx`, `/tarefas` e `/minhas-tarefas` não
verificavam o `error` retornado pela query Supabase — uma falha de
rede apareceria como "0"/lista vazia, indistinguível de "não há dados
de verdade". As páginas mais antigas (`clientes`, `contratos`,
`eventos`, `servicos`) já tratavam isso corretamente.

**Lição:** quando o projeto já tem um padrão comprovado (aqui:
`{error ? <aviso> : ...}` com `role="alert"`), páginas novas devem
copiá-lo por padrão — a inconsistência só apareceu porque ninguém
comparou a página nova com as antigas antes de considerar "pronta".
