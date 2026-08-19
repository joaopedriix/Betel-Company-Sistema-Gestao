import { createAdminClient } from "@/lib/supabase/admin";

// Autenticação da API externa (04-analises/integracao-api.md). Não há
// sessão de usuário numa chamada de API -- por isso usa service_role
// aqui é o caso legítimo (não um bypass de R2): o empresa_id só é
// conhecido DEPOIS de validar a chave contra o hash, nunca vem do
// request. Precisa dos GRANTs comentados em
// database/proposals/0009_api_keys.sql para funcionar (ainda não
// aplicados em nenhum ambiente).
export type ApiAuthResult = { empresaId: string } | null;

async function sha256Hex(valor: string): Promise<string> {
  const dados = new TextEncoder().encode(valor);
  const hash = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function autenticarChaveApi(request: Request): Promise<ApiAuthResult> {
  const authHeader = request.headers.get("authorization") ?? "";
  const chave = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!chave) return null;

  const chaveHash = await sha256Hex(chave);
  const admin = createAdminClient();
  const { data } = await admin
    .from("api_key")
    .select("empresa_id")
    .eq("chave_hash", chaveHash)
    .eq("ativo", true)
    .maybeSingle();

  if (!data) return null;

  // Best-effort -- não bloqueia a resposta se falhar.
  void admin.from("api_key").update({ ultimo_uso_em: new Date().toISOString() }).eq("chave_hash", chaveHash);

  return { empresaId: data.empresa_id };
}
