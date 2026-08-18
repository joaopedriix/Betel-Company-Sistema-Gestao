import { createClient } from "@/lib/supabase/server";
import type { Perfil } from "@/lib/auth/rotas";

export type UsuarioAtual = {
  id: string;
  perfil: Perfil;
  empresaId: string;
  nome: string;
  onboardingConcluido: boolean;
  onboardingVersao: number | null;
};

// Resolve o usuário logado + a empresa dele SEMPRE a partir do banco
// (nunca de um valor enviado pelo formulário/URL) — usado por toda
// Server Action que precisa gravar empresa_id. Usa o cliente Supabase
// autenticado com o JWT do usuário (RLS aplica; usuario_self_select
// permite ler a própria linha).
export async function getUsuarioAtual(): Promise<UsuarioAtual | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("usuario")
    .select("id, nome, perfil, empresa_id, ativo, onboarding_concluido, onboarding_versao")
    .eq("id", user.id)
    .single();

  if (!data || !data.ativo) return null;

  return {
    id: data.id,
    perfil: data.perfil as Perfil,
    empresaId: data.empresa_id as string,
    nome: data.nome as string,
    onboardingConcluido: data.onboarding_concluido as boolean,
    onboardingVersao: data.onboarding_versao as number | null,
  };
}
