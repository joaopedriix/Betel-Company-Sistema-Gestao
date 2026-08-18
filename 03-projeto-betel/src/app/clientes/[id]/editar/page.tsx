import { notFound } from "next/navigation";

import { atualizarCliente } from "../../actions";
import { ClienteForm } from "../../cliente-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: cliente } = await supabase
    .from("cliente")
    .select("id, nome, email, telefone")
    .eq("id", id)
    .maybeSingle();

  if (!cliente) notFound();

  const atualizar = atualizarCliente.bind(null, cliente.id);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Editar cliente</h1>
      <ClienteForm
        action={atualizar}
        valoresIniciais={{
          nome: cliente.nome,
          email: cliente.email ?? "",
          telefone: cliente.telefone ?? "",
        }}
        tituloBotao="Salvar alterações"
        cancelarHref={`/clientes/${cliente.id}`}
      />
    </main>
  );
}
