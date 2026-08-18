"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { EventoFormState } from "./actions";

type Cliente = { id: string; nome: string };

type EventoFormProps = {
  action: (prevState: EventoFormState, formData: FormData) => Promise<EventoFormState>;
  clientes: Cliente[];
  valoresIniciais?: { nome: string; clienteId: string; dataEvento: string };
  tituloBotao: string;
  cancelarHref: string;
};

const estadoInicial: EventoFormState = {};

export function EventoForm({
  action,
  clientes,
  valoresIniciais,
  tituloBotao,
  cancelarHref,
}: EventoFormProps) {
  const [state, formAction, pending] = useActionState(action, estadoInicial);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {state.erroGeral ? (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {state.erroGeral}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nome">Nome do evento *</Label>
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
        <Label htmlFor="clienteId">Cliente *</Label>
        <select
          id="clienteId"
          name="clienteId"
          required
          defaultValue={valoresIniciais?.clienteId ?? ""}
          aria-invalid={Boolean(state.erros?.clienteId)}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Selecione um cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {state.erros?.clienteId ? (
          <p className="text-xs text-destructive">{state.erros.clienteId}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dataEvento">Data do evento</Label>
        <Input
          id="dataEvento"
          name="dataEvento"
          type="date"
          defaultValue={valoresIniciais?.dataEvento}
          aria-invalid={Boolean(state.erros?.dataEvento)}
        />
        {state.erros?.dataEvento ? (
          <p className="text-xs text-destructive">{state.erros.dataEvento}</p>
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
