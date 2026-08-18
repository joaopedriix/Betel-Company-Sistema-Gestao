import { describe, expect, it } from "vitest";
import { calcularProgresso, estaAtrasada } from "@/lib/tarefas/derivacao";

describe("calcularProgresso", () => {
  it("evento sem tarefas retorna 0 (evita divisão por zero)", () => {
    expect(calcularProgresso([])).toBe(0);
  });

  it("0 de N concluídas = 0%", () => {
    const tarefas = [{ status: "pendente" }, { status: "em_andamento" }];
    expect(calcularProgresso(tarefas)).toBe(0);
  });

  it("N de N concluídas = 100%", () => {
    const tarefas = [{ status: "concluida" }, { status: "concluida" }];
    expect(calcularProgresso(tarefas)).toBe(100);
  });

  it("6 de 10 concluídas = 60%", () => {
    const tarefas = [
      ...Array.from({ length: 6 }, () => ({ status: "concluida" })),
      ...Array.from({ length: 4 }, () => ({ status: "pendente" })),
    ];
    expect(calcularProgresso(tarefas)).toBe(60);
  });

  it("arredonda percentuais não exatos", () => {
    const tarefas = [{ status: "concluida" }, { status: "pendente" }, { status: "pendente" }];
    expect(calcularProgresso(tarefas)).toBe(33);
  });
});

describe("estaAtrasada", () => {
  const HOJE = "2026-08-18";

  it("prazo vencido e não concluída = atrasada", () => {
    expect(estaAtrasada({ status: "pendente", prazo: "2026-08-17" }, HOJE)).toBe(true);
  });

  it("prazo vence hoje não é atrasada (só depois de vencer)", () => {
    expect(estaAtrasada({ status: "pendente", prazo: HOJE }, HOJE)).toBe(false);
  });

  it("tarefa concluída no prazo não é atrasada", () => {
    expect(estaAtrasada({ status: "concluida", prazo: HOJE }, HOJE)).toBe(false);
  });

  it("tarefa concluída após o prazo não é atrasada (já foi resolvida)", () => {
    expect(estaAtrasada({ status: "concluida", prazo: "2026-08-01" }, HOJE)).toBe(false);
  });

  it("sem prazo definido nunca é atrasada", () => {
    expect(estaAtrasada({ status: "pendente", prazo: null }, HOJE)).toBe(false);
  });

  it("status em_andamento com prazo vencido é atrasada", () => {
    expect(estaAtrasada({ status: "em_andamento", prazo: "2026-01-01" }, HOJE)).toBe(true);
  });
});
