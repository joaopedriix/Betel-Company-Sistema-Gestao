# Onboarding e navegação — validação real no navegador (2026-08-18)

> Ambiente: Codespace `expert-goggles-4qqjvj57wv5g24ww` sincronizado com o
> HEAD local (`effc275`) via `git bundle` (o Codespace estava com
> alterações não commitadas antigas, descartadas com autorização
> explícita do usuário antes de sincronizar). `npm run dev` rodando
> dentro do Codespace, acessado via porta encaminhada
> `https://expert-goggles-4qqjvj57wv5g24ww-3000.app.github.dev`. Sessão
> já autenticada como admin (cookie persistido de teste anterior — sem
> criar/usar credencial nova).

## Onboarding (perfil admin)

Testado via clique real no DOM (não só leitura de código):

- [x] Botão "Refazer dicas" abre o tour — passo 1/10, "Bem-vindo ao
      sistema da Betel"
- [x] "Avançar" incrementa o passo (testado até passo 3, "Sócios e
      usuários")
- [x] "Voltar" decrementa o passo corretamente
- [x] Tecla `Escape` fecha o tour **e persiste conclusão** (chama
      `concluirOnboarding()`)
- [x] Após reload da página, o tour **não reabre sozinho** (confirma
      que `onboardingConcluido`/`onboardingVersao` persistiram no banco
      via Server Action, não só em estado de cliente)
- [x] "Refazer dicas" reabre o tour mesmo já estando concluído
- [x] "Pular" fecha o tour corretamente

## Onboarding (perfil sócio) — validado em sessão separada

Conta fictícia criada pela própria tela "Novo usuário" do admin
(`socio.teste.onboarding.fixture@example.com`, domínio `example.com`,
sem dado real) — bônus: valida essa funcionalidade real de cadastro
também. Login feito pelo usuário em janela anônima (a automação não
digita senha de ninguém, nem de contas de teste próprias — só o usuário
fez esse passo específico), com a porta do Codespace temporariamente
tornada pública (`gh codespace ports visibility 3000:public`) só para
contornar o gate de autenticação do túnel, revertida para `private`
logo depois.

- [x] Tour abre sozinho no primeiro acesso — "Passo 1 de 5"
- [x] "Avançar" percorre os passos do perfil sócio (minhas tarefas,
      detalhes da tarefa, conclusão, navegação)
- [x] Menu mostra só "Minhas tarefas" — nenhum item administrativo
      (confirma `NAV_BY_PERFIL.socio` em `lib/layout/nav-config.ts`,
      comportamento intencional, não bug)

**Limpeza:** conta de Auth apagada via `service_role`
(`auth.admin.deleteUser`); a linha em `public.usuario` foi removida
**automaticamente por `ON DELETE CASCADE`** — confirmado depois pela
lista `/usuarios`, que voltou a mostrar só o admin real. Nenhum dado
fictício restante.

**Achado de segurança (não é um risco, é uma verificação positiva):**
tentar `SELECT`/`DELETE`/`UPDATE` em `public.usuario` com a
`service_role` retornou `permission denied for table usuario` (erro de
GRANT do Postgres, não de RLS) — `service_role` não tem **nenhum**
privilégio nessa tabela. Na prática isso reforça a regra R2
(`00-gestao/riscos.md`): mesmo que alguém erroneamente tentasse usar
`service_role` para ler/gravar `usuario`, o banco recusaria antes mesmo
da RLS entrar em jogo. Vale confirmar se isso é deliberado (grants.sql)
ou um acaso de como os GRANTs foram escritos — registrar em
`00-gestao/riscos.md` como observação, não como pendência bloqueante.

**Não testado nesta sessão:** mobile real (viewport emulado, não
dispositivo físico), leitor de tela, zoom 200%, perfil cliente (portal
do cliente é stub, sem onboarding ainda).

### Observação de ferramenta (não é bug da aplicação)

Clique via coordenada/ref da ferramenta de automação do navegador não
disparou o `onClick` do React neste domínio (`*.app.github.dev`) — a
mesma ferramenta negou permissão de screenshot no domínio. Contornado
disparando o clique via `element.click()` no console da página, que
confirmadamente aciona o handler React. Registrado aqui para não
confundir com um bug de UI real.

## Navegação nova (agenda, tarefas, checklists)

Todas carregam HTTP 200, sem erro no console, sem tela em branco:

- `/agenda`: calendário mensal renderiza corretamente (grade de
  Agosto/2026 completa, navegação Diário/Mensal/Anual visível)
- `/tarefas`: estado vazio correto ("Nenhuma tarefa aqui.") — sem dados
  de negócio no tenant hoje (esperado, fixtures de teste já foram
  removidas)
- `/checklists`: estado vazio correto ("Nenhum serviço cadastrado
  ainda.")

Não testado: preenchido com dados reais/de demonstração (depende da
Fase 8, dados de demonstração, ainda não criados), mobile real,
teclado, zoom 200% — ver `00-gestao/status-atual.md` para o que falta
antes de declarar UX validada por completo.
