import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
};

export default async function ServicosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servico")
    .select("id, nome, descricao, ativo")
    .order("nome", { ascending: true });

  const servicos = (data ?? []) as Servico[];

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Serviços</h1>
        <Link href="/servicos/novo" className={buttonVariants()}>
          Novo serviço
        </Link>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível carregar os serviços. Tente novamente mais tarde.
        </p>
      ) : servicos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm font-medium">Nenhum serviço cadastrado ainda.</p>
          <Link href="/servicos/novo" className={cn(buttonVariants(), "mt-2")}>
            Cadastrar o primeiro serviço
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Nome</th>
                <th className="px-4 py-2 font-medium">Descrição</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {servicos.map((servico) => (
                <tr key={servico.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{servico.nome}</td>
                  <td className="max-w-xs truncate px-4 py-2 text-muted-foreground">
                    {servico.descricao || "—"}
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={servico.ativo ? "ativo" : "inativo"}>
                      {servico.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/servicos/${servico.id}`}
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
