import Link from "next/link";
import { notFound } from "next/navigation";

import { alternarAtivoServico } from "../actions";
import { alternarAtivoTarefaPadrao, criarChecklistModelo } from "./checklist-actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

const LABEL_PRIORIDADE: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

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

  const { data: checklist } = await supabase
    .from("checklist_modelo")
    .select("id, nome")
    .eq("servico_id", id)
    .maybeSingle();

  const { data: tarefasData } = checklist
    ? await supabase
        .from("tarefa_padrao")
        .select(
          "id, nome, prioridade, ordem, ativo, visivel_ao_cliente, responsavel_padrao_id, usuario:responsavel_padrao_id(nome)",
        )
        .eq("checklist_modelo_id", checklist.id)
        .order("ordem", { ascending: true })
    : { data: null };

  type TarefaPadraoRow = {
    id: string;
    nome: string;
    prioridade: string;
    ordem: number;
    ativo: boolean;
    visivel_ao_cliente: boolean;
    responsavel_padrao_id: string | null;
    usuario: { nome: string } | null;
  };
  const tarefas = (tarefasData ?? []) as unknown as TarefaPadraoRow[];

  const alternarAtivo = alternarAtivoServico.bind(null, servico.id, servico.ativo);
  const criarChecklist = criarChecklistModelo.bind(null, servico.id);

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

      <section className="flex flex-col gap-4 rounded-lg border p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Checklist do serviço</h2>
          {checklist ? (
            <Link
              href={`/servicos/${servico.id}/checklist/nova`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Nova tarefa
            </Link>
          ) : null}
        </div>

        {!checklist ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Este serviço ainda não tem um checklist configurado.
            </p>
            <form action={criarChecklist}>
              <Button type="submit" size="sm">
                Criar checklist
              </Button>
            </form>
          </div>
        ) : tarefas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma tarefa padrão cadastrada ainda neste checklist.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Nome</th>
                  <th className="px-3 py-2 font-medium">Responsável padrão</th>
                  <th className="px-3 py-2 font-medium">Prioridade</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {tarefas.map((t) => {
                  const alternarTarefa = alternarAtivoTarefaPadrao.bind(
                    null,
                    t.id,
                    t.ativo,
                    servico.id,
                  );
                  return (
                    <tr key={t.id} className="border-t">
                      <td className="px-3 py-2 text-muted-foreground">{t.ordem}</td>
                      <td className="px-3 py-2 font-medium">{t.nome}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {t.usuario?.nome ?? "—"}
                      </td>
                      <td className="px-3 py-2">{LABEL_PRIORIDADE[t.prioridade] ?? t.prioridade}</td>
                      <td className="px-3 py-2">
                        <Badge variant={t.ativo ? "ativo" : "inativo"}>
                          {t.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/servicos/${servico.id}/checklist/${t.id}/editar`}
                            className={buttonVariants({ variant: "ghost", size: "sm" })}
                          >
                            Editar
                          </Link>
                          <form action={alternarTarefa}>
                            <Button type="submit" variant="ghost" size="sm">
                              {t.ativo ? "Inativar" : "Ativar"}
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Link href="/servicos" className="text-sm text-muted-foreground underline underline-offset-4">
        ← Voltar para serviços
      </Link>
    </main>
  );
}
