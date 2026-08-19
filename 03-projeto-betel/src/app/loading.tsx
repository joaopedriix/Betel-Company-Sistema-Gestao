export default function Loading() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-8">
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
      <div className="flex flex-col gap-3">
        <div className="h-20 animate-pulse rounded-lg border bg-muted/50" />
        <div className="h-20 animate-pulse rounded-lg border bg-muted/50" />
        <div className="h-20 animate-pulse rounded-lg border bg-muted/50" />
      </div>
    </main>
  );
}
