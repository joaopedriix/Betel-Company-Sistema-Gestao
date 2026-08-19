"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center gap-3 p-6 py-16 text-center sm:p-8">
      <h1 className="text-xl font-semibold">Algo deu errado</h1>
      <p role="alert" className="max-w-sm text-sm text-muted-foreground">
        Não foi possível carregar esta página. Tente novamente — se o problema
        continuar, avise o suporte.
      </p>
      <Button type="button" onClick={reset}>
        Tentar novamente
      </Button>
    </main>
  );
}
