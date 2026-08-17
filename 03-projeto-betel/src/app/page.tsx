import Link from "next/link";

const rotas = [
  ["/login", "Login"],
  ["/dashboard", "Dashboard"],
  ["/clientes", "Clientes"],
  ["/usuarios", "Usuários"],
  ["/servicos", "Serviços"],
  ["/checklists", "Checklists"],
  ["/contratos", "Contratos"],
  ["/eventos", "Eventos"],
  ["/minhas-tarefas", "Minhas tarefas"],
  ["/portal-cliente", "Portal do cliente"],
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Betel Company — Sistema de Gestão</h1>
        <p className="text-sm opacity-70">
          Scaffold inicial (Next.js + TypeScript + Tailwind + Supabase). Telas
          ainda em construção.
        </p>
      </header>
      <nav className="grid grid-cols-2 gap-3">
        {rotas.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-black/10 px-4 py-3 text-sm font-medium transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
          >
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
