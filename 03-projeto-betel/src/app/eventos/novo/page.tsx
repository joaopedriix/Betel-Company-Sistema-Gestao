import { criarEvento } from "../actions";
import { EventoForm } from "../evento-form";
import { createClient } from "@/lib/supabase/server";

export default async function NovoEventoPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("cliente")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Novo evento</h1>
      <EventoForm
        action={criarEvento}
        clientes={clientes ?? []}
        tituloBotao="Salvar evento"
        cancelarHref="/eventos"
      />
    </main>
  );
}
