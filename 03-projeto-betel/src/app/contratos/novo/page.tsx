import { criarContrato } from "../actions";
import { ContratoForm } from "../contrato-form";
import { createClient } from "@/lib/supabase/server";

export default async function NovoContratoPage({
  searchParams,
}: {
  searchParams: Promise<{ eventoId?: string }>;
}) {
  const { eventoId } = await searchParams;
  const supabase = await createClient();

  const [{ data: eventosData }, { data: servicos }] = await Promise.all([
    supabase.from("evento").select("id, nome, cliente:cliente_id(nome)").order("nome"),
    supabase.from("servico").select("id, nome").eq("ativo", true).order("nome"),
  ]);

  type EventoRow = { id: string; nome: string; cliente: { nome: string } | null };
  const eventos = ((eventosData ?? []) as unknown as EventoRow[]).map((e) => ({
    id: e.id,
    nome: e.nome,
    clienteNome: e.cliente?.nome ?? "—",
  }));

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Novo contrato</h1>
      <ContratoForm
        action={criarContrato}
        eventos={eventos}
        servicos={servicos ?? []}
        eventoIdFixo={undefined}
        tituloBotao="Salvar contrato"
        cancelarHref="/contratos"
      />
      {eventoId ? (
        <p className="text-xs text-muted-foreground">
          Dica: selecione o evento pré-indicado na lista acima.
        </p>
      ) : null}
    </main>
  );
}
