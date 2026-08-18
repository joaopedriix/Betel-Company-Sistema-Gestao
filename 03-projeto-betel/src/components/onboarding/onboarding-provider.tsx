"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import type { OnboardingStep } from "@/lib/onboarding/config";
import { concluirOnboarding } from "@/lib/onboarding/actions";

type OnboardingContextValue = {
  open: boolean;
  steps: OnboardingStep[];
  stepIndex: number;
  currentStep: OnboardingStep | null;
  next: () => void;
  prev: () => void;
  pular: () => void;
  reiniciar: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding precisa estar dentro de OnboardingProvider");
  return ctx;
}

export function OnboardingProvider({
  steps,
  abrirAutomaticamente,
  children,
}: {
  steps: OnboardingStep[];
  // true quando o usuário ainda não viu esta versão do tour — abre
  // sozinho no primeiro acesso, sem bloquear o resto da tela.
  abrirAutomaticamente: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(steps.length > 0 && abrirAutomaticamente);
  const [stepIndex, setStepIndex] = useState(0);

  function encerrar() {
    setOpen(false);
    void concluirOnboarding();
  }

  function next() {
    if (stepIndex >= steps.length - 1) {
      encerrar();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function prev() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function pular() {
    encerrar();
  }

  function reiniciar() {
    setStepIndex(0);
    setOpen(true);
  }

  return (
    <OnboardingContext.Provider
      value={{
        open,
        steps,
        stepIndex,
        currentStep: steps[stepIndex] ?? null,
        next,
        prev,
        pular,
        reiniciar,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
