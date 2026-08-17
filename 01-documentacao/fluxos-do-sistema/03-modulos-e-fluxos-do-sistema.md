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
  - Regras exatas de quais serviços vendidos disparam quais
    itens/templates (por ora há só um template, de casamento — ver
    `04-checklists-e-rotinas-operacionais.md`).
  - Quem pode criar/editar templates (qual perfil de acesso).
  - Um item pode ter mais de um responsável ou só um?
  - O progresso do checklist aparece no Portal do Cliente ou é só uso
    interno da equipe?

- **Riscos de implementação:**
  - Se a regra de personalização por serviço não for respeitada desde o
    modelo de dados, o checklist volta a virar lista fixa igual para todo
    evento — o que o cliente já disse que não quer.
  - Módulo depende de decisões ainda pendentes em Anexos e Provas (como
    evidência é anexada) e em Transparência (como atraso é sinalizado) —
    não deve ser desenhado isoladamente dos outros dois.

### Modelo de dados conceitual — Checklists

> Nível conceitual (entidades, campos, relações), para orientar a futura
> validação de arquitetura em `06-referencia-arquitetura-supabase.md`.
> **Não é schema definitivo** — nenhuma tabela, migration ou banco foi
> criado a partir disto.

**ChecklistTemplate** (o "molde", ex.: "Conferência Final — Casamento")
- `id`
- `nome`
- `tipoEvento` (hoje só "casamento"; pendente decidir se vira catálogo
  aberto de tipos de serviço)
- `ativo`

**ChecklistTemplateCategoria** (ex.: "Cerimônia", "Recepção")
- `id`
- `templateId` → ChecklistTemplate
- `nome`
- `ordem`

**ChecklistTemplateItem** (o item padrão dentro de uma categoria)
- `id`
- `categoriaId` → ChecklistTemplateCategoria
- `descricao`
- `ordem`
- `ativoPorPadrao` (se vem marcado ao instanciar, mas pode ser desativado
  no evento específico — é o que viabiliza a personalização)

**ChecklistEvento** (checklist já instanciado para um evento real)
- `id`
- `eventoId` → Evento (módulo Eventos e Agenda)
- `templateOrigemId` → ChecklistTemplate

**ChecklistEventoItem** (item de fato executado naquele evento)
- `id`
- `checklistEventoId` → ChecklistEvento
- `templateItemOrigemId` → ChecklistTemplateItem (opcional — permite item
  avulso adicionado só para aquele evento, fora do template)
- `descricao` (copiada do template no momento da instanciação)
- `ativo` (permite desativar item irrelevante para aquele evento)
- `status` (pendente / em_andamento / concluído)
- `responsavelId` → Usuário (pendente: 1 ou N responsáveis por item)
- `prazo`
- `observacoes`
- `concluidoEm`, `concluidoPor`

**Relação com Anexos e Provas:** cada `ChecklistEventoItem` pode ter N
anexos (evidência) — a entidade exata de Anexo será definida quando esse
módulo for detalhado.

**Decisão de design a validar com você:** `ChecklistEventoItem` copia a
descrição do template em vez de só referenciar — assim, se o template for
editado depois, checklists de eventos já em andamento ou concluídos não
mudam retroativamente (preserva o que realmente foi executado naquele
evento, importante para o Portal do Cliente e para auditoria).

**Ainda em aberto, não resolvido por este modelo:**
- Multiempresa/multitenancy (se `ChecklistTemplate` é global ou por marca
  — Betel Noivas / Betel Eventos / BTU / etc.).
- Perfis de acesso (quem edita template vs. quem só executa).

- **Status:** apenas detalhamento documental e modelo conceitual nesta
  etapa. Nenhum schema, migration, banco ou tela foi criado.

Demais módulos ainda não detalhados nesta etapa.
