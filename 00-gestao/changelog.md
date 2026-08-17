# Changelog

## 2026-08-16

**Alteração:** Setup inicial do projeto Betel Company
**Arquivos:** README.md, docs/, src/, public/, tests/, .devcontainer/, .gitignore
**Motivo:** Criação do repositório e estrutura inicial
**Resultado dos testes:** Não aplicável (sem código)

**Alteração:** docs: modelo de dados conceitual do módulo Checklists
**Arquivos:** docs/04-checklists-e-rotinas-operacionais.md
**Motivo:** Registrar modelo de dados conceitual levantado com o cliente
**Resultado dos testes:** Não aplicável (documentação)

**Alteração:** docs: transcreve checklist mestre Conferência Final
**Arquivos:** docs/04-checklists-e-rotinas-operacionais.md
**Motivo:** Registrar checklist real fornecido pelo cliente
**Resultado dos testes:** Não aplicável (documentação)

**Alteração:** docs: detalha módulo Checklists como prioridade
**Arquivos:** docs/03-modulos-e-fluxos-do-sistema.md
**Motivo:** Registrar prioridade definida pelo cliente
**Resultado dos testes:** Não aplicável (documentação)

## 2026-08-17

**Alteração:** Reorganização da estrutura de pastas para o padrão oficial
(00-gestao, 01-documentacao, 02-original-cliente, 03-projeto-betel,
04-analises, 05-prompts, 06-testes-evidencias, 07-backups,
08-arquivos-temporarios), conforme `05-prompts/00-organizacao-geral-do-projeto.md`
**Arquivos:** docs/* movidos para 01-documentacao/* e 00-gestao/pendencias.md;
src/, public/, tests/ movidos para dentro de 03-projeto-betel/; criação dos
arquivos de gestão (status-atual.md, escopo-do-projeto.md,
decisoes-tecnicas.md, riscos.md, changelog.md); cópia do prompt-mestre para
05-prompts/00-organizacao-geral-do-projeto.md
**Motivo:** Alinhar o projeto ao método de organização solicitado pelo usuário
**Resultado dos testes:** Não aplicável (reorganização de arquivos, sem código)

**Alteração:** Fase 2 concluída (definição do escopo do MVP) a partir de
especificação fornecida pelo usuário; Fase 3 (planejamento técnico)
registrada como proposta
**Arquivos:** `01-documentacao/requisitos/mvp.md`,
`01-documentacao/requisitos/backlog.md`,
`01-documentacao/perfis-de-usuario/perfis-iniciais.md`,
`01-documentacao/regras-de-negocio/regras-iniciais.md`,
`01-documentacao/fluxos-do-sistema/fluxos-iniciais.md`,
`00-gestao/decisoes-tecnicas.md`, `00-gestao/escopo-do-projeto.md`,
`00-gestao/pendencias.md` (itens resolvidos marcados), `00-gestao/status-atual.md`
**Motivo:** Organizar a especificação de MVP recebida nos locais corretos
da estrutura do projeto e propor o planejamento técnico antes de
implementar qualquer código
**Resultado dos testes:** Não aplicável (documentação/planejamento, sem código)

**Alteração:** Time SaaS (architect, devops, qa, security) executado em
paralelo: schema SQL + RLS, scaffold Next.js, estratégia de testes,
parecer de segurança; 2 correções aplicadas no schema após o parecer
(FORCE ROW LEVEL SECURITY, e FK de historico_tarefa de CASCADE para
RESTRICT)
**Arquivos:** `03-projeto-betel/database/schema.sql`,
`03-projeto-betel/database/policies.sql`, `03-projeto-betel/` (scaffold
Next.js completo — ver README do projeto), `06-testes-evidencias/relatorios/estrategia-de-testes.md`,
`06-testes-evidencias/testes-manuais/roteiro-criterios-aceite-mvp.md`,
`00-gestao/riscos.md`
**Motivo:** Preparar banco, ambiente e plano de testes antes da primeira
funcionalidade de código (Fase 5), com revisão de segurança prévia
**Resultado dos testes:** `npm run build` do scaffold Next.js passou (13
rotas, TypeScript OK). Schema/RLS ainda não aplicados em banco real —
teste de integração fica para a Fase 5/6.

**Alteração:** Criado o projeto Supabase real (`betel-company`, São Paulo)
e aplicado schema + RLS; criado usuário admin de teste; implementada e
testada a autenticação (login/logout, proteção de rota por perfil)
**Arquivos:** `03-projeto-betel/database/grants.sql` (novo),
`03-projeto-betel/src/middleware.ts`, `src/lib/supabase/middleware.ts`,
`src/lib/auth/rotas.ts`, `src/app/login/actions.ts`, `src/app/login/page.tsx`,
`src/components/logout-button.tsx`, `03-projeto-betel/README.md`,
`03-projeto-betel/.env.local` (não versionado)
**Motivo:** Validar de ponta a ponta a fundação de autenticação antes de
implementar cadastros, conforme regra do projeto de não declarar algo
pronto sem testar de verdade
**Bug encontrado e corrigido:** login autenticava no Supabase Auth mas
retornava "Conta sem acesso habilitado" mesmo com o usuário correto em
`public.usuario`. Causa: RLS decide quais *linhas* um usuário vê, mas o
Postgres exige `GRANT SELECT/INSERT/UPDATE/DELETE` na *tabela* para o role
`authenticated` separadamente — isso não foi criado automaticamente porque
o projeto Supabase foi criado com "Automatically expose new tables"
desligado (decisão de segurança). Corrigido aplicando
`03-projeto-betel/database/grants.sql` (grants mínimos, `historico_tarefa`
só com SELECT).
**Resultado dos testes:** Login testado de ponta a ponta no navegador
(`npm run dev` + Supabase real): autenticação, leitura do perfil via RLS,
e redirecionamento para `/dashboard` como admin — sucesso.
