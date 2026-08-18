"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUsuarioAtual } from "@/lib/auth/usuario-atual";
import { createClient } from "@/lib/supabase/server";
import { validarEvento, type EventoErros } from "@/lib/validation/evento";

export type EventoFormState = {
  erros?: EventoErros;
  erroGeral?: string;
};

const ERRO_GENERICO = "Não foi possível salvar o evento. Tente novamente.";

function lerCampos(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    clienteId: String(formData.get("clienteId") ?? ""),
    dataEvento: String(formData.get("dataEvento") ?? "").trim(),
  };
}

export async function criarEvento(
  _prevState: EventoFormState,
  formData: FormData,
): Promise<EventoFormState> {
  const campos = lerCampos(formData);
  const erros = validarEvento(campos);
  if (Object.keys(erros).length > 0) return { erros };

  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") {
    return { erroGeral: "Você não tem permissão para cadastrar eventos." };
  }

  const supabase = await createClient();

  // Cliente precisa pertencer ao mesmo tenant — RLS já garante isso (o
  // SELECT abaixo só enxerga clientes da própria empresa via cliente_admin_all),
  // então um cliente_id de outro tenant simplesmente não é encontrado aqui.
  const { data: cliente } = await supabase
    .from("cliente")
    .select("id")
    .eq("id", campos.clienteId)
    .maybeSingle();
  if (!cliente) {
    return { erros: { clienteId: "Cliente inválido." } };
  }

  const { error } = await supabase.from("evento").insert({
    nome: campos.nome,
    cliente_id: campos.clienteId,
    data_evento: campos.dataEvento || null,
    empresa_id: usuario.empresaId,
  });

  if (error) return { erroGeral: ERRO_GENERICO };

  revalidatePath("/eventos");
  redirect("/eventos");
}

export async function atualizarEvento(
  id: string,
  _prevState: EventoFormState,
  formData: FormData,
): Promise<EventoFormState> {
  const campos = lerCampos(formData);
  const erros = validarEvento(campos);
  if (Object.keys(erros).length > 0) return { erros };

  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") {
    return { erroGeral: "Você não tem permissão para editar eventos." };
  }

  const supabase = await createClient();

  const { data: cliente } = await supabase
    .from("cliente")
    .select("id")
    .eq("id", campos.clienteId)
    .maybeSingle();
  if (!cliente) {
    return { erros: { clienteId: "Cliente inválido." } };
  }

  const { error, data } = await supabase
    .from("evento")
    .update({
      nome: campos.nome,
      cliente_id: campos.clienteId,
      data_evento: campos.dataEvento || null,
    })
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { erroGeral: ERRO_GENERICO };
  }

  revalidatePath("/eventos");
  revalidatePath(`/eventos/${id}`);
  redirect(`/eventos/${id}`);
}
