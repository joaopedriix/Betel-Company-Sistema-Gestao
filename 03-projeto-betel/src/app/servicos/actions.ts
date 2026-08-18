"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUsuarioAtual } from "@/lib/auth/usuario-atual";
import { createClient } from "@/lib/supabase/server";
import { validarServico, type ServicoErros } from "@/lib/validation/servico";

export type ServicoFormState = {
  erros?: ServicoErros;
  erroGeral?: string;
};

const ERRO_GENERICO = "Não foi possível salvar o serviço. Tente novamente.";

function lerCampos(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    descricao: String(formData.get("descricao") ?? "").trim(),
  };
}

export async function criarServico(
  _prevState: ServicoFormState,
  formData: FormData,
): Promise<ServicoFormState> {
  const campos = lerCampos(formData);
  const erros = validarServico(campos);
  if (Object.keys(erros).length > 0) return { erros };

  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") {
    return { erroGeral: "Você não tem permissão para cadastrar serviços." };
  }

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("servico")
    .select("id")
    .ilike("nome", campos.nome)
    .maybeSingle();
  if (existente) {
    return { erros: { nome: "Já existe um serviço com este nome." } };
  }

  const { error } = await supabase.from("servico").insert({
    nome: campos.nome,
    descricao: campos.descricao || null,
    empresa_id: usuario.empresaId,
  });

  if (error) return { erroGeral: ERRO_GENERICO };

  revalidatePath("/servicos");
  redirect("/servicos");
}

export async function atualizarServico(
  id: string,
  _prevState: ServicoFormState,
  formData: FormData,
): Promise<ServicoFormState> {
  const campos = lerCampos(formData);
  const erros = validarServico(campos);
  if (Object.keys(erros).length > 0) return { erros };

  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") {
    return { erroGeral: "Você não tem permissão para editar serviços." };
  }

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("servico")
    .select("id")
    .ilike("nome", campos.nome)
    .neq("id", id)
    .maybeSingle();
  if (existente) {
    return { erros: { nome: "Já existe um serviço com este nome." } };
  }

  const { error, data } = await supabase
    .from("servico")
    .update({ nome: campos.nome, descricao: campos.descricao || null })
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { erroGeral: ERRO_GENERICO };
  }

  revalidatePath("/servicos");
  revalidatePath(`/servicos/${id}`);
  redirect(`/servicos/${id}`);
}

export async function alternarAtivoServico(id: string, ativoAtual: boolean) {
  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") return;

  const supabase = await createClient();
  await supabase.from("servico").update({ ativo: !ativoAtual }).eq("id", id);

  revalidatePath("/servicos");
  revalidatePath(`/servicos/${id}`);
}
