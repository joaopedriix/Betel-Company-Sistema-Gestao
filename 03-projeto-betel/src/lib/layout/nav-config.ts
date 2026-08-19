import type { Perfil } from "@/lib/auth/rotas";

export type NavLink = { label: string; href: string };

export type NavEntry =
  | ({ type: "link" } & NavLink)
  | { type: "group"; label: string; items: NavLink[] };

export const NAV_BY_PERFIL: Record<Perfil, NavEntry[]> = {
  admin: [
    { type: "link", label: "Dashboard", href: "/dashboard" },
    {
      type: "group",
      label: "Cadastros",
      items: [
        { label: "Clientes", href: "/clientes" },
        { label: "Sócios/Usuários", href: "/usuarios" },
        { label: "Serviços", href: "/servicos" },
      ],
    },
    {
      type: "group",
      label: "Eventos",
      items: [
        { label: "Eventos", href: "/eventos" },
        { label: "Contratos", href: "/contratos" },
      ],
    },
    // Agrupados por serem um conjunto: evento aparece na agenda, o
    // fechamento do contrato gera o checklist como tarefas do evento.
    {
      type: "group",
      label: "Acompanhamento",
      items: [
        { label: "Agenda", href: "/agenda" },
        { label: "Checklists", href: "/checklists" },
        { label: "Tarefas", href: "/tarefas" },
      ],
    },
  ],
  socio: [
    { type: "link", label: "Minhas tarefas", href: "/minhas-tarefas" },
    { type: "link", label: "Agenda", href: "/agenda" },
  ],
  cliente: [{ type: "link", label: "Portal do cliente", href: "/portal-cliente" }],
};
