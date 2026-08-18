"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUsuarioAtual } from "@/lib/auth/usuario-atual";
import { createClient } from "@/lib/supabase/server";
import { validarCliente, type ClienteErros } from "@/lib/validation/cliente";

export type ClienteFormState = {
  erros?: ClienteErros;
  erroGeral?: string;
};

function lerCampos(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    telefone: String(formData.get("telefone") ?? "").trim(),
  };
}

// Mensagem genérica de propósito: não expõe causa interna (SQL, nome de
// coluna etc.) — só o suficiente para o usuário agir.
const ERRO_GENERICO = "Não foi possível salvar o cliente. Tente novamente.";

export async function criarCliente(
  _prevState: ClienteFormState,
  formData: FormData,
): Promise<ClienteFormState> {
  const campos = lerCampos(formData);
  const erros = validarCliente(campos);
  if (Object.keys(erros).length > 0) return { erros };

  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") {
    return { erroGeral: "Você não tem permissão para cadastrar clientes." };
  }

  const supabase = await createClient();

  if (campos.email) {
    // Duplicidade dentro do mesmo tenant — RLS já restringe a leitura
    // à própria empresa, então este SELECT nunca vê outro tenant.
    const { data: existente } = await supabase
      .from("cliente")
      .select("id")
      .eq("email", campos.email)
      .maybeSingle();
    if (existente) {
      return { erros: { email: "Já existe um cliente com este email." } };
    }
  }

  // empresa_id vem do usuário logado (resolvido no servidor), nunca do
  // formulário — RLS (is_admin_of) também rejeitaria um valor diferente.
  const { error } = await supabase.from("cliente").insert({
    nome: campos.nome,
    email: campos.email || null,
    telefone: campos.telefone || null,
    empresa_id: usuario.empresaId,
  });

  if (error) {
    return { erroGeral: ERRO_GENERICO };
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function atualizarCliente(
  id: string,
  _prevState: ClienteFormState,
  formData: FormData,
): Promise<ClienteFormState> {
  const campos = lerCampos(formData);
  const erros = validarCliente(campos);
  if (Object.keys(erros).length > 0) return { erros };

  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") {
    return { erroGeral: "Você não tem permissão para editar clientes." };
  }

  const supabase = await createClient();

  if (campos.email) {
    const { data: existente } = await supabase
      .from("cliente")
      .select("id")
      .eq("email", campos.email)
      .neq("id", id)
      .maybeSingle();
    if (existente) {
      return { erros: { email: "Já existe um cliente com este email." } };
    }
  }

  // Sem empresa_id no payload de update — a coluna é imutável (trigger
  // fn_empresa_id_immutable) e RLS (cliente_admin_all) já restringe
  // update à própria empresa do admin.
  const { error, data } = await supabase
    .from("cliente")
    .update({ nome: campos.nome, email: campos.email || null, telefone: campos.telefone || null })
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { erroGeral: ERRO_GENERICO };
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}

export async function alternarAtivoCliente(id: string, ativoAtual: boolean) {
  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") return;

  const supabase = await createClient();
  await supabase.from("cliente").update({ ativo: !ativoAtual }).eq("id", id);

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
}
