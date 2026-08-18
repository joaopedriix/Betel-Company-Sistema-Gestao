"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ClienteFormState } from "./actions";

type ClienteFormProps = {
  action: (
    prevState: ClienteFormState,
    formData: FormData,
  ) => Promise<ClienteFormState>;
  valoresIniciais?: { nome: string; email: string; telefone: string };
  tituloBotao: string;
  cancelarHref: string;
};

const estadoInicial: ClienteFormState = {};

export function ClienteForm({
  action,
  valoresIniciais,
  tituloBotao,
  cancelarHref,
}: ClienteFormProps) {
  const [state, formAction, pending] = useActionState(action, estadoInicial);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {state.erroGeral ? (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {state.erroGeral}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nome">Nome *</Label>
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={valoresIniciais?.email}
          aria-invalid={Boolean(state.erros?.email)}
        />
        {state.erros?.email ? (
          <p className="text-xs text-destructive">{state.erros.email}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          name="telefone"
          defaultValue={valoresIniciais?.telefone}
          aria-invalid={Boolean(state.erros?.telefone)}
        />
        {state.erros?.telefone ? (
          <p className="text-xs text-destructive">{state.erros.telefone}</p>
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
