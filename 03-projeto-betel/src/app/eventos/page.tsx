import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type Evento = {
  id: string;
  nome: string;
  data_evento: string | null;
  cliente: { nome: string } | null;
};

export default async function EventosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evento")
    .select("id, nome, data_evento, cliente:cliente_id(nome)")
    .order("data_evento", { ascending: true, nullsFirst: false });

  const eventos = (data ?? []) as unknown as Evento[];

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Eventos</h1>
        <Link href="/eventos/novo" className={buttonVariants()}>
          Novo evento
        </Link>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível carregar os eventos. Tente novamente mais tarde.
        </p>
      ) : eventos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm font-medium">Nenhum evento cadastrado ainda.</p>
          <Link href="/eventos/novo" className={cn(buttonVariants(), "mt-2")}>
            Cadastrar o primeiro evento
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Nome</th>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Data</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => (
                <tr key={evento.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{evento.nome}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {evento.cliente?.nome ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {evento.data_evento
                      ? new Date(`${evento.data_evento}T00:00:00`).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/eventos/${evento.id}`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
