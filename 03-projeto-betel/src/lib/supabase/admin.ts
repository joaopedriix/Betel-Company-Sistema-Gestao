import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente com a service_role key — IGNORA RLS por design (risco R2 em
// 00-gestao/riscos.md). Uso restrito a operações administrativas de
// SISTEMA que a API normal do Supabase não permite com a anon key (ex.:
// criar conta de outro usuário via Admin API do Auth). NUNCA usar para
// ler/gravar dado escopado por usuário — para isso, sempre
// src/lib/supabase/server.ts (cliente com o JWT do usuário logado).
// Nunca importar este arquivo em código que roda no browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
