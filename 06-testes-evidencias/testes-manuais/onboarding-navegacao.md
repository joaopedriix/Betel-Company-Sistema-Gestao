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

**Não testado nesta sessão** (sem uma segunda conta de teste
disponível, e por regra não posso digitar senha de terceiros): tour do
perfil sócio (existe em `ONBOARDING_STEPS_POR_PERFIL.socio`, mesmo
código do provider — risco residual baixo, mas não é evidência real).
Também não testado: mobile real (viewport emulado, não dispositivo
físico), leitor de tela, zoom 200%.

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
