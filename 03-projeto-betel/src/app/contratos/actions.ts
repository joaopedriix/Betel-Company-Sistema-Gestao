"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUsuarioAtual } from "@/lib/auth/usuario-atual";
import { createClient } from "@/lib/supabase/server";
import { validarContrato } from "@/lib/validation/contrato";

export type ContratoFormState = {
  erros?: { eventoId?: string; servicoIds?: string };
  erroGeral?: string;
};

const ERRO_GENERICO = "Não foi possível salvar o contrato. Tente novamente.";

function lerCampos(formData: FormData) {
  return {
    eventoId: String(formData.get("eventoId") ?? ""),
    servicoIds: formData.getAll("servicoIds").map(String),
  };
}

export async function criarContrato(
  _prevState: ContratoFormState,
  formData: FormData,
): Promise<ContratoFormState> {
  const campos = lerCampos(formData);
  const erros = validarContrato(campos);
  if (Object.keys(erros).length > 0) return { erros };

  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") {
    return { erroGeral: "Você não tem permissão para cadastrar contratos." };
  }

  const supabase = await createClient();

  // Evento e serviços precisam pertencer ao mesmo tenant — RLS garante
  // isso: um ID de outro tenant simplesmente não é encontrado pelo SELECT.
  const { data: evento } = await supabase
    .from("evento")
    .select("id, cliente_id")
    .eq("id", campos.eventoId)
    .maybeSingle();
  if (!evento) {
    return { erros: { eventoId: "Evento inválido." } };
  }

  const { data: servicos } = await supabase
    .from("servico")
    .select("id")
    .in("id", campos.servicoIds);
  if (!servicos || servicos.length !== campos.servicoIds.length) {
    return { erros: { servicoIds: "Um ou mais serviços selecionados são inválidos." } };
  }

  const { data: contrato, error } = await supabase
    .from("contrato")
    .insert({
      cliente_id: evento.cliente_id,
      evento_id: evento.id,
      empresa_id: usuario.empresaId,
    })
    .select("id")
    .single();

  if (error || !contrato) return { erroGeral: ERRO_GENERICO };

  const { error: erroServicos } = await supabase.from("contrato_servico").insert(
    campos.servicoIds.map((servicoId) => ({
      contrato_id: contrato.id,
      servico_id: servicoId,
      empresa_id: usuario.empresaId,
    })),
  );

  if (erroServicos) {
    // Falha parcial: reverte o contrato criado para não deixar registro órfão.
    await supabase.from("contrato").delete().eq("id", contrato.id);
    return { erroGeral: ERRO_GENERICO };
  }

  revalidatePath("/contratos");
  redirect(`/contratos/${contrato.id}`);
}

export async function atualizarServicosContrato(
  contratoId: string,
  _prevState: ContratoFormState,
  formData: FormData,
): Promise<ContratoFormState> {
  const servicoIds = formData.getAll("servicoIds").map(String);
  if (servicoIds.length === 0) {
    return { erros: { servicoIds: "Selecione ao menos um serviço." } };
  }

  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") {
    return { erroGeral: "Você não tem permissão para editar contratos." };
  }

  const supabase = await createClient();

  const { data: contrato } = await supabase
    .from("contrato")
    .select("id, status")
    .eq("id", contratoId)
    .maybeSingle();
  if (!contrato) return { erroGeral: ERRO_GENERICO };
  if (contrato.status === "fechado") {
    return { erroGeral: "Contrato já fechado não pode ser alterado." };
  }

  const { data: servicos } = await supabase
    .from("servico")
    .select("id")
    .in("id", servicoIds);
  if (!servicos || servicos.length !== servicoIds.length) {
    return { erros: { servicoIds: "Um ou mais serviços selecionados são inválidos." } };
  }

  await supabase.from("contrato_servico").delete().eq("contrato_id", contratoId);
  const { error } = await supabase.from("contrato_servico").insert(
    servicoIds.map((servicoId) => ({
      contrato_id: contratoId,
      servico_id: servicoId,
      empresa_id: usuario.empresaId,
    })),
  );

  if (error) return { erroGeral: ERRO_GENERICO };

  revalidatePath(`/contratos/${contratoId}`);
  redirect(`/contratos/${contratoId}`);
}

export type FecharContratoState = { erro?: string };

export async function fecharContrato(
  contratoId: string,
  _prevState: FecharContratoState,
  _formData: FormData,
): Promise<FecharContratoState> {
  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") {
    return { erro: "Você não tem permissão para fechar contratos." };
  }

  const supabase = await createClient();

  // fechar_contrato() roda como o próprio usuário (SECURITY INVOKER) — RLS
  // decide se ele pode mesmo fechar este contrato especificamente.
  const { error } = await supabase.rpc("fechar_contrato", {
    p_contrato_id: contratoId,
  });

  if (error) {
    return { erro: "Não foi possível fechar o contrato. Tente novamente." };
  }

  revalidatePath(`/contratos/${contratoId}`);
  revalidatePath("/contratos");
  redirect(`/contratos/${contratoId}`);
}
