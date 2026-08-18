"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { TarefaPadraoFormState } from "./checklist-actions";

type Socio = { id: string; nome: string };

type TarefaPadraoFormProps = {
  action: (
    prevState: TarefaPadraoFormState,
    formData: FormData,
  ) => Promise<TarefaPadraoFormState>;
  socios: Socio[];
  valoresIniciais?: {
    nome: string;
    descricao: string;
    responsavelPadraoId: string;
    prazoOffsetDias: string;
    prioridade: string;
    ordem: string;
    visivelAoCliente: boolean;
  };
  tituloBotao: string;
  cancelarHref: string;
};

const estadoInicial: TarefaPadraoFormState = {};

export function TarefaPadraoForm({
  action,
  socios,
  valoresIniciais,
  tituloBotao,
  cancelarHref,
}: TarefaPadraoFormProps) {
  const [state, formAction, pending] = useActionState(action, estadoInicial);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {state.erroGeral ? (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {state.erroGeral}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nome">Nome da tarefa *</Label>
        <Input
          id="nome"
          name="nome"
          required
          defaultValue={valoresIniciais?.nome}
          aria-invalid={Boolean(state.erros?.nome)}
        />
        {state.erros?.nome ? (
          <p className="text-xs text-destructive">{state.erros.nome}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          name="descricao"
          rows={3}
          defaultValue={valoresIniciais?.descricao}
          aria-invalid={Boolean(state.erros?.descricao)}
        />
        {state.erros?.descricao ? (
          <p className="text-xs text-destructive">{state.erros.descricao}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="responsavelPadraoId">Responsável padrão</Label>
        <select
          id="responsavelPadraoId"
          name="responsavelPadraoId"
          defaultValue={valoresIniciais?.responsavelPadraoId ?? ""}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Sem responsável padrão</option>
          {socios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="prazoOffsetDias">Prazo (dias antes do evento)</Label>
          <Input
            id="prazoOffsetDias"
            name="prazoOffsetDias"
            type="number"
            defaultValue={valoresIniciais?.prazoOffsetDias ?? "0"}
            aria-invalid={Boolean(state.erros?.prazoOffsetDias)}
          />
          <p className="text-xs text-muted-foreground">Ex.: -30 = 30 dias antes do evento.</p>
          {state.erros?.prazoOffsetDias ? (
            <p className="text-xs text-destructive">{state.erros.prazoOffsetDias}</p>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="ordem">Ordem</Label>
          <Input
            id="ordem"
            name="ordem"
            type="number"
            min={0}
            defaultValue={valoresIniciais?.ordem ?? "0"}
            aria-invalid={Boolean(state.erros?.ordem)}
          />
          {state.erros?.ordem ? (
            <p className="text-xs text-destructive">{state.erros.ordem}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prioridade">Prioridade *</Label>
        <select
          id="prioridade"
          name="prioridade"
          required
          defaultValue={valoresIniciais?.prioridade ?? "media"}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
        </select>
        {state.erros?.prioridade ? (
          <p className="text-xs text-destructive">{state.erros.prioridade}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="visivelAoCliente"
          name="visivelAoCliente"
          type="checkbox"
          defaultChecked={valoresIniciais?.visivelAoCliente ?? false}
          className="size-4 rounded border-input"
        />
        <Label htmlFor="visivelAoCliente">Visível ao cliente</Label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : tituloBotao}
        </Button>
        <Link
          href={cancelarHref}
          className={cn(buttonVariants({ variant: "outline" }), pending && "pointer-events-none opacity-50")}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
