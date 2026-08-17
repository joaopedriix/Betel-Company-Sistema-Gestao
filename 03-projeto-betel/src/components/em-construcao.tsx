export function EmConstrucao({ titulo }: { titulo: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
        Em construção
      </span>
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      <p className="max-w-md text-sm opacity-70">
        Esta tela ainda não foi implementada. Faz parte do scaffold inicial do
        sistema Betel.
      </p>
    </main>
  );
}
