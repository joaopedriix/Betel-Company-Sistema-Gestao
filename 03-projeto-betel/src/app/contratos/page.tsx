import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type Contrato = {
  id: string;
  status: string;
  data_criacao: string;
  cliente: { nome: string } | null;
  evento: { nome: string } | null;
};

export default async function ContratosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contrato")
    .select("id, status, data_criacao, cliente:cliente_id(nome), evento:evento_id(nome)")
    .order("data_criacao", { ascending: false });

  const contratos = (data ?? []) as unknown as Contrato[];

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Contratos</h1>
        <Link href="/contratos/novo" className={buttonVariants()}>
          Novo contrato
        </Link>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível carregar os contratos. Tente novamente mais tarde.
        </p>
      ) : contratos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm font-medium">Nenhum contrato cadastrado ainda.</p>
          <Link href="/contratos/novo" className={cn(buttonVariants(), "mt-2")}>
            Cadastrar o primeiro contrato
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Evento</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Criado em</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{c.cliente?.nome ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{c.evento?.nome ?? "—"}</td>
                  <td className="px-4 py-2">
                    <Badge variant={c.status === "fechado" ? "ativo" : "inativo"}>
                      {c.status === "fechado" ? "Fechado" : "Rascunho"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {new Date(c.data_criacao).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/contratos/${c.id}`}
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
