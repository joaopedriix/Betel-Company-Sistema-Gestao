"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { fecharContrato, type FecharContratoState } from "../actions";

const estadoInicial: FecharContratoState = {};

export function FecharContratoButton({ contratoId }: { contratoId: string }) {
  const acao = fecharContrato.bind(null, contratoId);
  const [state, formAction, pending] = useActionState(acao, estadoInicial);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <Button type="submit" disabled={pending}>
        {pending ? "Fechando..." : "Fechar contrato"}
      </Button>
      {state.erro ? (
        <p role="alert" className="text-xs text-destructive">
          {state.erro}
        </p>
      ) : null}
    </form>
  );
}
