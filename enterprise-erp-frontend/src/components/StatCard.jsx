
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export default function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel = 'vs. last month',
  accent = 'blue',
}) {
  const accents = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  }

  const positive = Number(change) >= 0

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value ?? '—'}
          </p>
        </div>

        {Icon && (
          <div
            className={`rounded-xl p-3 ${
              accents[accent] || accents.blue
            }`}
          >
            <Icon size={23} strokeWidth={2} />
          </div>
        )}
      </div>

      {change !== undefined && change !== null && (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${
              positive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {positive ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {Math.abs(Number(change))}%
          </span>

          <span className="text-slate-400">{changeLabel}</span>
        </div>
      )}
    </article>
  )
}
