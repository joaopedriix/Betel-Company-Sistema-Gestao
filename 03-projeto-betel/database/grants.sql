-- =====================================================================
-- Betel Company — Sistema de Gestão
-- Grants de tabela para o role authenticated — PostgreSQL / Supabase
-- =====================================================================
--
-- RLS (policies.sql) decide QUAIS LINHAS um usuário pode ver/alterar.
-- Isso não basta: o Postgres também exige GRANT de privilégio na TABELA
-- para o role sequer tentar a operação — sem o GRANT, toda query falha
-- com "permission denied for table X", mesmo com policy correta.
--
-- Como o projeto foi criado com "Automatically expose new tables"
-- desligado (decisão de segurança — ver 00-gestao/decisoes-tecnicas.md),
-- esses grants precisam ser aplicados explicitamente. Rode este arquivo
-- por último, depois de schema.sql e policies.sql.
--
-- Sem GRANT correspondente para `anon`: nenhum dado de negócio é
-- acessível sem login, por decisão de produto (cliente também loga).
-- =====================================================================

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.usuario           to authenticated;
grant select, insert, update, delete on public.cliente           to authenticated;
grant select, insert, update, delete on public.servico           to authenticated;
grant select, insert, update, delete on public.checklist_modelo  to authenticated;
grant select, insert, update, delete on public.tarefa_padrao     to authenticated;
grant select, insert, update, delete on public.evento            to authenticated;
grant select, insert, update, delete on public.contrato          to authenticated;
grant select, insert, update, delete on public.contrato_servico  to authenticated;
grant select, insert, update, delete on public.tarefa_evento     to authenticated;

-- historico_tarefa: só SELECT — escrita é exclusiva dos triggers
-- SECURITY DEFINER (fn_log_tarefa_evento), que rodam com privilégio do
-- dono da função, não do usuário logado (ver policies.sql).
grant select on public.historico_tarefa to authenticated;
