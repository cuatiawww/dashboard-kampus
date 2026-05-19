import type { AspectScore } from './types'

type ScoreSectionProps = {
  summary: {
    average: string
    category: string
    delta: string
  }
  aspectScores: AspectScore[]
}

export default function ScoreSection({ summary, aspectScores }: ScoreSectionProps) {
  return (
    <section className="px-4 pb-5 md:px-6">
      <div className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl bg-gradient-to-br from-teal-700 to-cyan-700 p-5 text-white shadow-md">
          <p className="text-sm font-semibold text-teal-100">Rata-rata Skor Nasional</p>
          <p className="mt-3 text-5xl font-bold leading-none">{summary.average}</p>
          <p className="mt-1 text-lg text-teal-100">/ 1000</p>
          <div className="mt-5 h-px bg-white/30" />
          <p className="mt-4 text-sm text-teal-100">Kategori</p>
          <p className="mt-1 text-lg font-semibold">{summary.category}</p>
          <p className="mt-4 text-sm text-emerald-200">{summary.delta}</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Rata-rata Skor per Aspek</h2>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Lihat Detail
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {aspectScores.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-800">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${item.tone}`} style={{ width: `${item.value / 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
