import type { Perfil } from "@/lib/auth/rotas";

export type NavLink = { label: string; href: string };

export type NavEntry =
  | ({ type: "link" } & NavLink)
  | { type: "group"; label: string; items: NavLink[] };

export const NAV_BY_PERFIL: Record<Perfil, NavEntry[]> = {
  admin: [
    { type: "link", label: "Dashboard", href: "/dashboard" },
    { type: "link", label: "Agenda", href: "/agenda" },
    {
      type: "group",
      label: "Cadastros",
      items: [
        { label: "Clientes", href: "/clientes" },
        { label: "Sócios/Usuários", href: "/usuarios" },
        { label: "Serviços", href: "/servicos" },
        { label: "Checklists", href: "/checklists" },
      ],
    },
    {
      type: "group",
      label: "Eventos",
      items: [
        { label: "Eventos", href: "/eventos" },
        { label: "Contratos", href: "/contratos" },
        { label: "Tarefas", href: "/tarefas" },
      ],
    },
  ],
  socio: [{ type: "link", label: "Minhas tarefas", href: "/minhas-tarefas" }],
  cliente: [{ type: "link", label: "Portal do cliente", href: "/portal-cliente" }],
};
