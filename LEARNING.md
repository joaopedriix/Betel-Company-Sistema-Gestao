# Learning State — Betel Company

> Estado do aprendizado do usuário construindo o sistema de gestão.
> Atualizado ao final de tarefas, só com evidência real (resposta do
> usuário à pergunta de verificação) — nunca porque o código já existe.
> Ver protocolo completo em `CLAUDE.md`.

## Perfil de aprendizagem

- **Objetivo**: entender o que está sendo construído, por quê, como as
  partes se comunicam, e ganhar autonomia progressiva.
- **Modo de aprendizagem**: aprender fazendo, com explicações curtas por
  funcionalidade + 1 pergunta de verificação. Modo Foco disponível quando
  pedir.

## Conceitos dominados

### 🟢 Dominados
*(nenhum ainda — este arquivo acabou de ser criado; níveis abaixo
refletem exposição ao conceito nesta sessão, não domínio comprovado)*

### 🟡 Em aprendizado (exposto ao conceito, nível 1 — reconhece)
- Row Level Security / RLS (visto no parecer de segurança e na correção
  do login)
- Diferença entre RLS (linha) e GRANT (tabela) — o bug real de hoje
- Server Actions do Next.js (usadas no login)
- Supabase Auth (`signInWithPassword`, sessão via cookie/middleware)
- Trigger `SECURITY DEFINER` (usado para escrever histórico sem dar
  permissão de escrita direta ao usuário)
- Diferença entre "tarefa padrão" (modelo) e "tarefa do evento" (cópia)

### 🔴 Precisa revisar
*(nenhuma revisão pendente ainda — primeira sessão do sistema de ensino)*

## Fundamentos

| Conceito | Nível |
|---|---|
| HTML/CSS | - |
| JavaScript/TypeScript | - |
| Git | - |
| HTTP | - |
| API/REST | 1 |
| Frontend | - |
| Backend | 1 |
| Banco de dados relacional | 1 |
| SQL | 1 |
| Autenticação | 1 |
| Autorização | 2 |

## Arquitetura

| Conceito | Nível |
|---|---|
| Cliente/Servidor | 1 |
| Row Level Security (RLS) | 1 |
| GRANT de tabela vs. policy de linha | 1 |
| Server Actions (Next.js) | 1 |
| Trigger de banco / SECURITY DEFINER | 1 |
| Validação de entrada | 0 |
| Tratamento de erros | 0 |

## Projeto Betel

### Módulo atual
Menu de navegação lateral (sidebar) — implementado, testado e commitado
localmente em 2026-08-18. MVP funcional completo (cadastros, contratos,
eventos, checklist automático, tarefas, dashboard, navegação).

### Próximos módulos
Onboarding guiado de primeiro acesso (migration `0004_onboarding.sql`
pronta, aguardando aprovação explícita antes de aplicar) ou portal do
cliente — a definir.

## Decisões técnicas aprendidas
*(a preencher conforme o usuário explicar de volta — ver
`docs/learning/LESSONS.md` para o formato reutilizável; decisões técnicas
completas ficam em `00-gestao/decisoes-tecnicas.md` e
`00-gestao/riscos.md`)*

## Erros e aprendizados
Ver `docs/learning/MISTAKES.md`.

## Perguntas que ainda preciso responder
- Por que o login funcionou no Supabase Auth mas ainda assim falhou ao
  buscar os dados do usuário? (o bug do GRANT — ver `MISTAKES.md`)

## Última sessão
2026-08-18 — menu de navegação lateral implementado e commitado
localmente. Primeira pergunta de verificação respondida corretamente:
o usuário identificou, sem ajuda, que a proteção contra acesso direto
por URL é o middleware no servidor (`ADMIN_ROUTES`), não o sidebar —
distinguiu corretamente "o que mostra" de "o que autoriza". Autorização
promovida de nível 1 para nível 2 na tabela de Fundamentos.

## Próximo conceito recomendado
Onboarding guiado — quando aprovado, é uma boa oportunidade para
reforçar "estado por usuário vs. estado por sessão" (por que preferimos
guardar `onboarding_concluido` no banco em vez de `localStorage`).
