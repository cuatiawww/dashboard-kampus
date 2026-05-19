import {
  BarChart3,
  ClipboardCheck,
  FileCheck2,
  FileSpreadsheet,
  Home,
  MapPinned,
  Medal,
  School,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import rawData from './dashboard-data.json'
import type { DashboardData, MetricCard } from './types'

const iconByMetricKey = {
  school: School,
  submit: ClipboardCheck,
  verify: ShieldCheck,
  visit: Users,
  award: Trophy,
}

export const dashboardData = rawData as DashboardData

export const metricCards: MetricCard[] = dashboardData.metrics.map((item) => ({
  title: item.title,
  value: item.value,
  delta: item.delta,
  icon: iconByMetricKey[item.iconKey as keyof typeof iconByMetricKey] ?? School,
  iconTone: item.iconTone,
}))

export const sidebarIconByKey = {
  home: Home,
  map: MapPinned,
  chart: BarChart3,
  trend: Sparkles,
  fileCheck: FileCheck2,
  shield: ShieldCheck,
  fileSheet: FileSpreadsheet,
  medal: Medal,
  settings: Settings,
}

