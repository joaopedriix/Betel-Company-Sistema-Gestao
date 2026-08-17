# Estratégia de testes — Betel Company (Sistema de Gestão)

> Data: 2026-08-17. Baseado em `01-documentacao/requisitos/mvp.md`,
> `01-documentacao/regras-de-negocio/regras-iniciais.md`,
> `01-documentacao/fluxos-do-sistema/fluxos-iniciais.md` e
> `00-gestao/decisoes-tecnicas.md` (stack Next.js App Router + TypeScript +
> Supabase/Postgres + RLS, deploy Vercel).
>
> Documento de estratégia. Ainda **não há código implementado** — este
> arquivo define o que testar e como, para orientar a construção.

## 1. Princípio central

Regra do projeto: **não declarar uma funcionalidade concluída só porque foi
codificada.** Uma funcionalidade só é "testada" quando cumpre os critérios da
seção 5 deste documento.

A regra de segurança mais crítica do sistema é o **isolamento por perfil e por
responsável** aplicado no backend/banco (RLS), não só na interface. Todo fluxo
que lê ou escreve dado sensível (`tarefa_evento`, `historico_tarefa`, dados do
cliente) precisa de um **caso negativo explícito**: um usuário tentando acessar
ou alterar dado que não é dele **deve falhar** — inclusive trocando o
identificador na URL/API (proteção contra IDOR).

## 2. Camadas de teste e ferramentas

| Camada | Ferramenta sugerida | Onde | O que cobre |
|---|---|---|---|
| Unitário (lógica pura de negócio) | **Vitest** | `06-testes-evidencias/testes-automatizados/unit` | Cálculo de progresso, geração/cópia de tarefas do modelo, cálculo de prazos relativos (ex. "D-30"), derivação do estado visual "atrasada" |
| Integração (rotas/server actions + RLS) | **Vitest** + client Supabase contra banco de teste | `06-testes-evidencias/testes-automatizados/integration` | Cada server action que lê/escreve por perfil e por responsável; políticas RLS com caso negativo explícito |
| E2E (fluxo crítico ponta a ponta) | **Playwright** | `06-testes-evidencias/testes-automatizados/e2e` | Fechamento de contrato → geração de checklist → conclusão de tarefa → progresso atualizado |
| Manual (critérios de aceite) | Roteiro em `06-testes-evidencias/testes-manuais/roteiro-criterios-aceite-mvp.md` | — | Todos os itens da lista de aceite do MVP |

Observação sobre a stack: como a autorização vive no **RLS do Postgres**, o
isolamento entre usuários **não pode** ser validado só com mocks. Os testes de
integração devem rodar contra um banco Supabase/Postgres real de teste,
autenticando como usuários distintos (admin, sócio A, sócio B, cliente), para
que as políticas sejam de fato exercitadas. Testar só a camada Next.js com o
banco mockado daria falsa confiança.

## 3. Fluxos críticos que exigem teste automatizado

Prioridade alta (bloqueiam o MVP):

1. **Geração automática de checklist/tarefas ao fechar contrato**
   (`regras-iniciais.md` §Fechamento). Ao mudar o contrato para "Fechado":
   identifica serviços contratados → localiza modelos de checklist → **copia**
   as tarefas para o evento → vincula cada tarefa ao sócio definido → calcula
   prazos → cria o checklist do evento. Testar unitário (a função de geração) +
   E2E (o fluxo completo).
   - Caso negativo obrigatório: o **modelo original permanece inalterado** após
     a geração (a `tarefa_padrao` nunca é editada a partir da `tarefa_evento`).
   - Fechar um contrato sem serviços / com serviço sem modelo não deve quebrar.

2. **Cálculo do progresso do evento** (`regras-iniciais.md` §Progresso).
   Progresso = concluídas / total. Unitário com casos: 0/N = 0%, N/N = 100%,
   6/10 = 60%, evento sem tarefas (evitar divisão por zero).

