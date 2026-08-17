"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-1 text-center">
          <h1 className="text-xl font-semibold">Betel Company</h1>
          <p className="text-sm opacity-70">Acesse o sistema de gestão</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="text-sm font-medium">
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              autoComplete="current-password"
              required
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          {state.error ? (
            <p
              role="alert"
              className="text-sm text-destructive"
              aria-live="polite"
            >
              {state.error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </main>
  );
}
