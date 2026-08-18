import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { getUsuarioAtual } from "@/lib/auth/usuario-atual";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { ONBOARDING_STEPS_POR_PERFIL, ONBOARDING_VERSAO } from "@/lib/onboarding/config";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Betel Company — Sistema de Gestão",
  description: "Sistema de gestão de eventos, agenda e checklists do grupo Betel.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Resolvido uma única vez aqui (nunca por página) — se não há usuário
  // logado (ex.: tela de /login), a barra lateral simplesmente não
  // aparece, sem precisar checar o pathname.
  const usuario = await getUsuarioAtual();

  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      <body>
        {usuario ? (
          <OnboardingProvider
            steps={ONBOARDING_STEPS_POR_PERFIL[usuario.perfil]}
            abrirAutomaticamente={
              !usuario.onboardingConcluido || usuario.onboardingVersao !== ONBOARDING_VERSAO
            }
          >
            <div className="flex min-h-screen flex-col md:flex-row">
              <Sidebar perfil={usuario.perfil} nome={usuario.nome} />
              <div className="flex-1">{children}</div>
            </div>
            <OnboardingTour />
          </OnboardingProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
