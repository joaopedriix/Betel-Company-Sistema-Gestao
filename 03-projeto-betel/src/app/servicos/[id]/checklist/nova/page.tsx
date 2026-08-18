import { notFound } from "next/navigation";

import { criarTarefaPadrao } from "../../checklist-actions";
import { TarefaPadraoForm } from "../../tarefa-padrao-form";
import { createClient } from "@/lib/supabase/server";

export default async function NovaTarefaPadraoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: servicoId } = await params;
  const supabase = await createClient();

  const { data: checklist } = await supabase
    .from("checklist_modelo")
    .select("id")
    .eq("servico_id", servicoId)
    .maybeSingle();

  if (!checklist) notFound();

  const { data: socios } = await supabase
    .from("usuario")
    .select("id, nome")
    .eq("perfil", "socio")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  const criar = criarTarefaPadrao.bind(null, checklist.id, servicoId);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Nova tarefa do checklist</h1>
      <TarefaPadraoForm
        action={criar}
        socios={socios ?? []}
        tituloBotao="Salvar tarefa"
        cancelarHref={`/servicos/${servicoId}`}
      />
    </main>
  );
}
