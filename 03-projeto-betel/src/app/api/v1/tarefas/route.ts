import { NextResponse } from "next/server";

import { autenticarChaveApi } from "@/lib/api/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/v1/tarefas -- lista tarefas da empresa dona da chave de API.
// Só leitura (v1); só campos não-sensíveis (sem `descricao` interna).
// Ver 04-analises/integracao-api.md.
export async function GET(request: Request) {
  const auth = await autenticarChaveApi(request);
  if (!auth) {
    return NextResponse.json({ error: "Chave de API inválida ou ausente." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("tarefa_evento")
    .select("id, nome, prazo, status, prioridade, evento_id")
    .eq("empresa_id", auth.empresaId)
    .order("prazo", { ascending: true, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: "Não foi possível carregar as tarefas." }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
