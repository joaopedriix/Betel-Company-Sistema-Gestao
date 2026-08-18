"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";

export function OnboardingTour() {
  const { open, steps, stepIndex, currentStep, next, prev, pular } = useOnboarding();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") pular();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !currentStep) return null;

  const ultimoPasso = stepIndex === steps.length - 1;

  return (
    <div
      role="region"
      aria-label="Tour guiado do sistema"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-sm flex-col gap-3 rounded-lg border bg-background p-4 shadow-lg sm:inset-x-auto sm:right-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">
            Passo {stepIndex + 1} de {steps.length}
          </p>
          <h2 className="text-sm font-semibold">{currentStep.title}</h2>
        </div>
        <button
          type="button"
          onClick={pular}
          aria-label="Fechar tour"
          className="rounded-lg p-1 text-muted-foreground hover:bg-accent/50"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground">{currentStep.description}</p>

      {currentStep.href ? (
        <Link href={currentStep.href} className="text-sm underline underline-offset-4">
          Ver agora
        </Link>
      ) : null}

      <div className="flex items-center justify-between gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={pular}>
          Pular
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={prev} disabled={stepIndex === 0}>
            Voltar
          </Button>
          <Button type="button" size="sm" onClick={next}>
            {ultimoPasso ? "Concluir" : "Avançar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
