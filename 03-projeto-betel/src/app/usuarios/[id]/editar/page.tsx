import { notFound } from "next/navigation";

import { atualizarUsuario } from "../../actions";
import { UsuarioForm } from "../../usuario-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: usuario } = await supabase
    .from("usuario")
    .select("id, nome, email, perfil")
    .eq("id", id)
    .maybeSingle();

  if (!usuario) notFound();

  const atualizar = atualizarUsuario.bind(null, usuario.id);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">Editar usuário</h1>
      <UsuarioForm
        action={atualizar}
        valoresIniciais={{ nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }}
        emailEditavel={false}
        tituloBotao="Salvar alterações"
        cancelarHref={`/usuarios/${usuario.id}`}
      />
    </main>
  );
}
