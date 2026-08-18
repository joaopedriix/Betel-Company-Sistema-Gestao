import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { estaAtrasada } from "@/lib/tarefas/derivacao";

const LABEL_STATUS: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  bloqueada: "Bloqueada",
};

type TarefaRow = {
  id: string;
  nome: string;
  prazo: string | null;
  status: string;
  evento: { id: string; nome: string } | null;
  responsavel: { nome: string } | null;
};

// Visão agregada de todas as tarefas de todos os eventos — diferente de
// /minhas-tarefas (que só mostra as do próprio usuário). Existe porque a
// dor operacional do cliente é justamente não ter uma visão única de
// "o que já foi feito e o que falta" sem entrar evento por evento.
export default async function TarefasPage() {
  const supabase = await createClient();
  const hoje = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("tarefa_evento")
    .select("id, nome, prazo, status, evento:evento_id(id, nome), responsavel:responsavel_id(nome)")
    .order("prazo", { ascending: true, nullsFirst: false });

  const tarefas = (data ?? []) as unknown as TarefaRow[];
  const atrasadas = tarefas.filter((t) => estaAtrasada(t, hoje));
  const pendentes = tarefas.filter((t) => t.status !== "concluida" && !estaAtrasada(t, hoje));
  const concluidas = tarefas.filter((t) => t.status === "concluida");

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Tarefas</h1>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível carregar as tarefas. Tente novamente mais tarde.
        </p>
      ) : (
        <>
          {atrasadas.length > 0 ? (
            <TabelaTarefas titulo={`Atrasadas (${atrasadas.length})`} tarefas={atrasadas} destaque />
          ) : null}
          <TabelaTarefas titulo={`Pendentes (${pendentes.length})`} tarefas={pendentes} />
          <TabelaTarefas titulo={`Concluídas (${concluidas.length})`} tarefas={concluidas} />
        </>
      )}
    </main>
  );
}

function TabelaTarefas({
  titulo,
  tarefas,
  destaque,
}: {
  titulo: string;
  tarefas: TarefaRow[];
  destaque?: boolean;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className={`text-lg font-medium ${destaque ? "text-destructive" : ""}`}>{titulo}</h2>
      {tarefas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma tarefa aqui.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Tarefa</th>
                <th className="px-3 py-2 font-medium">Evento</th>
                <th className="px-3 py-2 font-medium">Responsável</th>
                <th className="px-3 py-2 font-medium">Prazo</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {tarefas.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{t.nome}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {t.evento ? (
                      <Link href={`/eventos/${t.evento.id}`} className="underline underline-offset-4">
                        {t.evento.nome}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{t.responsavel?.nome ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {t.prazo ? new Date(`${t.prazo}T00:00:00`).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={t.status === "concluida" ? "ativo" : "inativo"}>
                      {LABEL_STATUS[t.status] ?? t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
