import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { FecharContratoButton } from "./fechar-contrato-button";

export default async function DetalheContratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contrato } = await supabase
    .from("contrato")
    .select(
      "id, status, data_criacao, data_fechamento, cliente:cliente_id(id, nome), evento:evento_id(id, nome, data_evento)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!contrato) notFound();

  const cliente = contrato.cliente as unknown as { id: string; nome: string } | null;
  const evento = contrato.evento as unknown as {
    id: string;
    nome: string;
    data_evento: string | null;
  } | null;

  const { data: servicosData } = await supabase
    .from("contrato_servico")
    .select("servico:servico_id(id, nome)")
    .eq("contrato_id", id);

  type ServicoRow = { servico: { id: string; nome: string } | null };
  const servicos = ((servicosData ?? []) as unknown as ServicoRow[])
    .map((s) => s.servico)
    .filter((s): s is { id: string; nome: string } => s !== null);

  const rascunho = contrato.status !== "fechado";

  let totalTarefas = 0;
  let tarefasConcluidas = 0;
  if (!rascunho && evento) {
    const { count: total } = await supabase
      .from("tarefa_evento")
      .select("id", { count: "exact", head: true })
      .eq("evento_id", evento.id);
    const { count: concluidas } = await supabase
      .from("tarefa_evento")
      .select("id", { count: "exact", head: true })
      .eq("evento_id", evento.id)
      .eq("status", "concluida");
    totalTarefas = total ?? 0;
    tarefasConcluidas = concluidas ?? 0;
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Contrato — {cliente?.nome ?? "—"}</h1>
          <Badge variant={rascunho ? "inativo" : "ativo"}>
            {rascunho ? "Rascunho" : "Fechado"}
          </Badge>
        </div>
        {rascunho ? (
          <div className="flex gap-2">
            <Link
              href={`/contratos/${contrato.id}/editar`}
              className={buttonVariants({ variant: "outline" })}
            >
              Editar serviços
            </Link>
            <FecharContratoButton contratoId={contrato.id} />
          </div>
        ) : null}
      </div>

      <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Evento</dt>
        <dd>
          {evento ? (
            <Link href={`/eventos/${evento.id}`} className="underline underline-offset-4">
              {evento.nome}
            </Link>
          ) : (
            "—"
          )}
        </dd>
        <dt className="text-muted-foreground">Data do evento</dt>
        <dd>
          {evento?.data_evento
            ? new Date(`${evento.data_evento}T00:00:00`).toLocaleDateString("pt-BR")
            : "—"}
        </dd>
        <dt className="text-muted-foreground">Criado em</dt>
        <dd>{new Date(contrato.data_criacao).toLocaleDateString("pt-BR")}</dd>
        {contrato.data_fechamento ? (
          <>
            <dt className="text-muted-foreground">Fechado em</dt>
            <dd>{new Date(contrato.data_fechamento).toLocaleDateString("pt-BR")}</dd>
          </>
        ) : null}
      </dl>

      <section className="flex flex-col gap-2 rounded-lg border p-4 sm:p-6">
        <h2 className="text-lg font-medium">Serviços contratados</h2>
        {servicos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum serviço vinculado.</p>
        ) : (
          <ul className="list-inside list-disc text-sm">
            {servicos.map((s) => (
              <li key={s.id}>{s.nome}</li>
            ))}
          </ul>
        )}
      </section>

      {!rascunho ? (
        <section className="flex flex-col gap-2 rounded-lg border p-4 sm:p-6">
          <h2 className="text-lg font-medium">Progresso das tarefas</h2>
          <p className="text-sm text-muted-foreground">
            {totalTarefas === 0
              ? "Nenhuma tarefa foi gerada para este evento (nenhum serviço contratado tem checklist configurado)."
              : `${tarefasConcluidas} de ${totalTarefas} tarefas concluídas (${Math.round((tarefasConcluidas / totalTarefas) * 100)}%).`}
          </p>
        </section>
      ) : null}

      <Link href="/contratos" className="text-sm text-muted-foreground underline underline-offset-4">
        ← Voltar para contratos
      </Link>
    </main>
  );
}
