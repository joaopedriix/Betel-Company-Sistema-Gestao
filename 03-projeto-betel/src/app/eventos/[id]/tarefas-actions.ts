"use server";

import { revalidatePath } from "next/cache";

import { getUsuarioAtual } from "@/lib/auth/usuario-atual";
import { createClient } from "@/lib/supabase/server";

export async function atribuirResponsavelTarefa(
  eventoId: string,
  tarefaId: string,
  formData: FormData,
) {
  const usuario = await getUsuarioAtual();
  if (!usuario || usuario.perfil !== "admin") return;

  const responsavelId = String(formData.get("responsavelId") ?? "");

  const supabase = await createClient();
  // Trigger fn_tarefa_evento_guard só bloqueia sócio trocando responsável —
  // admin (aqui) sempre pode. RLS (tarefa_evento_admin_all) garante o
  // escopo de tenant.
  await supabase
    .from("tarefa_evento")
    .update({ responsavel_id: responsavelId || null })
    .eq("id", tarefaId);

  revalidatePath(`/eventos/${eventoId}`);
}
