import { NextResponse } from "next/server";

import { autenticarChaveApi } from "@/lib/api/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v1/eventos -- lista os eventos da empresa dona da chave de
// API. Só leitura (v1). Ver 04-analises/integracao-api.md.
export async function GET(request: Request) {
  const auth = await autenticarChaveApi(request);
  if (!auth) {
    return NextResponse.json({ error: "Chave de API inválida ou ausente." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("evento")
    .select("id, nome, data_evento, area")
    .eq("empresa_id", auth.empresaId)
    .order("data_evento", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Não foi possível carregar os eventos." }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
