'use client'

import { useState } from 'react'
import DashboardHeader from '@/components/dashboard-campus/DashboardHeader'
import DashboardSidebar from '@/components/dashboard-campus/DashboardSidebar'
import ExtendedSections from '@/components/dashboard-campus/ExtendedSections'
import { dashboardData, metricCards } from '@/components/dashboard-campus/data'
import MetricsSection from '@/components/dashboard-campus/MetricsSection'
import ScoreSection from '@/components/dashboard-campus/ScoreSection'

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/35 backdrop-blur-[1px]"
        />
      ) : null}

      <DashboardSidebar open={sidebarOpen} menuGroups={dashboardData.sidebarMenu} />

      <div className="mx-auto max-w-[1600px] p-3 md:p-5">
        <DashboardHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <MetricsSection cards={metricCards} title={dashboardData.greeting.title} subtitle={dashboardData.greeting.subtitle} />
        <ScoreSection summary={dashboardData.summary} aspectScores={dashboardData.aspectScores} />
        <ExtendedSections data={dashboardData} />
      </div>
    </main>
  )
}
