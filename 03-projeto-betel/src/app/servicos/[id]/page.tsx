import Link from "next/link";
import { notFound } from "next/navigation";

import { alternarAtivoServico } from "../actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function DetalheServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: servico } = await supabase
    .from("servico")
    .select("id, nome, descricao, ativo, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!servico) notFound();

  const alternarAtivo = alternarAtivoServico.bind(null, servico.id, servico.ativo);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{servico.nome}</h1>
          <Badge variant={servico.ativo ? "ativo" : "inativo"}>
            {servico.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/servicos/${servico.id}/editar`} className={buttonVariants({ variant: "outline" })}>
            Editar
          </Link>
          <form action={alternarAtivo}>
            <Button type="submit" variant={servico.ativo ? "destructive" : "secondary"}>
              {servico.ativo ? "Inativar" : "Ativar"}
            </Button>
          </form>
        </div>
      </div>

      <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Descrição</dt>
        <dd>{servico.descricao || "—"}</dd>
        <dt className="text-muted-foreground">Cadastrado em</dt>
        <dd>{new Date(servico.created_at).toLocaleDateString("pt-BR")}</dd>
      </dl>

      <section className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        O modelo de checklist deste serviço aparecerá aqui quando esse
        módulo for implementado.
      </section>

      <Link href="/servicos" className="text-sm text-muted-foreground underline underline-offset-4">
        ← Voltar para serviços
      </Link>
    </main>
  );
}
