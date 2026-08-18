export type TarefaParaProgresso = { status: string };

// Progresso = concluídas / total. Evento sem tarefas retorna 0 (evita
// divisão por zero) em vez de NaN.
export function calcularProgresso(tarefas: TarefaParaProgresso[]): number {
  if (tarefas.length === 0) return 0;
  const concluidas = tarefas.filter((t) => t.status === "concluida").length;
  return Math.round((concluidas / tarefas.length) * 100);
}

export type TarefaParaAtraso = { status: string; prazo: string | null };

// "Atrasada" é estado derivado, não um status próprio: prazo vencido
// (estritamente anterior a hoje) e status ainda não "concluida". Uma
// tarefa concluída no prazo ou depois do prazo não conta como atrasada
// -- já foi resolvida, só chegou tarde.
export function estaAtrasada(tarefa: TarefaParaAtraso, hojeISO: string): boolean {
  if (tarefa.status === "concluida") return false;
  if (!tarefa.prazo) return false;
  return tarefa.prazo < hojeISO;
}
