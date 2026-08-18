import { notFound, redirect } from "next/navigation";

import { atualizarServicosContrato } from "../../actions";
import { ContratoForm } from "../../contrato-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditarContratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contrato } = await supabase
    .from("contrato")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (!contrato) notFound();
  if (contrato.status === "fechado") redirect(`/contratos/${id}`);

  const [{ data: servicos }, { data: servicosAtuaisData }] = await Promise.all([
    supabase.from("servico").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("contrato_servico").select("servico_id").eq("contrato_id", id),
  ]);

  const servicoIdsIniciais = (servicosAtuaisData ?? []).map((s) => s.servico_id as string);

  const atualizar = atualizarServicosContrato.bind(null, contrato.id);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Editar serviços do contrato</h1>
      <ContratoForm
        action={atualizar}
        eventos={[]}
        servicos={servicos ?? []}
        eventoIdFixo={id}
        servicoIdsIniciais={servicoIdsIniciais}
        tituloBotao="Salvar alterações"
        cancelarHref={`/contratos/${id}`}
      />
    </main>
  );
}
