"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUsuarioAtual } from "@/lib/auth/usuario-atual";
import { createClient } from "@/lib/supabase/server";
import {
  validarTarefaPadrao,
  type TarefaPadraoErros,
} from "@/lib/validation/tarefa-padrao";

export type TarefaPadraoFormState = {
  erros?: TarefaPadraoErros;
  erroGeral?: string;
};

const ERRO_GENERICO = "Não foi possível salvar a tarefa padrão. Tente novamente.";

function lerCampos(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    descricao: String(formData.get("descricao") ?? "").trim(),
    responsavelPadraoId: String(formData.get("responsavelPadraoId") ?? ""),
    prazoOffsetDias: String(formData.get("prazoOffsetDias") ?? "0").trim(),
    prioridade: String(formData.get("prioridade") ?? "media"),
    ordem: String(formData.get("ordem") ?? "0").trim(),
    visivelAoCliente: formData.get("visivelAoCliente") === "on",
  };
}

// Cria o checklist_modelo do serviço (1:1) se ainda não existir — a UI só
// mostra o botão quando não há checklist, então isto é sempre a primeira
// vez para aquele serviço. empresa_id resolvido no servidor.
export async function criarChecklistModelo(servicoId: string) {
  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") return;

  const supabase = await createClient();

  const { data: servico } = await supabase
    .from("servico")
    .select("nome")
    .eq("id", servicoId)
    .maybeSingle();
  if (!servico) return;

  await supabase.from("checklist_modelo").insert({
    nome: `Checklist de ${servico.nome}`,
    servico_id: servicoId,
    empresa_id: usuario.empresaId,
  });

  revalidatePath(`/servicos/${servicoId}`);
}

export async function criarTarefaPadrao(
  checklistModeloId: string,
  servicoId: string,
  _prevState: TarefaPadraoFormState,
  formData: FormData,
): Promise<TarefaPadraoFormState> {
  const campos = lerCampos(formData);
  const erros = validarTarefaPadrao(campos);
  if (Object.keys(erros).length > 0) return { erros };

  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") {
    return { erroGeral: "Você não tem permissão para configurar checklists." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tarefa_padrao").insert({
    checklist_modelo_id: checklistModeloId,
    nome: campos.nome,
    descricao: campos.descricao || null,
    responsavel_padrao_id: campos.responsavelPadraoId || null,
    prazo_offset_dias: Number(campos.prazoOffsetDias || "0"),
    prioridade: campos.prioridade,
    ordem: Number(campos.ordem || "0"),
    visivel_ao_cliente: campos.visivelAoCliente,
    empresa_id: usuario.empresaId,
  });

  if (error) return { erroGeral: ERRO_GENERICO };

  revalidatePath(`/servicos/${servicoId}`);
  redirect(`/servicos/${servicoId}`);
}

export async function atualizarTarefaPadrao(
  id: string,
  servicoId: string,
  _prevState: TarefaPadraoFormState,
  formData: FormData,
): Promise<TarefaPadraoFormState> {
  const campos = lerCampos(formData);
  const erros = validarTarefaPadrao(campos);
  if (Object.keys(erros).length > 0) return { erros };

  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") {
    return { erroGeral: "Você não tem permissão para configurar checklists." };
  }

  const supabase = await createClient();
  const { error, data } = await supabase
    .from("tarefa_padrao")
    .update({
      nome: campos.nome,
      descricao: campos.descricao || null,
      responsavel_padrao_id: campos.responsavelPadraoId || null,
      prazo_offset_dias: Number(campos.prazoOffsetDias || "0"),
      prioridade: campos.prioridade,
      ordem: Number(campos.ordem || "0"),
      visivel_ao_cliente: campos.visivelAoCliente,
    })
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { erroGeral: ERRO_GENERICO };
  }

  revalidatePath(`/servicos/${servicoId}`);
  redirect(`/servicos/${servicoId}`);
}

export async function alternarAtivoTarefaPadrao(
  id: string,
  ativoAtual: boolean,
  servicoId: string,
) {
  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") return;

  const supabase = await createClient();
  await supabase.from("tarefa_padrao").update({ ativo: !ativoAtual }).eq("id", id);

  revalidatePath(`/servicos/${servicoId}`);
}
