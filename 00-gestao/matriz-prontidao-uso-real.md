# Matriz de prontidão — uso real

> Escopo desta rodada: preparação para **demonstração comercial**
> (congelado pelo usuário em 2026-08-18/19). Não confundir com "pronto
> para produção" — ver `docs/limites-da-demonstracao.md`.

| Categoria | Status | Evidência | Risco | Próxima ação |
|---|---|---|---|---|
| Fluxo principal (cliente→checklist→evento→contrato→fechamento→tarefas→progresso→dashboard) | APROVADO | Validado ao vivo com dados fictícios em 2026-08-19; ver `docs/dados-demo.md` | Baixo | — |
| Onboarding/tips por perfil | APROVADO | Admin (6 passos) e sócio (5 passos) validados no navegador | Baixo | — |
| Navegação (agrupamento, Ver mês, indicador dev reposicionado) | APROVADO | Correções aplicadas e validadas ao vivo | Baixo | Mobile real/zoom/teclado ainda não testados |
| Segurança — R10, R7 | APROVADO | Triggers/grants aplicados e testados contra produção | Baixo | — |
| Segurança — R8, R9 | APROVADO COM RISCO DOCUMENTADO | R8 não é problema real; R9 confirmado, impacto zero hoje | Baixo | Corrigir R9 quando portal do cliente existir |
| Testes automatizados — unitário | APROVADO | 43 testes Vitest passando | — | — |
| Testes automatizados — integração/E2E | BLOQUEADO | — | Médio | Depende de decisão sobre ambiente de staging (usuário optou por não ampliar GRANT em produção) |
| Migrations validadas do zero | NÃO VALIDADO | — | Médio | Mesmo bloqueio acima |
| Backup/recuperação | NÃO VALIDADO | Sem documentação nem rotina definida | Alto (antes de dado real) | Documentar antes do go-live |
| Deploy/staging (Vercel) | NÃO APLICÁVEL nesta rodada | Fora do escopo congelado | — | Retomar quando produção for autorizada |
| Domínio | NÃO APLICÁVEL nesta rodada | Decisão de produto pendente | — | — |
| Dados de demonstração | APROVADO | Criados e validados; ver `docs/dados-demo.md` | — | Remover antes de dado real |
| Material de apresentação | APROVADO | `docs/roteiro-demonstracao-cliente.md` | — | — |
| LGPD | NÃO APLICÁVEL nesta rodada | Fora do escopo congelado (auditoria jurídica) | — | Endereçar antes de dado real de cliente |
| Lint/build | APROVADO | 0 erros/warnings, build de produção limpo | — | — |
| Integração via API | EM ANDAMENTO | Requisito novo, só registrado | — | Definir escopo com o usuário |

## Classificação final

**PRONTO PARA DEMONSTRAÇÃO CONTROLADA.**

Não pronto para piloto (faltam testes de integração automatizados,
backup, ambiente isolado de teste) nem para produção (faltam deploy,
domínio, LGPD, remoção de dados fictícios, decisão sobre integração via
API).
