"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { HOME_BY_PERFIL, type Perfil } from "@/lib/auth/rotas";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

export async function signIn(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) {
    return { error: "Informe email e senha." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  // Mensagem genérica de propósito: não revela se o email existe.
  if (error) {
    return { error: "Email ou senha inválidos." };
  }

  // Perfil lido de public.usuario (nunca de user_metadata) para decidir a home.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let destino: string | undefined;
  if (user) {
    const { data: usuario } = await supabase
      .from("usuario")
      .select("perfil, ativo")
      .eq("id", user.id)
      .single();

    if (usuario?.ativo) {
      destino = HOME_BY_PERFIL[usuario.perfil as Perfil];
    }
  }

  if (!destino) {
    // Autenticou, mas não há conta ativa correspondente em public.usuario.
    await supabase.auth.signOut();
    return { error: "Conta sem acesso habilitado. Contate o administrador." };
  }

  revalidatePath("/", "layout");
  redirect(destino);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
