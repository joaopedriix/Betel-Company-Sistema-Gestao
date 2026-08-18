"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ContratoFormState } from "./actions";

type Evento = { id: string; nome: string; clienteNome: string };
type Servico = { id: string; nome: string };

type ContratoFormProps = {
  action: (prevState: ContratoFormState, formData: FormData) => Promise<ContratoFormState>;
  eventos: Evento[];
  servicos: Servico[];
  eventoIdFixo?: string;
  servicoIdsIniciais?: string[];
  tituloBotao: string;
  cancelarHref: string;
};

const estadoInicial: ContratoFormState = {};

export function ContratoForm({
  action,
  eventos,
  servicos,
  eventoIdFixo,
  servicoIdsIniciais,
  tituloBotao,
  cancelarHref,
}: ContratoFormProps) {
  const [state, formAction, pending] = useActionState(action, estadoInicial);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {state.erroGeral ? (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {state.erroGeral}
        </p>
      ) : null}

      {eventoIdFixo ? null : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="eventoId">Evento *</Label>
          <select
            id="eventoId"
            name="eventoId"
            required
            defaultValue=""
            aria-invalid={Boolean(state.erros?.eventoId)}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Selecione um evento</option>
            {eventos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome} — {e.clienteNome}
              </option>
            ))}
          </select>
          {state.erros?.eventoId ? (
            <p className="text-xs text-destructive">{state.erros.eventoId}</p>
          ) : null}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>Serviços contratados *</Label>
        <div className="flex flex-col gap-2 rounded-lg border p-3">
          {servicos.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="servicoIds"
                value={s.id}
                defaultChecked={servicoIdsIniciais?.includes(s.id)}
                className="size-4 rounded border-input"
              />
              {s.nome}
            </label>
          ))}
        </div>
        {state.erros?.servicoIds ? (
          <p className="text-xs text-destructive">{state.erros.servicoIds}</p>
        ) : null}
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
