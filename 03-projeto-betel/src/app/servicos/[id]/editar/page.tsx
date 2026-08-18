import { notFound } from "next/navigation";

import { atualizarServico } from "../../actions";
import { ServicoForm } from "../../servico-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditarServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: servico } = await supabase
    .from("servico")
    .select("id, nome, descricao")
    .eq("id", id)
    .maybeSingle();

  if (!servico) notFound();

  const atualizar = atualizarServico.bind(null, servico.id);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Editar serviço</h1>
      <ServicoForm
        action={atualizar}
        valoresIniciais={{ nome: servico.nome, descricao: servico.descricao ?? "" }}
        tituloBotao="Salvar alterações"
        cancelarHref={`/servicos/${servico.id}`}
      />
    </main>
  );
}
