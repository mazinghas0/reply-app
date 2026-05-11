export default function AppLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Nav skeleton */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800/50 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 animate-pulse" />
            <div className="w-16 h-4 rounded bg-slate-800 animate-pulse" />
          </div>
          <div className="w-20 h-7 rounded-lg bg-slate-800 animate-pulse" />
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-4 flex flex-col gap-4">
        {/* Tab bar skeleton */}
        <div className="flex gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800/50">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 h-9 rounded-lg bg-slate-800 animate-pulse" />
          ))}
        </div>

        {/* Context selector skeleton */}
        <div className="h-10 rounded-xl bg-slate-900 border border-slate-800/50 animate-pulse" />

        {/* Textarea skeleton */}
        <div className="h-32 rounded-xl bg-slate-900 border border-slate-800/50 animate-pulse" />

        {/* Keyword pills skeleton */}
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-16 rounded-full bg-slate-800 animate-pulse" />
          ))}
        </div>

        {/* CTA button skeleton */}
        <div className="h-12 rounded-xl bg-slate-800 animate-pulse" />

        {/* Reply cards skeleton */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-900 border border-slate-800/50 animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
