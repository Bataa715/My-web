export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
    >
      <div className="h-9 w-9 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
      <div className="w-56 space-y-2" aria-hidden>
        <div className="h-3 w-full rounded-full bg-muted/50 animate-pulse" />
        <div className="h-3 w-2/3 rounded-full bg-muted/40 animate-pulse mx-auto" />
      </div>
      <span className="sr-only">Ачаалж байна…</span>
    </div>
  );
}