3. **Conclusão de tarefa atualiza checklist + histórico** (`regras-iniciais.md`
   §Conclusão). Ao concluir: status → "Concluída"; item do checklist do evento
   marcado; registra `concluida_por`, data e hora; recalcula progresso; grava
   no histórico; tarefa **nunca é excluída**. Integração + E2E.

4. **Isolamento de tarefas por sócio via RLS** (`regras-iniciais.md`
   §Segurança). Sócio A **não** enxerga nem altera tarefa do Sócio B, mesmo
   chamando a API direto com o `id` da tarefa do outro (IDOR). Caso negativo é
   o teste principal, não o positivo.

5. **Isolamento de dados do cliente via RLS.** Cliente só vê os dados
   **públicos** do próprio evento (`visivel_ao_cliente = true`); não vê tarefas
   internas nem dados de outro cliente/evento. Caso negativo explícito.

6. **Reabertura de tarefa por admin** (`regras-iniciais.md` §Reabertura). Só
   admin/gestor reabre; status volta a "Pendente"; check removido do checklist;
   progresso recalculado; ação no histórico. Caso negativo: sócio ou cliente
   tentando reabrir **deve falhar** no backend.

Prioridade média (importantes, não bloqueiam o núcleo):

7. Derivação visual **"atrasada"**: prazo vencido **e** status ≠ "Concluída"
   (é estado derivado, não um status próprio). Unitário, incluindo borda: prazo
   vence hoje, tarefa concluída no prazo, tarefa concluída após o prazo.
8. Transições de status válidas (`pendente`/`em_andamento`/`concluida`/
   `bloqueada`) e visibilidade de cada campo por perfil no checklist do evento.
9. Registro de histórico para os demais eventos: criação, troca de responsável,
   troca de prazo.

## 4. Validação de payload / casos de erro

Independentemente de a validação usar Zod ou outro esquema, cada server action
de mutação deve ter teste para o **caminho de erro**, não só o feliz:

- Payload inválido / campos obrigatórios ausentes (ex.: contrato sem cliente,
  tarefa sem responsável, serviço sem nome) → rejeitado antes de tocar o banco.
- Ação sobre entidade inexistente (id que não existe) → erro tratado.
- Ação sem permissão (perfil errado) → negada no backend, não só escondida na
  UI.

## 5. Critérios de "testado" (definição de pronto para QA)

Uma funcionalidade só é considerada **testada** quando:

1. O(s) fluxo(s) crítico(s) que ela toca têm teste automatizado passando na
   camada adequada (unit/integração/E2E conforme a tabela da seção 2).
2. Todo acesso a dado sensível tem **caso positivo e caso negativo** (o negativo
   prova o isolamento por perfil/responsável, incluindo tentativa via
   URL/API direta).
3. Os caminhos de erro e validação estão cobertos, não só o caminho feliz.
4. O item correspondente no roteiro manual
   (`roteiro-criterios-aceite-mvp.md`) foi executado e está com Status
   "Aprovado".
5. Ao alterar `prisma/schema.prisma` ou o schema/migrações do Supabase, as
   migrations e os testes de integração existentes continuam passando (nenhuma
   política RLS foi enfraquecida sem teste que a cubra).

Enquanto qualquer um desses itens estiver aberto, a funcionalidade é
"codificada", não "concluída".

## 6. Ordem sugerida de implementação dos testes

Seguindo a sequência do fluxo principal (`fluxos-iniciais.md`):

1. Unit: cálculo de prazos e cópia de tarefas do modelo.
2. Unit: cálculo de progresso e derivação de "atrasada".
3. Integração: RLS de `tarefa_evento` (sócio A × sócio B) — caso negativo.
4. Integração: RLS de dados do cliente — caso negativo.
5. Integração: fechamento de contrato gera checklist e preserva o modelo.
6. Integração: conclusão e reabertura (histórico + progresso).
7. E2E (Playwright): fechamento → checklist → conclusão → progresso.
