import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
};

const LABEL_PERFIL: Record<string, string> = {
  admin: "Administrador/Gestor",
  socio: "Sócio",
  cliente: "Cliente",
};

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("usuario")
    .select("id, nome, email, perfil, ativo")
    .order("nome", { ascending: true });

  const usuarios = (data ?? []) as Usuario[];

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Sócios e usuários</h1>
        <Link href="/usuarios/novo" className={buttonVariants()}>
          Novo usuário
        </Link>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível carregar os usuários. Tente novamente mais tarde.
        </p>
      ) : usuarios.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm font-medium">Nenhum usuário cadastrado ainda.</p>
          <Link href="/usuarios/novo" className={cn(buttonVariants(), "mt-2")}>
            Cadastrar o primeiro usuário
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Nome</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Perfil</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{usuario.nome}</td>
                  <td className="px-4 py-2 text-muted-foreground">{usuario.email}</td>
                  <td className="px-4 py-2">{LABEL_PERFIL[usuario.perfil] ?? usuario.perfil}</td>
                  <td className="px-4 py-2">
                    <Badge variant={usuario.ativo ? "ativo" : "inativo"}>
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/usuarios/${usuario.id}`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
