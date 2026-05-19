import type { MetricCard } from './types'

type MetricsSectionProps = {
  cards: MetricCard[]
  title: string
  subtitle: string
}

export default function MetricsSection({ cards, title, subtitle }: MetricsSectionProps) {
  return (
    <section className="px-4 py-5 md:px-6">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <article key={card.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${card.iconTone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{card.title}</p>
                  <p className="mt-1 text-2xl font-bold leading-tight text-slate-900">{card.value}</p>
                  <p className="mt-1 text-xs text-emerald-600">{card.delta}</p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
