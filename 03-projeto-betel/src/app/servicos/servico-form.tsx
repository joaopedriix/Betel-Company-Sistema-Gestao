"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ServicoFormState } from "./actions";

type ServicoFormProps = {
  action: (
    prevState: ServicoFormState,
    formData: FormData,
  ) => Promise<ServicoFormState>;
  valoresIniciais?: { nome: string; descricao: string };
  tituloBotao: string;
  cancelarHref: string;
};

const estadoInicial: ServicoFormState = {};

export function ServicoForm({
  action,
  valoresIniciais,
  tituloBotao,
  cancelarHref,
}: ServicoFormProps) {
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
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          name="descricao"
          defaultValue={valoresIniciais?.descricao}
          aria-invalid={Boolean(state.erros?.descricao)}
        />
        {state.erros?.descricao ? (
          <p className="text-xs text-destructive">{state.erros.descricao}</p>
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
