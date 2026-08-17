import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_ROUTES,
  CLIENTE_ROUTES,
  HOME_BY_PERFIL,
  SOCIO_ROUTES,
  matchesRoute,
  type Perfil,
} from "@/lib/auth/rotas";

// Renova o cookie de sessão do Supabase a cada request (padrão @supabase/ssr) e
// aplica a proteção de rota por perfil. Usa SEMPRE o cliente autenticado com o
// JWT do usuário (anon key + cookies) para que o RLS se aplique — nunca a
// service_role (risco R2 em 00-gestao/riscos.md).
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() revalida o JWT no servidor de Auth (não confia só no cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTES);
  const isSocioRoute = matchesRoute(pathname, SOCIO_ROUTES);
  const isClienteRoute = matchesRoute(pathname, CLIENTE_ROUTES);
  const isProtected = isAdminRoute || isSocioRoute || isClienteRoute;

  // Redireciona preservando os cookies de sessão já renovados nesta request.
  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => response.cookies.set(cookie));
    return response;
  };

  if (!user) {
    if (isProtected) return redirectTo("/login");
    return supabaseResponse;
  }

  // Perfil vem de public.usuario (RLS permite ler a própria linha). Só
  // consultamos quando a decisão de rota depende disso.
  let perfil: Perfil | undefined;
  if (isProtected || pathname === "/login") {
    const { data } = await supabase
      .from("usuario")
      .select("perfil, ativo")
      .eq("id", user.id)
      .single();
    perfil = data?.ativo ? (data.perfil as Perfil) : undefined;
  }

  // Já autenticado acessando /login: manda para a home do perfil. Se a conta
  // não tem perfil válido (sem linha em public.usuario ou inativa), deixa ficar
  // no /login (evita loop de redirecionamento).
  if (pathname === "/login") {
    if (perfil) return redirectTo(HOME_BY_PERFIL[perfil]);
    return supabaseResponse;
  }

  if (isProtected) {
    if (!perfil) return redirectTo("/login");

    const allowed =
      (isAdminRoute && perfil === "admin") ||
      (isSocioRoute && perfil === "socio") ||
      (isClienteRoute && perfil === "cliente");

    if (!allowed) return redirectTo(HOME_BY_PERFIL[perfil]);
  }

  return supabaseResponse;
}
