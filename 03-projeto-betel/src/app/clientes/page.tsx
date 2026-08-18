import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type Cliente = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  ativo: boolean;
};

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const busca = (q ?? "").trim();

  const supabase = await createClient();
  let query = supabase
    .from("cliente")
    .select("id, nome, email, telefone, ativo")
    .order("nome", { ascending: true });

  if (busca) {
    query = query.ilike("nome", `%${busca}%`);
  }

  const { data, error } = await query;
  const clientes = (data ?? []) as Cliente[];

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <Link href="/clientes/novo" className={buttonVariants()}>
          Novo cliente
        </Link>
      </div>

      <form className="flex gap-2" role="search">
        <Input
          type="search"
          name="q"
          placeholder="Buscar por nome..."
          defaultValue={busca}
          aria-label="Buscar cliente por nome"
        />
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </form>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível carregar os clientes. Tente novamente mais tarde.
        </p>
      ) : clientes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm font-medium">
            {busca ? "Nenhum cliente encontrado para essa busca." : "Nenhum cliente cadastrado ainda."}
          </p>
          {!busca ? (
            <Link href="/clientes/novo" className={cn(buttonVariants(), "mt-2")}>
              Cadastrar o primeiro cliente
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Nome</th>
                <th className="px-4 py-2 font-medium">Contato</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{cliente.nome}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {cliente.email || cliente.telefone || "—"}
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={cliente.ativo ? "ativo" : "inativo"}>
                      {cliente.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/clientes/${cliente.id}`}
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
