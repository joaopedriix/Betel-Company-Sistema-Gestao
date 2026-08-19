import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center gap-3 p-6 py-16 text-center sm:p-8">
      <h1 className="text-xl font-semibold">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <Link href="/dashboard" className={buttonVariants()}>
        Voltar ao início
      </Link>
    </main>
  );
}
