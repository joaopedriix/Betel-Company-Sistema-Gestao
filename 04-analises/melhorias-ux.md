# Melhorias de UX — Fase 3 (navegação e experiência)

> Base: revisão de código de todas as páginas + navegação, combinada com
> a validação real no navegador feita em
> `06-testes-evidencias/testes-manuais/onboarding-navegacao.md`
> (onboarding, `/agenda`, `/tarefas`, `/checklists`, desktop 1920×863).
> Itens marcados **[código]** são achados de leitura de código, ainda
> sem confirmação visual — não testados no navegador nesta fase, listado
> explicitamente para não ser confundido com validação real (mobile
> físico, zoom 200%, leitor de tela, drawer mobile) — ver "Não validado
> ainda" no final.

## Necessário antes da demonstração ao cliente

1. **Dashboard sem dado real para mostrar** — hoje todos os indicadores
   estão zerados (nenhum dado de negócio no tenant). Depende da Fase 8
   (dados de demonstração) para a demo fazer sentido visualmente — sem
   isso, a tela mais "vitrine" do sistema aparece vazia.
2. **Inconsistência de tratamento de erro entre páginas [código]** —
   `clientes`, `contratos`, `eventos` e `servicos` verificam o `error`
   da query Supabase e mostram uma mensagem amigável
   (`role="alert"`, "Não foi possível carregar..."). As páginas mais
   novas (`dashboard`, `/tarefas`, `/minhas-tarefas`) **não checam
   `error`** — se a query falhar, a tela mostra silenciosamente "0" ou
   lista vazia, indistinguível de "não há dados de verdade". Numa
   demonstração ao vivo, um erro de rede nessas telas passaria
   despercebido em vez de mostrar um aviso claro.

## Necessário antes de produção (uso real)

3. **Nenhum `loading.tsx`/`error.tsx`/`not-found.tsx` em nenhuma rota
   [código]** — convenção do Next.js App Router para estado de
   carregamento, erro de renderização e 404 não é usada em nenhuma
   página. Hoje: uma query lenta não mostra nenhum feedback visual
   (tela parece travada até o Server Component terminar); um erro não
   tratado em Server Component cai na tela de erro padrão do Next
   (não a marca do produto); uma URL inválida cai no 404 genérico do
   Next.
4. **Aplicar o mesmo padrão de tratamento de erro** das páginas mais
   antigas (`clientes`/`contratos`/`eventos`/`servicos`) em
   `dashboard`, `/tarefas`, `/minhas-tarefas`, `/agenda`,
   `/checklists` — ver item 2, mesma causa raiz.
5. **Drawer mobile sem fechar com Escape e sem foco preso [código]** —
   `Sidebar` (`components/layout/sidebar.tsx`): o drawer mobile fecha
   ao clicar no overlay ou no X, mas não tem handler de `Escape` (o
   tour de onboarding tem, o drawer não) nem prende o foco por teclado
   dentro do menu aberto — tab pode escapar para elementos atrás do
   overlay. Ainda não confirmado visualmente em viewport mobile real
   (ver "Não validado ainda").
6. **Sócio não vê Agenda** — confirmado intencional
   (`NAV_BY_PERFIL.socio` só tem "Minhas tarefas"), mas vale
   reconfirmar com o usuário se é isso mesmo que ele quer: hoje o
   sócio não tem como saber a data do evento da própria tarefa sem
   abrir o detalhe. Registrado como decisão de produto em aberto
   (task interna #13, não uma pendência técnica).

## Melhoria futura

7. **Breadcrumbs** — não existem em nenhuma página; hoje a navegação
   depende só da sidebar + botão "voltar" do navegador. Baixa
   prioridade dado o tamanho atual do produto (poucos níveis de
   profundidade).
8. **Título de página (`<title>`) fixo** — `metadata` em
   `app/layout.tsx` é estático ("Betel Company — Sistema de Gestão")
   para todas as rotas; páginas individuais não sobrescrevem o título
   (ex.: a aba do navegador não diferencia "Clientes" de "Contratos").

## Não validado ainda (precisa de sessão com Codespace ativo)

- Mobile real (viewport emulado ou dispositivo físico) — só o layout
  desktop (1920×863) foi confirmado ao vivo até agora.
- Zoom 200%.
- Navegação 100% por teclado (tab order, foco visível) fora do tour de
  onboarding (que já foi validado).
- Leitor de tela.
- Tablet.

Esses ficam para quando o Codespace for religado de novo (ex.: junto
com os testes automatizados da Fase 4, para não ligar/desligar o
ambiente mais vezes do que necessário).
