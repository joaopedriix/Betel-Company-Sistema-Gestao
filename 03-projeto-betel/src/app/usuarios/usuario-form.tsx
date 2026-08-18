"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { UsuarioFormState } from "./actions";

type UsuarioFormProps = {
  action: (
    prevState: UsuarioFormState,
    formData: FormData,
  ) => Promise<UsuarioFormState>;
  valoresIniciais?: { nome: string; email: string; perfil: string };
  emailEditavel: boolean;
  tituloBotao: string;
  cancelarHref: string;
};

const estadoInicial: UsuarioFormState = {};

export function UsuarioForm({
  action,
  valoresIniciais,
  emailEditavel,
  tituloBotao,
  cancelarHref,
}: UsuarioFormProps) {
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
        <Label htmlFor="email">Email (login) *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          disabled={!emailEditavel}
          defaultValue={valoresIniciais?.email}
          aria-invalid={Boolean(state.erros?.email)}
        />
        {!emailEditavel ? (
          <p className="text-xs text-muted-foreground">
            O email de login não pode ser alterado nesta versão.
          </p>
        ) : null}
        {state.erros?.email ? (
          <p className="text-xs text-destructive">{state.erros.email}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="perfil">Perfil *</Label>
        <select
          id="perfil"
          name="perfil"
          required
          defaultValue={valoresIniciais?.perfil ?? "socio"}
          aria-invalid={Boolean(state.erros?.perfil)}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="admin">Administrador/Gestor</option>
          <option value="socio">Sócio</option>
        </select>
        {state.erros?.perfil ? (
          <p className="text-xs text-destructive">{state.erros.perfil}</p>
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
