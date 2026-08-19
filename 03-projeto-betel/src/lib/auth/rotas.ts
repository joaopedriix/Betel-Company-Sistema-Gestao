// Mapa de autorização por perfil, compartilhado entre o middleware (proteção de
// rota) e as server actions de login (redirecionamento pós-login). O perfil é
// sempre lido de public.usuario, nunca de user_metadata (risco R1 em
// 00-gestao/riscos.md, que é gravável pelo próprio usuário).

export const ADMIN_ROUTES = [
  "/dashboard",
  "/clientes",
  "/usuarios",
  "/servicos",
  "/checklists",
  "/contratos",
  "/eventos",
  "/tarefas",
  "/agenda",
] as const;

export const SOCIO_ROUTES = ["/minhas-tarefas", "/agenda"] as const;

export const CLIENTE_ROUTES = ["/portal-cliente"] as const;

export const HOME_BY_PERFIL = {
  admin: "/dashboard",
  socio: "/minhas-tarefas",
  cliente: "/portal-cliente",
} as const;

export type Perfil = keyof typeof HOME_BY_PERFIL;

export function matchesRoute(
  pathname: string,
  routes: readonly string[],
): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
