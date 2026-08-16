# Módulos e fluxos do sistema

> Para cada módulo: objetivo, usuários envolvidos, dados necessários, ações
> permitidas, dúvidas pendentes e riscos de implementação. Nesta primeira
> execução os módulos são apenas listados — o detalhamento completo é uma
> etapa futura, com aprovação prévia.

## Módulos previstos

1. Eventos e Agenda
2. CRM e Comercial
3. Financeiro
4. Portal do Cliente
5. Checklists
6. Dashboard
7. Gestão de Terceiros
8. Anexos e Provas
9. Logística
10. Avisos e Alertas

## Estrutura de detalhamento (a preencher por módulo)

Para cada módulo acima, quando detalhado, preencher:

- **Objetivo:**
- **Usuários envolvidos:**
- **Dados necessários:**
- **Ações permitidas:**
- **Dúvidas pendentes:**
- **Riscos de implementação:**

---

## 5. Checklists — PRIORIDADE

> Indicado pelo cliente como a dor mais urgente: hoje o controle é feito em
> planilha física. Primeiro módulo a ser detalhado.

- **Objetivo:** substituir a planilha física por checklists digitais por
  evento, organizados pelas categorias já levantadas em
  `04-checklists-e-rotinas-operacionais.md` (preparação geral, cerimônia,
  noivos, fotografia/filmagem, recepção, bolo/brinde, protocolo da festa,
  encerramento) e pelas rotinas operacionais (diária, semanal, mensal,
  anual), permitindo personalização por evento conforme os serviços
  vendidos — sem tornar todo item obrigatório para todo evento.

- **Usuários envolvidos:** equipe interna (executa e marca itens);
  responsável pelo evento/cerimonial (monta e ajusta o checklist do
  evento); coordenação (acompanha status agregado). Perfis exatos de
  acesso ainda pendentes (ver `07-decisoes-pendentes.md`).

- **Dados necessários:**
  - Templates de checklist por categoria/serviço (itens, ordem, categoria).
  - Checklist instanciado por evento, gerado a partir dos templates
    relevantes aos serviços vendidos naquele evento.
  - Por item: descrição, status (pendente / em andamento / concluído),
    responsável, prazo/horário, evidência (liga com o módulo Anexos e
    Provas), observações.
  - Vínculo do checklist com o evento e, quando aplicável, com a rotina
    (diária/semanal/mensal/anual).

- **Ações permitidas:**
  - Criar/editar templates de checklist por tipo de serviço.
  - Instanciar o checklist de um evento a partir dos templates relevantes.
  - Marcar item como concluído, atribuir responsável, anexar prova.
  - Sinalizar atraso de item — conecta com a regra de `02-regras-transparencia-portal-cliente.md`
    (equipe precisa saber antes do cliente).
  - Visualizar status agregado do checklist por evento (alimenta o
    Dashboard).

- **Dúvidas pendentes:**
  - Conteúdo item a item de cada checklist original ainda não foi
    transcrito do material físico do cliente — necessário para popular os
    templates reais (sem isso, o "item" fica genérico).
  - Regras exatas de quais serviços vendidos disparam quais
    itens/templates.
  - Quem pode criar/editar templates (qual perfil de acesso).
  - Um item pode ter mais de um responsável ou só um?
  - O progresso do checklist aparece no Portal do Cliente ou é só uso
    interno da equipe?

- **Riscos de implementação:**
  - Modelar o "item de checklist" de forma genérica demais antes de ter o
    conteúdo real transcrito pode exigir retrabalho de schema depois.
  - Se a regra de personalização por serviço não for respeitada desde o
    modelo de dados, o checklist volta a virar lista fixa igual para todo
    evento — o que o cliente já disse que não quer.
  - Módulo depende de decisões ainda pendentes em Anexos e Provas (como
    evidência é anexada) e em Transparência (como atraso é sinalizado) —
    não deve ser desenhado isoladamente dos outros dois.

- **Status:** apenas detalhamento documental nesta etapa. Nenhum schema,
  tela ou funcionalidade foi criada.

Demais módulos ainda não detalhados nesta etapa.
