import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const hoje = new Date().toISOString().slice(0, 10);

  const [
    { count: contratosAbertos },
    { count: contratosFechados },
    { count: eventosTotal },
    { count: tarefasPendentes },
    { count: tarefasAtrasadas },
    { count: tarefasConcluidas },
  ] = await Promise.all([
    supabase.from("contrato").select("id", { count: "exact", head: true }).eq("status", "rascunho"),
    supabase.from("contrato").select("id", { count: "exact", head: true }).eq("status", "fechado"),
    supabase.from("evento").select("id", { count: "exact", head: true }),
    supabase.from("tarefa_evento").select("id", { count: "exact", head: true }).neq("status", "concluida"),
    supabase
      .from("tarefa_evento")
      .select("id", { count: "exact", head: true })
      .neq("status", "concluida")
      .lt("prazo", hoje),
    supabase.from("tarefa_evento").select("id", { count: "exact", head: true }).eq("status", "concluida"),
  ]);

  // Progresso por evento: só eventos com ao menos um contrato fechado (ou
  // seja, com tarefas geradas). Sem essa restrição, todo evento apareceria
  // com "0 de 0" e nenhum progresso real para mostrar.
  const { data: eventosComTarefas } = await supabase
    .from("tarefa_evento")
    .select("evento_id, status, evento:evento_id(nome)");

  type LinhaTarefa = { evento_id: string; status: string; evento: { nome: string } | null };
  const linhas = (eventosComTarefas ?? []) as unknown as LinhaTarefa[];
  const progressoPorEvento = new Map<string, { nome: string; total: number; concluidas: number }>();
  for (const linha of linhas) {
    const atual = progressoPorEvento.get(linha.evento_id) ?? {
      nome: linha.evento?.nome ?? "—",
      total: 0,
      concluidas: 0,
    };
    atual.total += 1;
    if (linha.status === "concluida") atual.concluidas += 1;
    progressoPorEvento.set(linha.evento_id, atual);
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Indicador label="Contratos em rascunho" valor={contratosAbertos ?? 0} />
        <Indicador label="Contratos fechados" valor={contratosFechados ?? 0} />
        <Indicador label="Eventos" valor={eventosTotal ?? 0} />
        <Indicador label="Tarefas pendentes" valor={tarefasPendentes ?? 0} />
        <Indicador label="Tarefas atrasadas" valor={tarefasAtrasadas ?? 0} destaque={(tarefasAtrasadas ?? 0) > 0} />
        <Indicador label="Tarefas concluídas" valor={tarefasConcluidas ?? 0} />
      </div>

      <section className="flex flex-col gap-3 rounded-lg border p-4 sm:p-6">
        <h2 className="text-lg font-medium">Progresso por evento</h2>
        {progressoPorEvento.size === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum evento com contrato fechado ainda — o progresso aparece aqui depois do
            fechamento gerar as tarefas.
          </p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {Array.from(progressoPorEvento.entries()).map(([eventoId, p]) => (
              <li key={eventoId} className="flex items-center justify-between">
                <Link href={`/eventos/${eventoId}`} className="underline underline-offset-4">
                  {p.nome}
                </Link>
                <span className="text-muted-foreground">
                  {p.concluidas} de {p.total} ({Math.round((p.concluidas / p.total) * 100)}%)
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Indicador({
  label,
  valor,
  destaque,
}: {
  label: string;
  valor: number;
  destaque?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-2xl font-semibold ${destaque ? "text-destructive" : ""}`}>{valor}</span>
    </div>
  );
}
