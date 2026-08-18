import Link from "next/link";
import { notFound } from "next/navigation";

import { atribuirResponsavelTarefa } from "./tarefas-actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function DetalheEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: evento } = await supabase
    .from("evento")
    .select("id, nome, data_evento, created_at, cliente:cliente_id(id, nome)")
    .eq("id", id)
    .maybeSingle();

  if (!evento) notFound();

  const cliente = evento.cliente as unknown as { id: string; nome: string } | null;

  const { data: contratos } = await supabase
    .from("contrato")
    .select("id, status, data_criacao")
    .eq("evento_id", id)
    .order("data_criacao", { ascending: false });

  const { data: tarefasData } = await supabase
    .from("tarefa_evento")
    .select("id, nome, status, responsavel_id")
    .eq("evento_id", id)
    .order("ordem", { ascending: true });

  const { data: socios } = await supabase
    .from("usuario")
    .select("id, nome")
    .eq("perfil", "socio")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  type TarefaRow = { id: string; nome: string; status: string; responsavel_id: string | null };
  const tarefas = (tarefasData ?? []) as TarefaRow[];

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">{evento.nome}</h1>
        <Link href={`/eventos/${evento.id}/editar`} className={buttonVariants({ variant: "outline" })}>
          Editar
        </Link>
      </div>

      <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Cliente</dt>
        <dd>{cliente?.nome ?? "—"}</dd>
        <dt className="text-muted-foreground">Data do evento</dt>
        <dd>
          {evento.data_evento
            ? new Date(`${evento.data_evento}T00:00:00`).toLocaleDateString("pt-BR")
            : "—"}
        </dd>
        <dt className="text-muted-foreground">Cadastrado em</dt>
        <dd>{new Date(evento.created_at).toLocaleDateString("pt-BR")}</dd>
      </dl>

      <section className="flex flex-col gap-3 rounded-lg border p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Contratos</h2>
          <Link
            href={`/contratos/novo?eventoId=${evento.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Novo contrato
          </Link>
        </div>
        {!contratos || contratos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum contrato para este evento ainda.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {contratos.map((c) => (
              <li key={c.id}>
                <Link href={`/contratos/${c.id}`} className="underline underline-offset-4">
                  Contrato {c.status === "fechado" ? "fechado" : "em rascunho"}
                </Link>
                {" — "}
                {new Date(c.data_criacao).toLocaleDateString("pt-BR")}
              </li>
            ))}
          </ul>
        )}
      </section>

      {tarefas.length > 0 ? (
        <section className="flex flex-col gap-3 rounded-lg border p-4 sm:p-6">
          <h2 className="text-lg font-medium">Tarefas do evento</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Tarefa</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Responsável</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {tarefas.map((t) => {
                  const atribuir = atribuirResponsavelTarefa.bind(null, evento.id, t.id);
                  return (
                    <tr key={t.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{t.nome}</td>
                      <td className="px-3 py-2">
                        <Badge variant={t.status === "concluida" ? "ativo" : "inativo"}>
                          {t.status === "concluida" ? "Concluída" : "Pendente"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <form action={atribuir} className="flex items-center gap-2">
                          <select
                            name="responsavelId"
                            defaultValue={t.responsavel_id ?? ""}
                            className="h-8 rounded-lg border border-input bg-background px-2 text-xs outline-none"
                          >
                            <option value="">Sem responsável</option>
                            {(socios ?? []).map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nome}
                              </option>
                            ))}
                          </select>
                          <Button type="submit" variant="outline" size="sm">
                            Salvar
                          </Button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <Link href="/eventos" className="text-sm text-muted-foreground underline underline-offset-4">
        ← Voltar para eventos
      </Link>
    </main>
  );
}
