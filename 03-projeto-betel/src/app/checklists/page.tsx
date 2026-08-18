import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

type ServicoRow = {
  id: string;
  nome: string;
  ativo: boolean;
  checklist_modelo: { id: string; tarefa_padrao: { count: number }[] }[];
};

// Hub central dos checklists — cada checklist é 1:1 com um serviço e é
// editado em /servicos/[id] (não há um formulário de checklist solto).
// Esta página existe para dar uma visão geral sem precisar abrir
// serviço por serviço.
export default async function ChecklistsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("servico")
    .select("id, nome, ativo, checklist_modelo(id, tarefa_padrao(count))")
    .order("nome", { ascending: true });

  const servicos = (data ?? []) as unknown as ServicoRow[];

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Checklists</h1>
      <p className="text-sm text-muted-foreground">
        Cada serviço tem seu próprio checklist. Ao fechar um contrato, as tarefas ativas do
        checklist de cada serviço contratado viram tarefas do evento automaticamente.
      </p>

      {servicos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Serviço</th>
                <th className="px-3 py-2 font-medium">Tarefas no checklist</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {servicos.map((s) => {
                const totalTarefas = s.checklist_modelo[0]?.tarefa_padrao[0]?.count ?? 0;
                return (
                  <tr key={s.id} className="border-t">
                    <td className="px-3 py-2 font-medium">{s.nome}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {totalTarefas === 0
                        ? "Nenhuma tarefa"
                        : `${totalTarefas} tarefa${totalTarefas > 1 ? "s" : ""}`}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={s.ativo ? "ativo" : "inativo"}>
                        {s.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link href={`/servicos/${s.id}`} className="underline underline-offset-4">
                        {totalTarefas === 0 ? "Criar checklist" : "Ver checklist"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
