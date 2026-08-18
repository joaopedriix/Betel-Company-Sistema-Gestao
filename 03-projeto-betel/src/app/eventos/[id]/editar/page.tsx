import { notFound } from "next/navigation";

import { atualizarEvento } from "../../actions";
import { EventoForm } from "../../evento-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: evento } = await supabase
    .from("evento")
    .select("id, nome, cliente_id, data_evento, area")
    .eq("id", id)
    .maybeSingle();

  if (!evento) notFound();

  const { data: clientes } = await supabase
    .from("cliente")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  const atualizar = atualizarEvento.bind(null, evento.id);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Editar evento</h1>
      <EventoForm
        action={atualizar}
        clientes={clientes ?? []}
        valoresIniciais={{
          nome: evento.nome,
          clienteId: evento.cliente_id,
          dataEvento: evento.data_evento ?? "",
          area: evento.area ?? "",
        }}
        tituloBotao="Salvar alterações"
        cancelarHref={`/eventos/${evento.id}`}
      />
    </main>
  );
}
