# Testes manuais — Cadastros base (Clientes, Sócios/Usuários, Serviços)

> Executados em 2026-08-18, via navegador contra o Codespace de teste
> (`expert-goggles-4qqjvj57wv5g24ww`) e via API REST do Supabase
> (Auth + PostgREST) para os testes de segurança. Dados usados são
> fictícios (`*.teste.local`), removíveis a qualquer momento.

## Clientes

| Caso | Resultado |
|---|---|
| Listagem vazia | ✅ "Nenhum cliente cadastrado ainda." + CTA |
| Criar cliente | ✅ salvo, redireciona para listagem, aparece na tabela |
| Persistência após reload | ✅ dado vem do banco, não de estado local |
| Busca com resultado | ✅ |
| Busca sem resultado | ✅ "Nenhum cliente encontrado para essa busca." |
| Ver detalhes | ✅ nome/email/telefone/data corretos |
| Editar | ✅ formulário pré-preenchido, salva, reflete no detalhe |
| Inativar / Ativar | ✅ badge e botão trocam corretamente |
| Duplicidade de email (criar) | ✅ bloqueado com mensagem clara, sem duplicata |

## Sócios/Usuários

| Caso | Resultado |
|---|---|
| Criar usuário (perfil sócio) | ✅ conta criada no Auth + perfil em `usuario`, senha temporária exibida uma vez |
| Senha não reaparece sem o `?senha=` na URL | ✅ confirmado (ver limitação registrada em `decisoes-do-mvp.md`) |
| Duplicidade de email (Auth global, não só por tenant) | ✅ bloqueado, sem criar conta órfã |
| Login com a conta recém-criada | ✅ redireciona para `/minhas-tarefas` (home do perfil sócio) |

## Serviços

| Caso | Resultado |
|---|---|
| Criar serviço | ✅ |
| Duplicidade de nome (case-insensitive, `ilike`) | ✅ "buffet completo teste" bloqueado contra "Buffet Completo Teste" existente |

## Segurança — via API (JWT do usuário sócio de teste)

| Caso | Resultado |
|---|---|
| SELECT `cliente` como sócio | HTTP 200, vazio — correto: `cliente_socio_select` só libera leitura se o sócio for responsável por uma tarefa em um evento daquele cliente (módulo Eventos ainda não existe, então nunca bate) |
| INSERT `cliente` como sócio | ✅ HTTP 403 `42501` (RLS bloqueou) |
| SELECT `usuario` como sócio | ✅ só a própria linha (política `usuario_self_select`) |
| UPDATE do próprio `perfil` para `admin` | ✅ silenciosamente sem efeito (RLS `usuario_admin_all` não encontra a linha para update); confirmado por leitura posterior que o perfil continua `socio` |
| SELECT `servico` como sócio | ✅ HTTP 200, retorna os serviços do tenant (leitura liberada a todo autenticado) |
| INSERT `servico` como sócio | ✅ HTTP 403 `42501` (RLS bloqueou) |
| `service_role` tem GRANT direto na tabela `usuario`? | ❌ Não — confirmado que nem a chave `service_role` acessa a tabela via API REST sem GRANT explícito, reforçando que a aplicação nunca usa `service_role` para dado de negócio |

## Segurança — via navegador (rotas administrativas)

| Caso | Resultado |
|---|---|
| Sócio acessa `/clientes` (listagem) | ✅ redirecionado para `/minhas-tarefas` pelo middleware |
| Sócio acessa `/usuarios` (listagem) | ✅ redirecionado |
| Sócio acessa `/servicos` (listagem) | ✅ redirecionado |
| Sócio acessa `/clientes/<id-real>` diretamente por URL (IDOR via rota) | ✅ redirecionado antes de qualquer dado ser exposto |

## Escopo não coberto nesta rodada

- Isolamento **entre tenants diferentes** (empresa A vs. empresa B) não
  foi reexecutado com um segundo tenant fictício — nenhuma policy,
  função ou schema mudou nesta fase (confirmado via `git status` em
  `database/`), e os 3 cadastros usam exatamente a mesma função
  `is_admin_of()` já coberta pelos 27 testes de
  `04-analises/testes-isolamento-tenant.md` (2026-08-17). Decisão de
  escopo, não uma lacuna descoberta e ignorada.
