import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

type ServicoRow = { id: string; nome: string; ativo: boolean };

// Hub central dos checklists — cada checklist é 1:1 com um serviço e é
// editado em /servicos/[id] (não há um formulário de checklist solto).
// Esta página existe para dar uma visão geral sem precisar abrir
// serviço por serviço.
//
// Consultas separadas (não o embed aninhado servico(checklist_modelo(
// tarefa_padrao(count)))) -- o embed de contagem de dois níveis não
// refletia tarefas recém-criadas mesmo após revalidação/restart, mesmo
// padrão de duas consultas já usado em servicos/[id]/page.tsx.
export default async function ChecklistsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("servico")
    .select("id, nome, ativo")
    .order("nome", { ascending: true });
  const servicos = (data ?? []) as ServicoRow[];

  const { data: checklists } = await supabase
    .from("checklist_modelo")
    .select("id, servico_id");
  const checklistPorServico = new Map((checklists ?? []).map((c) => [c.servico_id, c.id]));

  const { data: tarefas } = await supabase.from("tarefa_padrao").select("checklist_modelo_id");
  const totalPorChecklist = new Map<string, number>();
  for (const t of tarefas ?? []) {
    totalPorChecklist.set(
      t.checklist_modelo_id,
      (totalPorChecklist.get(t.checklist_modelo_id) ?? 0) + 1,
    );
  }

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
                const checklistId = checklistPorServico.get(s.id);
                const totalTarefas = checklistId ? (totalPorChecklist.get(checklistId) ?? 0) : 0;
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
