import { concluirTarefa, reabrirTarefa } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUsuarioAtual } from "@/lib/auth/usuario-atual";
import { createClient } from "@/lib/supabase/server";

const LABEL_STATUS: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  bloqueada: "Bloqueada",
};

const LABEL_PRIORIDADE: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

type TarefaRow = {
  id: string;
  nome: string;
  prazo: string | null;
  prioridade: string;
  status: string;
  evento: { nome: string } | null;
};

export default async function MinhasTarefasPage() {
  const usuario = await getUsuarioAtual();
  const supabase = await createClient();

  const { data, error } = usuario
    ? await supabase
        .from("tarefa_evento")
        .select("id, nome, prazo, prioridade, status, evento:evento_id(nome)")
        .eq("responsavel_id", usuario.id)
        .order("prazo", { ascending: true, nullsFirst: false })
    : { data: null, error: null };

  const tarefas = (data ?? []) as unknown as TarefaRow[];
  const pendentes = tarefas.filter((t) => t.status !== "concluida");
  const concluidas = tarefas.filter((t) => t.status === "concluida");

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Minhas tarefas</h1>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível carregar suas tarefas. Tente novamente mais tarde.
        </p>
      ) : (
        <>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Pendentes ({pendentes.length})</h2>
        {pendentes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente atribuída a você.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Tarefa</th>
                  <th className="px-3 py-2 font-medium">Evento</th>
                  <th className="px-3 py-2 font-medium">Prazo</th>
                  <th className="px-3 py-2 font-medium">Prioridade</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {pendentes.map((t) => {
                  const concluir = concluirTarefa.bind(null, t.id);
                  return (
                    <tr key={t.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{t.nome}</td>
                      <td className="px-3 py-2 text-muted-foreground">{t.evento?.nome ?? "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {t.prazo ? new Date(`${t.prazo}T00:00:00`).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td className="px-3 py-2">{LABEL_PRIORIDADE[t.prioridade] ?? t.prioridade}</td>
                      <td className="px-3 py-2">
                        <Badge variant="inativo">{LABEL_STATUS[t.status] ?? t.status}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <form action={concluir}>
                          <Button type="submit" size="sm">
                            Concluir
                          </Button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Concluídas ({concluidas.length})</h2>
        {concluidas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma tarefa concluída ainda.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Tarefa</th>
                  <th className="px-3 py-2 font-medium">Evento</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  {usuario?.perfil === "admin" ? <th className="px-3 py-2 font-medium" /> : null}
                </tr>
              </thead>
              <tbody>
                {concluidas.map((t) => {
                  const reabrir = reabrirTarefa.bind(null, t.id);
                  return (
                    <tr key={t.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{t.nome}</td>
                      <td className="px-3 py-2 text-muted-foreground">{t.evento?.nome ?? "—"}</td>
                      <td className="px-3 py-2">
                        <Badge variant="ativo">Concluída</Badge>
                      </td>
                      {usuario?.perfil === "admin" ? (
                        <td className="px-3 py-2 text-right">
                          <form action={reabrir}>
                            <Button type="submit" variant="outline" size="sm">
                              Reabrir
                            </Button>
                          </form>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
        </>
      )}
    </main>
  );
}
