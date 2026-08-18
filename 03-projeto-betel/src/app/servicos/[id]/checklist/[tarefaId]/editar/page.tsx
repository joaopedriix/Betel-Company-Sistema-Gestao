import { notFound } from "next/navigation";

import { atualizarTarefaPadrao } from "../../../checklist-actions";
import { TarefaPadraoForm } from "../../../tarefa-padrao-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditarTarefaPadraoPage({
  params,
}: {
  params: Promise<{ id: string; tarefaId: string }>;
}) {
  const { id: servicoId, tarefaId } = await params;
  const supabase = await createClient();

  const { data: tarefa } = await supabase
    .from("tarefa_padrao")
    .select(
      "id, nome, descricao, responsavel_padrao_id, prazo_offset_dias, prioridade, ordem, visivel_ao_cliente",
    )
    .eq("id", tarefaId)
    .maybeSingle();

  if (!tarefa) notFound();

  const { data: socios } = await supabase
    .from("usuario")
    .select("id, nome")
    .eq("perfil", "socio")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  const atualizar = atualizarTarefaPadrao.bind(null, tarefa.id, servicoId);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Editar tarefa do checklist</h1>
      <TarefaPadraoForm
        action={atualizar}
        socios={socios ?? []}
        valoresIniciais={{
          nome: tarefa.nome,
          descricao: tarefa.descricao ?? "",
          responsavelPadraoId: tarefa.responsavel_padrao_id ?? "",
          prazoOffsetDias: String(tarefa.prazo_offset_dias),
          prioridade: tarefa.prioridade,
          ordem: String(tarefa.ordem),
          visivelAoCliente: tarefa.visivel_ao_cliente,
        }}
        tituloBotao="Salvar alterações"
        cancelarHref={`/servicos/${servicoId}`}
      />
    </main>
  );
}
