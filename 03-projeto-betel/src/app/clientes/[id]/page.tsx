import Link from "next/link";
import { notFound } from "next/navigation";

import { alternarAtivoCliente } from "../actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function DetalheClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: cliente } = await supabase
    .from("cliente")
    .select("id, nome, email, telefone, ativo, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!cliente) notFound();

  const alternarAtivo = alternarAtivoCliente.bind(null, cliente.id, cliente.ativo);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{cliente.nome}</h1>
          <Badge variant={cliente.ativo ? "ativo" : "inativo"}>
            {cliente.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/clientes/${cliente.id}/editar`} className={buttonVariants({ variant: "outline" })}>
            Editar
          </Link>
          <form action={alternarAtivo}>
            <Button type="submit" variant={cliente.ativo ? "destructive" : "secondary"}>
              {cliente.ativo ? "Inativar" : "Ativar"}
            </Button>
          </form>
        </div>
      </div>

      <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Email</dt>
        <dd>{cliente.email || "—"}</dd>
        <dt className="text-muted-foreground">Telefone</dt>
        <dd>{cliente.telefone || "—"}</dd>
        <dt className="text-muted-foreground">Cadastrado em</dt>
        <dd>{new Date(cliente.created_at).toLocaleDateString("pt-BR")}</dd>
      </dl>

      <section className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        Contratos e eventos deste cliente aparecerão aqui quando esses
        módulos forem implementados.
      </section>

      <Link href="/clientes" className="text-sm text-muted-foreground underline underline-offset-4">
        ← Voltar para clientes
      </Link>
    </main>
  );
}
