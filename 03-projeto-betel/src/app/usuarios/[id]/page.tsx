import Link from "next/link";
import { notFound } from "next/navigation";

import { alternarAtivoUsuario } from "../actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { getUsuarioAtual } from "@/lib/auth/usuario-atual";
import { createClient } from "@/lib/supabase/server";

const LABEL_PERFIL: Record<string, string> = {
  admin: "Administrador/Gestor",
  socio: "Sócio",
  cliente: "Cliente",
};

export default async function DetalheUsuarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ senha?: string }>;
}) {
  const { id } = await params;
  const { senha } = await searchParams;

  const supabase = await createClient();
  const { data: usuario } = await supabase
    .from("usuario")
    .select("id, nome, email, perfil, ativo, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!usuario) notFound();

  const usuarioAtual = await getUsuarioAtual();
  const alternarAtivo = alternarAtivoUsuario.bind(null, usuario.id, usuario.ativo);
  const podeInativar = usuarioAtual?.id !== usuario.id;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      {senha ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40">
          <p className="font-medium">
            Usuário criado. Senha temporária (anote agora — não será mostrada de novo):
          </p>
          <code className="mt-1 block rounded bg-background px-2 py-1 font-mono text-sm">
            {senha}
          </code>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{usuario.nome}</h1>
          <Badge variant={usuario.ativo ? "ativo" : "inativo"}>
            {usuario.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/usuarios/${usuario.id}/editar`} className={buttonVariants({ variant: "outline" })}>
            Editar
          </Link>
          {podeInativar ? (
            <form action={alternarAtivo}>
              <Button type="submit" variant={usuario.ativo ? "destructive" : "secondary"}>
                {usuario.ativo ? "Inativar" : "Ativar"}
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Email (login)</dt>
        <dd>{usuario.email}</dd>
        <dt className="text-muted-foreground">Perfil</dt>
        <dd>{LABEL_PERFIL[usuario.perfil] ?? usuario.perfil}</dd>
        <dt className="text-muted-foreground">Cadastrado em</dt>
        <dd>{new Date(usuario.created_at).toLocaleDateString("pt-BR")}</dd>
      </dl>

      <Link href="/usuarios" className="text-sm text-muted-foreground underline underline-offset-4">
        ← Voltar para usuários
      </Link>
    </main>
  );
}
