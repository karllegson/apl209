export default function AdminPageLoading() {
  return (
    <div
      className="fixed top-0 right-0 bottom-0 left-0 md:left-64 z-[100] flex items-center justify-center bg-slate-500/70 backdrop-blur-xl animate-fade-in"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-8 py-6 shadow-2xl border border-slate-200">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-apl-blue rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-700">Loading…</p>
      </div>
    </div>
  )
}
