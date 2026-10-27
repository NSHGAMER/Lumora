import type { ReactNode } from 'react';

export const inputClass = 'w-full rounded-xl border border-white/15 bg-[#0A1019] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400';
export const buttonClass = 'rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-500/20 focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed';
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4"><h2 className="text-xl font-heading font-semibold">{title}</h2>{children}</section>;
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-1 text-sm text-slate-300"><span>{label}</span>{children}</label>;
}
export function Feedback({ error, message }: { error?: string; message?: string }) {
  return <>{error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200">{error}</p>}{message && <p role="status" className="text-cyan-200">{message}</p>}</>;
}
export function ResourceStatus({ loading, error, reload }: { loading: boolean; error: string; reload: () => void }) {
  return <>{loading && <p role="status" className="animate-pulse text-slate-400">Loading campus records…</p>}{error && <div className="space-y-3"><Feedback error={error} /><button className={buttonClass} onClick={reload}>Retry</button></div>}</>;
}
