"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUsuarioAtual } from "@/lib/auth/usuario-atual";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  gerarSenhaTemporaria,
  validarUsuario,
  type UsuarioErros,
} from "@/lib/validation/usuario";

export type UsuarioFormState = {
  erros?: UsuarioErros;
  erroGeral?: string;
};

const ERRO_GENERICO = "Não foi possível salvar o usuário. Tente novamente.";

export async function criarUsuario(
  _prevState: UsuarioFormState,
  formData: FormData,
): Promise<UsuarioFormState> {
  const campos = {
    nome: String(formData.get("nome") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    perfil: String(formData.get("perfil") ?? ""),
  };
  const erros = validarUsuario(campos);
  if (Object.keys(erros).length > 0) return { erros };

  const usuarioAtual = await getUsuarioAtual();
  if (!usuarioAtual || usuarioAtual.perfil !== "admin") {
    return { erroGeral: "Você não tem permissão para cadastrar usuários." };
  }

  // service_role só aqui: criar a conta de login é uma operação de
  // sistema que a API normal (anon key) não permite fazer em nome de
  // outra pessoa. O restante (gravar o perfil) usa o client normal do
  // admin logado, sujeito a RLS (risco R2 em 00-gestao/riscos.md).
  const admin = createAdminClient();
  const senhaTemporaria = gerarSenhaTemporaria();

  const { data: novaConta, error: erroAuth } = await admin.auth.admin.createUser({
    email: campos.email,
    password: senhaTemporaria,
    email_confirm: true,
  });

  if (erroAuth || !novaConta.user) {
    // Email já cadastrado é o caso mais comum — Supabase Auth é único
    // globalmente no projeto, não só dentro do tenant.
    return { erros: { email: "Já existe uma conta com este email." } };
  }

  const supabase = await createClient();
  const { error: erroPerfil } = await supabase.from("usuario").insert({
    id: novaConta.user.id,
    nome: campos.nome,
    email: campos.email,
    perfil: campos.perfil,
    empresa_id: usuarioAtual.empresaId,
  });

  if (erroPerfil) {
    // Rollback: não deixar uma conta de login órfã, sem perfil.
    await admin.auth.admin.deleteUser(novaConta.user.id);
    return { erroGeral: ERRO_GENERICO };
  }

  revalidatePath("/usuarios");
  redirect(`/usuarios/${novaConta.user.id}?senha=${senhaTemporaria}`);
}

export async function atualizarUsuario(
  id: string,
  _prevState: UsuarioFormState,
  formData: FormData,
): Promise<UsuarioFormState> {
  const campos = {
    nome: String(formData.get("nome") ?? "").trim(),
    email: "", // não editável nesta etapa
    perfil: String(formData.get("perfil") ?? ""),
  };
  if (!campos.nome || campos.nome.length < 2) {
    return { erros: { nome: "Informe o nome." } };
  }
  if (!["admin", "socio"].includes(campos.perfil)) {
    return { erros: { perfil: "Selecione um perfil válido." } };
  }

  const usuarioAtual = await getUsuarioAtual();
  if (!usuarioAtual || usuarioAtual.perfil !== "admin") {
    return { erroGeral: "Você não tem permissão para editar usuários." };
  }

  const supabase = await createClient();
  const { error, data } = await supabase
    .from("usuario")
    .update({ nome: campos.nome, perfil: campos.perfil })
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { erroGeral: ERRO_GENERICO };
  }

  revalidatePath("/usuarios");
  revalidatePath(`/usuarios/${id}`);
  redirect(`/usuarios/${id}`);
}

export async function alternarAtivoUsuario(id: string, ativoAtual: boolean) {
  const usuarioAtual = await getUsuarioAtual();
  if (!usuarioAtual || usuarioAtual.perfil !== "admin") return;
  if (id === usuarioAtual.id) return; // admin não desativa a própria conta

  const supabase = await createClient();
  await supabase.from("usuario").update({ ativo: !ativoAtual }).eq("id", id);

  revalidatePath("/usuarios");
  revalidatePath(`/usuarios/${id}`);
}
