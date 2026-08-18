"use server";

import { revalidatePath } from "next/cache";

import { getUsuarioAtual } from "@/lib/auth/usuario-atual";
import { createClient } from "@/lib/supabase/server";

export async function concluirTarefa(id: string) {
  const usuario = await getUsuarioAtual();
  if (!usuario) return;

  const supabase = await createClient();
  // RLS (tarefa_evento_socio_update / tarefa_evento_admin_all) garante que
  // só a própria tarefa do sócio (ou qualquer uma, se admin) é afetada —
  // o filtro por responsavel_id aqui é defesa extra, não a única barreira.
  await supabase
    .from("tarefa_evento")
    .update({ status: "concluida" })
    .eq("id", id)
    .eq("responsavel_id", usuario.id);

  revalidatePath("/minhas-tarefas");
}

export async function reabrirTarefa(id: string) {
  const usuario = await getUsuarioAtual();
  // Reabertura de tarefa concluída é bloqueada para não-admin diretamente
  // no banco (trigger fn_tarefa_evento_guard) — checagem aqui é só para
  // não mostrar erro genérico de RLS ao sócio.
  if (!usuario || usuario.perfil !== "admin") return;

  const supabase = await createClient();
  await supabase.from("tarefa_evento").update({ status: "pendente" }).eq("id", id);

  revalidatePath("/minhas-tarefas");
}
