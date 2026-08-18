"use server";

import { getUsuarioAtual } from "@/lib/auth/usuario-atual";
import { createClient } from "@/lib/supabase/server";
import { ONBOARDING_VERSAO } from "@/lib/onboarding/config";

// Chamada ao concluir ou pular o tour — os dois casos marcam a versão
// atual como vista, para não reaparecer sozinho de novo. "Refazer dicas"
// reabre a UI no client sem precisar desmarcar nada aqui.
export async function concluirOnboarding() {
  const usuario = await getUsuarioAtual();
  if (!usuario) return;

  const supabase = await createClient();
  // RLS: policy usuario_self_update_onboarding (migration 0004) permite
  // ao próprio usuário atualizar sua linha; o trigger fn_usuario_self_update_guard
  // bloqueia qualquer campo além dos de onboarding, mesmo com essa policy
  // aberta por linha inteira.
  await supabase
    .from("usuario")
    .update({
      onboarding_concluido: true,
      onboarding_versao: ONBOARDING_VERSAO,
      onboarding_concluido_em: new Date().toISOString(),
    })
    .eq("id", usuario.id);
}
