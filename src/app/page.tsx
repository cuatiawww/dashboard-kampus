'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import GeoJSON from 'ol/format/GeoJSON'
import Feature from 'ol/Feature'
import Map from 'ol/Map'
import { unByKey } from 'ol/Observable'
import View from 'ol/View'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Fill, Stroke, Style, Text } from 'ol/style'
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  Home,
  LogOut,
  MapPinned,
  Medal,
  Menu,
  FileText,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserCircle,
  X,
} from 'lucide-react'
import rawData from '@/components/dashboard-campus/dashboard-data.json'
import ProvinceMapOlComponent from '@/components/dashboard-campus/ProvinceMapOl'
import FacilityProvinceSection from '@/components/landing-backup/FacilityProvinceSection'

type MetricCard = {
  title: string
  value: string
  delta: string
  icon: string
  iconTone: string
}

type SidebarMenuGroup = {
  title: string
  items: Array<{
    label: string
    iconKey: string
    active?: boolean
  }>
}

type AspectScore = {
  label: string
  value: number
  tone: string
}

type DashboardData = {
  greeting: { title: string; subtitle: string }
  metrics: Array<{ title: string; value: string; delta: string; iconKey: string; iconTone: string }>
  summary: { average: string; category: string; delta: string }
  aspectScores: AspectScore[]
  starDistribution: Array<{ label: string; total: number; percent: number; tone: string }>
  trend: Array<{ year: string; value: number }>
  provinces: string[]
  sourceInfo: { sourceLabel: string; sourceValue: string; dateLabel: string; dateValue: string }
  sidebarMenu: SidebarMenuGroup[]
}

type ProvinceMapDetail = {
  province: string
  totalCampus: number
  averageScore: number
  category: string
  verified: number
  reportCompletion: number
  priorityCampus: number
  recommendation: string
}

const dashboardData = rawData as DashboardData

const outlineActionButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold uppercase tracking-[0.03em] text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700'

const iconByMetricKey = {
  school: '/rumah sakit.svg',
  submit: '/rumah sakit.svg',
  verify: '/rumah sakit.svg',
  visit: '/rumah sakit.svg',
  award: '/rumah sakit.svg',
}

const metricCards: MetricCard[] = dashboardData.metrics.map((item) => ({
  title: item.title,
  value: item.value,
  delta: item.delta,
  icon: iconByMetricKey[item.iconKey as keyof typeof iconByMetricKey] ?? '/faskes.svg',
  iconTone: item.iconTone,
}))

const sidebarIconByKey = {
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

const PALETTE = ['#c8ece8', '#b8e4e0', '#aadbd6', '#9ad2cd', '#8ac9c4', '#7bbfbb', '#6cb5b2']

const toneToHex: Record<string, string> = {
  'bg-emerald-500': '#10b981',
  'bg-lime-500': '#84cc16',
  'bg-yellow-500': '#eab308',
  'bg-orange-500': '#f97316',
  'bg-red-500': '#ef4444',
  'bg-teal-600': '#0d9488',
  'bg-cyan-600': '#0891b2',
  'bg-green-600': '#16a34a',
  'bg-pink-600': '#db2777',
  'bg-sky-500': '#0ea5e9',
}

const aiRecommendationSections = [
  {
    eyebrow: 'GAP ANALISIS NASIONAL',
    title: 'Capaian Kampus Sehat nasional masih menunjukkan kesenjangan antar aspek penilaian.',
    body:
      'Hasil penilaian Kampus Sehat secara nasional menunjukkan bahwa capaian perguruan tinggi belum merata pada 8 aspek penyelenggaraan. Masih terdapat jarak antara capaian aktual dengan target ideal 1000 poin atau kategori Bintang 5. Gap utama tampak pada aspek yang membutuhkan penguatan kelembagaan, kesinambungan program, bukti dukung yang lengkap, serta pemanfaatan data survei dan monitoring evaluasi sebagai dasar perbaikan.',
  },
  {
    eyebrow: 'TEMUAN UTAMA',
    title: 'Aspek dengan gap tertinggi perlu menjadi prioritas intervensi nasional.',
    body:
      'Aspek layanan kesehatan, kesehatan jiwa, survei mandiri, penelitian dan pengabdian masyarakat, serta relasi sehat perlu dibaca sebagai indikator kemampuan kampus menerjemahkan kebijakan menjadi program yang terukur, rutin, dan terdokumentasi. Rendahnya capaian pada aspek tersebut menunjukkan bahwa sebagian kampus telah memiliki komitmen awal, tetapi belum optimal dalam tata kelola pelaksanaan, konsistensi program, dan siklus perbaikan berbasis data.',
  },
]

const aiInstitutionRecommendations = [
  {
    label: 'Kementerian Kesehatan',
    text:
      'Kemenkes perlu menjadi pengampu utama standar Kampus Sehat melalui penguatan pedoman nasional, rubrik penilaian, verifikasi bukti, mekanisme visitasi, dan sistem apresiasi. Intervensi nasional sebaiknya diarahkan pada aspek dengan gap terbesar agar pendampingan lebih fokus, terukur, dan berdampak pada peningkatan kategori bintang.',
  },
  {
    label: 'Kemendikti / Kemendiktisaintek',
    text:
      'Kemendikti perlu mendorong seluruh perguruan tinggi mengadopsi Kampus Sehat sebagai bagian dari tata kelola mutu pendidikan tinggi, bukan sebagai kegiatan tambahan. Setiap kampus perlu diarahkan memiliki SK atau tim pelaksana, rencana kerja, dukungan anggaran, integrasi tridharma, survei mandiri, dan pelaporan berkala yang dapat diverifikasi.',
  },
]

function getProvinceName(properties: Record<string, unknown>) {
  const candidates = ['name', 'NAME_1', 'PROPINSI', 'PROVINSI', 'province', 'WADMPR']
  for (const key of candidates) {
    const value = properties[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function getScoreCategory(score: number) {
  if (score >= 800) return 'BINTANG 5'
  if (score >= 600) return 'BINTANG 4'
  if (score >= 400) return 'BINTANG 3'
  if (score >= 200) return 'BINTANG 2'
  return 'BINTANG 1'
}

function getProvinceMapDetail(province: string, index: number): ProvinceMapDetail {
  const seed = province.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index * 17
  const averageScore = 430 + (seed % 360)
  const priorityCampus = 2 + (seed % 11)

  return {
    province,
    totalCampus: 18 + (seed % 84),
    averageScore,
    category: getScoreCategory(averageScore),
    verified: 52 + (seed % 44),
    reportCompletion: 61 + (seed % 35),
    priorityCampus,
    recommendation: priorityCampus > 8 ? 'Prioritaskan pendampingan dan verifikasi lapangan.' : 'Pertahankan monitoring rutin dan validasi dokumen.',
  }
}

// ─────────────────────────────────────────────
// DSS DATA
// ─────────────────────────────────────────────
const dssInsights = [
  {
    id: 1,
    type: 'warning',
    icon: AlertTriangle,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    title: 'Aspek dengan capaian terendah secara nasional adalah',
    highlight: 'Penelitian & Pengabdian Masyarakat (503 poin)',
    action: 'Perlu pendampingan prioritas.',
  },
  {
    id: 2,
    type: 'info',
    icon: Star,
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-50',
    title: 'Sebanyak 57 kampus masih berada di kategori Bintang 1.',
    highlight: '',
    action: 'Perlu pendampingan prioritas.',
  },
  {
    id: 3,
    type: 'alert',
    icon: MapPinned,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50',
    title: 'Kesenjangan skor antar provinsi tertinggi 412 poin.',
    highlight: '',
    action: 'Perlu pemerataan intervensi.',
  },
  {
    id: 4,
    type: 'trend',
    icon: TrendingUp,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50',
    title: 'Kelengkapan bukti rata-rata nasional 72%.',
    highlight: '',
    action: 'Tingkatkan kualitas dan kelengkapan dokumen.',
  },
  {
    id: 5,
    type: 'warning',
    icon: Bell,
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-50',
    title: 'Sebanyak 29 kampus melewati batas waktu pembaruan data triwulan.',
    highlight: '',
    action: 'Percepat pembaruan data agar intervensi tepat waktu.',
  },
  {
    id: 6,
    type: 'info',
    icon: FileText,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    title: 'Dokumen indikator pencegahan stunting lengkap pada 61% kampus.',
    highlight: '',
    action: 'Fokus pendampingan dokumen untuk kampus di bawah target.',
  },
]

const earlyWarnings = [
  { label: 'Kampus belum submit laporan', value: 23, color: '#ef4444' },
  { label: 'Skor di bawah ambang batas', value: 41, color: '#f97316' },
  { label: 'Belum ada kunjungan verifikasi', value: 18, color: '#eab308' },
  { label: 'Dokumen tidak lengkap', value: 35, color: '#0891b2' },
]

const rekomendasiPrioritas = [
  { label: 'Penguatan Riset & Pengabdian Kesehatan', priority: 'TINGGI', impact: 90, color: '#ef4444', tone: 'text-red-600' },
  { label: 'Penguatan Layanan Kesehatan & Skrining', priority: 'TINGGI', impact: 85, color: '#3b82f6', tone: 'text-red-600' },
  { label: 'Program Kesehatan Jiwa Terintegrasi', priority: 'TINGGI', impact: 82, color: '#22c55e', tone: 'text-red-600' },
  { label: 'Pengelolaan Lingkungan Berkelanjutan', priority: 'SEDANG', impact: 70, color: '#14b8a6', tone: 'text-amber-600' },
  { label: 'Pencegahan Kekerasan & Relasi Sehat', priority: 'SEDANG', impact: 65, color: '#a855f7', tone: 'text-amber-600' },
]

// ─────────────────────────────────────────────
// KAMPUS PRIORITAS DATA
// ─────────────────────────────────────────────
const kampusPrioritasData = [
  { no: 1, name: 'Akademi Sehat Mandiri', skor: 132, kategori: 'BINTANG 1', prioritas: 'TINGGI' },
  { no: 2, name: 'STIKES Harapan Bangsa', skor: 178, kategori: 'BINTANG 1', prioritas: 'TINGGI' },
  { no: 3, name: 'Politeknik Sejahtera', skor: 215, kategori: 'BINTANG 2', prioritas: 'TINGGI' },
  { no: 4, name: 'Universitas Maju Bersama', skor: 245, kategori: 'BINTANG 2', prioritas: 'TINGGI' },
  { no: 5, name: 'Institut Kesehatan Nusantara', skor: 260, kategori: 'BINTANG 2', prioritas: 'TINGGI' },
  { no: 6, name: 'Universitas Cendekia Medika', skor: 274, kategori: 'BINTANG 2', prioritas: 'TINGGI' },
  { no: 7, name: 'Poltekkes Bina Insani', skor: 289, kategori: 'BINTANG 2', prioritas: 'TINGGI' },
  { no: 8, name: 'STIKES Mandala Husada', skor: 301, kategori: 'BINTANG 2', prioritas: 'TINGGI' },
  { no: 9, name: 'Akademi Kesehatan Pertiwi', skor: 318, kategori: 'BINTANG 2', prioritas: 'TINGGI' },
  { no: 10, name: 'Universitas Bhakti Sehat', skor: 336, kategori: 'BINTANG 2', prioritas: 'TINGGI' },
]

// ─────────────────────────────────────────────
// PROYEKSI SKOR DATA
// ─────────────────────────────────────────────
const proyeksiKampusData = [
  {
    name: 'Universitas Sehat Nusantara',
    skorSaatIni: 612,
    skorProyeksi: 872,
    kategoriSaatIni: 'BINTANG 4',
    kategoriProyeksi: 'BINTANG 5',
    aspects: [
      { label: 'Penelitian & Pengabdian Masyarakat', key: 'penelitian', defaultChecked: true, gain: 120 },
      { label: 'Pengobatan', key: 'pengobatan', defaultChecked: true, gain: 80 },
      { label: 'Kesehatan', key: 'kesehatan', defaultChecked: false, gain: 60 },
      { label: 'Kesehatan Lingkungan', key: 'lingkungan', defaultChecked: false, gain: 45 },
    ],
  },
  {
    name: 'STIKES Harapan Bangsa',
    skorSaatIni: 178,
    skorProyeksi: 390,
    kategoriSaatIni: 'BINTANG 1',
    kategoriProyeksi: 'BINTANG 2',
    aspects: [
      { label: 'Penelitian & Pengabdian Masyarakat', key: 'penelitian', defaultChecked: true, gain: 100 },
      { label: 'Pengobatan', key: 'pengobatan', defaultChecked: true, gain: 70 },
      { label: 'Kesehatan', key: 'kesehatan', defaultChecked: false, gain: 42 },
      { label: 'Kesehatan Lingkungan', key: 'lingkungan', defaultChecked: false, gain: 30 },
    ],
  },
  {
    name: 'Akademi Sehat Mandiri',
    skorSaatIni: 132,
    skorProyeksi: 320,
    kategoriSaatIni: 'BINTANG 1',
    kategoriProyeksi: 'BINTANG 2',
    aspects: [
      { label: 'Penelitian & Pengabdian Masyarakat', key: 'penelitian', defaultChecked: true, gain: 90 },
      { label: 'Pengobatan', key: 'pengobatan', defaultChecked: false, gain: 55 },
      { label: 'Kesehatan', key: 'kesehatan', defaultChecked: false, gain: 43 },
      { label: 'Kesehatan Lingkungan', key: 'lingkungan', defaultChecked: false, gain: 35 },
    ],
  },
  {
    name: 'Politeknik Sejahtera',
    skorSaatIni: 215,
    skorProyeksi: 450,
    kategoriSaatIni: 'BINTANG 2',
    kategoriProyeksi: 'BINTANG 3',
    aspects: [
      { label: 'Penelitian & Pengabdian Masyarakat', key: 'penelitian', defaultChecked: true, gain: 110 },
      { label: 'Pengobatan', key: 'pengobatan', defaultChecked: true, gain: 65 },
      { label: 'Kesehatan', key: 'kesehatan', defaultChecked: false, gain: 50 },
      { label: 'Kesehatan Lingkungan', key: 'lingkungan', defaultChecked: false, gain: 40 },
    ],
  },
  {
    name: 'Universitas Maju Bersama',
    skorSaatIni: 245,
    skorProyeksi: 510,
    kategoriSaatIni: 'BINTANG 2',
    kategoriProyeksi: 'BINTANG 3',
    aspects: [
      { label: 'Penelitian & Pengabdian Masyarakat', key: 'penelitian', defaultChecked: true, gain: 130 },
      { label: 'Pengobatan', key: 'pengobatan', defaultChecked: true, gain: 75 },
      { label: 'Kesehatan', key: 'kesehatan', defaultChecked: false, gain: 60 },
      { label: 'Kesehatan Lingkungan', key: 'lingkungan', defaultChecked: false, gain: 35 },
    ],
  },
]

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function DashboardSidebar({ open, menuGroups }: { open: boolean; menuGroups: SidebarMenuGroup[] }) {
  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen w-[280px] border-r border-teal-300/30 bg-gradient-to-b from-[#0f8f96] via-[#076176] to-[#03384d] text-slate-100 shadow-2xl transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-[3px] bg-gradient-to-r from-teal-300 via-cyan-200 to-transparent" />
      <div className="border-b border-teal-200/20 px-5 py-5">
        <p className="text-lg font-bold tracking-wide">KAMPUS SEHAT</p>
        <p className="text-xs text-teal-50/80">Kementerian Kesehatan RI</p>
      </div>
      <nav className="h-[calc(100vh-84px)] space-y-5 overflow-y-auto px-3 py-4">
        {menuGroups.map((group) => (
          <section key={group.title}>
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">{group.title}</p>
            <div className="mt-2 space-y-1.5">
              {group.items.map((item) => {
                const Icon = sidebarIconByKey[item.iconKey as keyof typeof sidebarIconByKey] ?? Home
                return (
                  <button
                    key={item.label}
                    type="button"
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold uppercase tracking-[0.03em] transition ${
                      item.active
                        ? 'bg-white/14 font-semibold text-white shadow-[inset_0_0_0_1px_rgba(94,234,212,0.55)]'
                        : 'text-teal-50/85 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  )
}

function DashboardHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [yearPickerOpen, setYearPickerOpen] = useState(false)
  const [periodeOpen, setPeriodeOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(2025)
  const [selectedPeriode, setSelectedPeriode] = useState('2025 - 2026')
  const profileRef = useRef<HTMLDivElement>(null)
  const yearPickerRef = useRef<HTMLDivElement>(null)
  const periodeRef = useRef<HTMLDivElement>(null)

  const periodeOptions = Array.from({ length: 4 }, (_, index) => {
    const startYear = selectedYear - 1 + index
    return `${startYear} - ${startYear + 1}`
  })

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false)
      if (yearPickerRef.current && !yearPickerRef.current.contains(event.target as Node)) setYearPickerOpen(false)
      if (periodeRef.current && !periodeRef.current.contains(event.target as Node)) setPeriodeOpen(false)
    }

    if (profileOpen || yearPickerOpen || periodeOpen) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [profileOpen, yearPickerOpen, periodeOpen])

  return (
    <header className="w-full border-b-2 border-teal-400/25 bg-white">
      <div className="relative flex min-h-[132px] items-stretch overflow-visible">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-95" style={{ backgroundImage: "url('/bg header.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/82 to-white/92" />
        <div className="relative grid w-full gap-5 px-4 py-5 md:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <button type="button" aria-label="Buka menu" onClick={onToggleSidebar} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition hover:bg-white">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:gap-5">
              <Image src="/Logo-Kemenkes.png" alt="Logo Kemenkes" width={170} height={62} className="h-auto w-[132px] shrink-0 md:w-[168px]" priority />
              <div className="min-w-0 border-teal-200/80 md:border-l md:pl-5">
                <h1 className="max-w-[720px] text-2xl font-extrabold leading-tight tracking-normal text-slate-900 md:text-3xl">DASHBOARD PENILAIAN KAMPUS SEHAT SECARA NASIONAL</h1>
                <p className="mt-2 max-w-[760px] text-sm leading-relaxed text-slate-600 md:text-base">Pantau perkembangan penyelenggaraan Kampus Sehat di seluruh Indonesia secara real-time.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:justify-end">
              <button type="button" className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition hover:bg-white" aria-label="Notifikasi">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 rounded-full bg-teal-600 px-1.5 text-[10px] font-semibold text-white">5</span>
              </button>
              <button type="button" className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-[13px] font-bold uppercase tracking-[0.03em] text-emerald-700 shadow-sm transition hover:bg-emerald-100">
                <Download className="h-4 w-4" />Unduh Laporan
              </button>
              <div className="relative" ref={profileRef}>
                <button type="button" onClick={() => setProfileOpen((prev) => !prev)} className="inline-flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-3 text-left shadow-sm transition hover:bg-white">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-sm font-extrabold text-white shadow-sm">AP</div>
                  <div className="hidden sm:block">
                    <p className="text-[13px] font-bold uppercase tracking-[0.03em] leading-4 text-slate-900">Admin Pusat</p>
                    <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.03em] text-teal-700">Super Admin</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
                {profileOpen ? (
                  <div className="absolute right-0 top-16 z-30 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-sm font-extrabold text-white">AP</div>
                        <div><p className="text-sm font-semibold text-slate-800">Admin Pusat</p><p className="text-xs text-slate-500">admin.pusat@kampussehat.go.id</p></div>
                      </div>
                      <button type="button" onClick={() => setProfileOpen(false)} className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Tutup"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-teal-700">Akses</p>
                      <p className="mt-0.5 text-xs text-slate-600">Pusat pemantauan nasional Kampus Sehat</p>
                    </div>
                    <div className="mt-3 space-y-2">
                      <button type="button" className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-left text-[13px] font-bold uppercase tracking-[0.03em] text-slate-700 transition hover:bg-slate-50">
                        <UserCircle className="h-4 w-4 text-teal-600" />Profil Saya
                      </button>
                      <button type="button" className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-left text-[13px] font-bold uppercase tracking-[0.03em] text-slate-700 transition hover:bg-slate-50">
                        <Settings className="h-4 w-4 text-teal-600" />Pengaturan Akun
                      </button>
                      <button type="button" className="flex w-full items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-left text-[13px] font-bold uppercase tracking-[0.03em] text-red-600 transition hover:bg-red-50">
                        <LogOut className="h-4 w-4" />Keluar
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
              <div className="relative" ref={yearPickerRef}>
                <button
                  type="button"
                  onClick={() => {
                    setYearPickerOpen((prev) => !prev)
                    setPeriodeOpen(false)
                  }}
                  className="flex min-w-[170px] items-center justify-between rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-left shadow-sm transition hover:border-teal-300"
                >
                  <span><span className="block text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">Tahun Penilaian</span><span className="text-sm font-semibold">{selectedYear}</span></span>
                  <CalendarDays className="h-4 w-4 text-teal-600" />
                </button>
                {yearPickerOpen ? (
                  <div className="absolute right-0 top-14 z-30 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                    <label className="text-xs font-semibold text-slate-500">Pilih Tahun</label>
                    <input
                      type="month"
                      value={`${selectedYear}-01`}
                      onChange={(event) => {
                        const [pickedYear] = event.target.value.split('-')
                        const yearValue = Number(pickedYear)
                        if (!Number.isNaN(yearValue)) {
                          setSelectedYear(yearValue)
                          const nextPeriodeOptions = Array.from({ length: 4 }, (_, index) => {
                            const startYear = yearValue - 1 + index
                            return `${startYear} - ${startYear + 1}`
                          })
                          const fallbackPeriode = `${yearValue} - ${yearValue + 1}`
                          if (!nextPeriodeOptions.includes(selectedPeriode)) setSelectedPeriode(fallbackPeriode)
                        }
                      }}
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none ring-teal-200 transition focus:ring-2"
                    />
                  </div>
                ) : null}
              </div>
              <div className="relative" ref={periodeRef}>
                <button
                  type="button"
                  onClick={() => {
                    setPeriodeOpen((prev) => !prev)
                    setYearPickerOpen(false)
                  }}
                  className="flex min-w-[200px] items-center justify-between rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-left shadow-sm transition hover:border-teal-300"
                >
                  <span><span className="block text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">Periode Apresiasi</span><span className="text-sm font-semibold">{selectedPeriode}</span></span>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition ${periodeOpen ? 'rotate-180' : ''}`} />
                </button>
                {periodeOpen ? (
                  <div className="absolute right-0 top-14 z-30 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    {periodeOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setSelectedPeriode(option)
                          setPeriodeOpen(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] font-bold uppercase tracking-[0.03em] transition ${
                          selectedPeriode === option ? 'bg-teal-50 font-semibold text-teal-700' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{option}</span>
                        {selectedPeriode === option ? <Check className="h-4 w-4" /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[3px] bg-gradient-to-r from-teal-400/80 via-teal-400/40 to-transparent" />
    </header>
  )
}

function MetricsSection({ cards }: { cards: MetricCard[] }) {
  return (
    <section className="px-4 py-5 md:px-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-[#cfe3e2] bg-white p-4 shadow-sm">
            <div className="flex min-h-[122px] items-center gap-3">
              <div className={`inline-flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full ${card.iconTone}`}>
                <Image src={card.icon} alt={card.title} width={36} height={36} className="h-9 w-9 object-contain" />
              </div>
              <div className="flex flex-1 flex-col">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{card.title}</p>
                <p className="mt-1 text-4xl font-extrabold leading-[0.95] tracking-tight text-slate-800">{card.value}</p>
                <p className="mt-auto pt-3 text-xs leading-relaxed text-slate-500">{card.delta}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function ProvinceMapOl({ selectedProvince }: { selectedProvince: string }) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapObjRef = useRef<Map | null>(null)
  const vectorRef = useRef<VectorLayer<VectorSource> | null>(null)
  const [activeProvince, setActiveProvince] = useState<string | null>(null)
  const [provinceDetail, setProvinceDetail] = useState<ProvinceMapDetail | null>(null)
  const baseStyle = useMemo(() => new Style({ fill: new Fill({ color: '#bde5e1' }), stroke: new Stroke({ color: '#ffffff', width: 1 }) }), [])

  useEffect(() => {
    if (!mapRef.current || mapObjRef.current) return
    const vectorSource = new VectorSource()
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        const idx = Number(feature.get('colorIdx') ?? 0)
        return new Style({ fill: new Fill({ color: PALETTE[idx % PALETTE.length] }), stroke: new Stroke({ color: '#f8fffe', width: 1 }) })
      },
    })
    vectorRef.current = vectorLayer
    const map = new Map({ target: mapRef.current, layers: [vectorLayer], view: new View({ center: [13100000, -250000], zoom: 4.4 }), controls: [] })
    mapObjRef.current = map
    const clickKey = map.on('click', (event) => {
      const feature =
        map.forEachFeatureAtPixel(event.pixel, (hitFeature) => hitFeature as Feature, {
          hitTolerance: 8,
          layerFilter: (layer) => layer === vectorLayer,
        }) ?? null
      if (!feature) {
        setActiveProvince(null)
        setProvinceDetail(null)
        return
      }

      const props = feature.getProperties() as Record<string, unknown>
      const name = getProvinceName(props)
      if (!name) return

      const idx = Number(feature.get('colorIdx') ?? 0)
      setActiveProvince(name)
      setProvinceDetail(getProvinceMapDetail(name, idx))

      const geometry = feature.getGeometry()
      if (geometry) {
        map.getView().fit(geometry.getExtent(), {
          duration: 300,
          padding: [50, 50, 50, 50],
          maxZoom: 6.8,
        })
      }
    })
    const pointerKey = map.on('pointermove', (event) => {
      if (event.dragging) return
      map.getTargetElement().style.cursor = map.hasFeatureAtPixel(event.pixel, {
        hitTolerance: 8,
        layerFilter: (layer) => layer === vectorLayer,
      }) ? 'pointer' : ''
    })
    fetch('/indonesia-provinces.geojson')
      .then((res) => res.json())
      .then((geojson) => {
        const features = new GeoJSON().readFeatures(geojson, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })
        features.forEach((feature, index) => feature.set('colorIdx', index))
        vectorSource.addFeatures(features)
        const extent = vectorSource.getExtent()
        if (features.length > 0 && extent) {
          map.getView().fit(extent, { padding: [25, 25, 25, 25], duration: 400, maxZoom: 6.2 })
        }
      })
      .catch(() => vectorLayer.setStyle(baseStyle))
    return () => {
      unByKey([clickKey, pointerKey])
      map.setTarget(undefined)
      mapObjRef.current = null
    }
  }, [baseStyle])

  useEffect(() => {
    const layer = vectorRef.current
    const source = layer?.getSource()
    if (!layer || !source) return
    const selected = selectedProvince.toLowerCase()
    const isAll = selected.includes('semua')
    const clicked = activeProvince?.toLowerCase() ?? ''
    layer.setStyle((feature) => {
      const props = feature.getProperties() as Record<string, unknown>
      const provinceName = getProvinceName(props)
      const name = provinceName.toLowerCase()
      const idx = Number(feature.get('colorIdx') ?? 0)
      const active = (!isAll && name.includes(selected)) || (!!clicked && name === clicked)
      return new Style({
        fill: new Fill({ color: active ? '#0f8f96' : PALETTE[idx % PALETTE.length] }),
        stroke: new Stroke({ color: active ? '#064e52' : '#f8fffe', width: active ? 2.5 : 1 }),
        text: active ? new Text({ text: provinceName, fill: new Fill({ color: '#0b2f32' }), stroke: new Stroke({ color: '#ffffff', width: 3 }), font: '600 11px sans-serif' }) : undefined,
      })
    })
  }, [activeProvince, selectedProvince])

  return (
    <div className="relative h-full w-full rounded-xl">
      <div ref={mapRef} className="h-full w-full rounded-xl" />
      {provinceDetail ? (
        <div className="absolute right-4 top-4 w-[min(320px,calc(100%-32px))] rounded-2xl border border-teal-200 bg-white/95 p-4 text-slate-800 shadow-[0_18px_40px_rgba(9,88,89,0.18)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-teal-700">Detail Provinsi</p>
              <h4 className="mt-1 text-base font-extrabold leading-tight text-slate-900">{provinceDetail.province}</h4>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveProvince(null)
                setProvinceDetail(null)
              }}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Tutup detail provinsi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">Kampus</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">{provinceDetail.totalCampus}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">Skor Rata-rata</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">{provinceDetail.averageScore}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">Terverifikasi</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">{provinceDetail.verified}%</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">Laporan</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">{provinceDetail.reportCompletion}%</p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-teal-700">{provinceDetail.category}</span>
              <span className="text-[11px] font-semibold text-red-600">{provinceDetail.priorityCampus} kampus prioritas</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{provinceDetail.recommendation}</p>
          </div>
        </div>
      ) : (
        <div className="absolute right-4 top-4 rounded-xl border border-teal-100 bg-white/90 px-3 py-2 text-[11px] font-semibold text-slate-500 shadow-sm">
          Klik provinsi untuk melihat detail
        </div>
      )}
      <div className="absolute bottom-4 left-4 rounded-2xl border border-[#bfe3e2] bg-[#f3fffe]/95 p-3 shadow-[0_10px_26px_rgba(9,88,89,0.12)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#2a4040]">Legenda</p>
        <p className="mt-0.5 text-[10px] text-[#5d7777]">Gradasi sebaran kampus sehat per wilayah</p>
        <ul className="mt-2 space-y-1.5">
          {[
            ['#c8ece8', 'Sangat Rendah'],
            ['#9ad2cd', 'Rendah'],
            ['#7bbfbb', 'Sedang'],
            ['#0f8f96', 'Tinggi'],
          ].map(([color, label]) => (
            <li key={label} className="flex items-center gap-2 text-[11px] text-[#324949]">
              <span className="h-3 w-3 rounded-[3px]" style={{ backgroundColor: color }} />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function AiRecommendationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(8,36,36,0.56)] p-4 backdrop-blur-[3px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-[860px] flex-col overflow-hidden rounded-[20px] border border-[#b7d9d8] bg-[#f7fffe] shadow-[0_28px_72px_rgba(0,60,60,0.26)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-recommendation-title"
      >
        <div className="border-b border-[#cfe9e8] bg-gradient-to-br from-[#effafa] to-[#dff2f1] px-5 py-4 md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#b8dcda] bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0f8f96] shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Rekomendasi AI
              </div>
              <h2 id="ai-recommendation-title" className="mt-3 text-xl font-extrabold uppercase leading-tight tracking-normal text-[#153737] md:text-2xl">
                Penilaian Kampus Sehat
              </h2>
              <p className="mt-1 max-w-[680px] text-sm leading-relaxed text-[#526f6f]">
                Analisis prioritas nasional berdasarkan capaian skor, gap aspek penilaian, dan kebutuhan penguatan tata kelola.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#bad9d8] bg-white/95 text-[#5a7070] transition hover:border-[#85c5c2] hover:bg-[#f4fbfb]"
              aria-label="Tutup modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-5 md:px-6">
          {aiRecommendationSections.map((section, index) => (
            <article key={section.eyebrow} className="rounded-2xl border border-[#d3e9e8] bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#e3f5f4] text-[#0f8f96]">
                  {index === 0 ? <TrendingUp className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[#0f8f96] md:text-base">{section.eyebrow}</p>
                  <h3 className="mt-2 text-lg font-bold leading-snug text-[#183838] md:text-xl">{section.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#4c6b6b]">{section.body}</p>
                </div>
              </div>
            </article>
          ))}

          <article className="rounded-2xl border border-[#d3e9e8] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#0f8f96]" />
              <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-[#0f8f96] md:text-base">REKOMENDASI</p>
            </div>
            <div className="space-y-3">
              {aiInstitutionRecommendations.map((item) => (
                <div key={item.label} className="rounded-xl border border-[#e0eeee] bg-[#f8fdfd] p-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-base font-bold text-[#183838]">{item.label}</h4>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#4c6b6b]">{item.text}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}

function OverviewSplitSection({ data }: { data: DashboardData }) {
  const [selectedProvince, setSelectedProvince] = useState(data.provinces[0] ?? 'Semua Provinsi')
  const [aiRecommendationOpen, setAiRecommendationOpen] = useState(false)
  return (
    <section className="px-4 pb-5 md:px-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(220px,1fr)_minmax(0,4fr)] xl:items-stretch">
        <div className="space-y-4 xl:flex xl:h-[640px] xl:flex-col xl:gap-4 xl:space-y-0">
          <article className="rounded-xl bg-gradient-to-br from-teal-700 to-cyan-700 p-5 text-white shadow-md xl:flex-[4]">
            <h3 className="text-[22px] font-bold uppercase tracking-[0.04em] text-teal-50">Rata-rata Skor Nasional</h3>
            <p className="mt-1 text-base leading-relaxed text-teal-100">Indikator ringkas performa nasional pada periode terbaru.</p>
            <p className="mt-3 text-5xl font-bold leading-none">{data.summary.average}</p>
            <p className="mt-1 text-lg text-teal-100">/ 1000</p>
            <div className="mt-5 h-px bg-white/30" />
            <p className="mt-4 text-sm text-teal-100">Kategori</p>
            <div className="mt-1 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= 4 ? 'fill-yellow-300 text-yellow-300' : 'text-teal-200'}`} />)}
              <span className="ml-1 text-lg font-semibold">{data.summary.category}</span>
            </div>
            <p className="mt-4 text-sm text-emerald-200">{data.summary.delta}</p>

            <div className="mt-6 rounded-2xl border border-white/30 bg-white/12 p-3 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-teal-50/95">Aksi Cepat</p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setAiRecommendationOpen(true)}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/20 px-3 text-[13px] font-bold uppercase tracking-[0.03em] text-white transition hover:bg-white/30"
                >
                  <Sparkles className="h-3.5 w-3.5" />Rekomendasi AI
                </button>
              </div>
            </div>
          </article>
          <article className="rounded-xl border border-slate-300 bg-slate-100 p-4 shadow-sm xl:flex-[1]">
            <h4 className="text-lg font-bold text-slate-800 md:text-xl">{data.sourceInfo.sourceLabel}:</h4>
            <p className="mt-1 text-sm text-slate-700 md:text-base">{data.sourceInfo.sourceValue}</p>
            <h4 className="mt-4 text-lg font-bold text-slate-800 md:text-xl">{data.sourceInfo.dateLabel}:</h4>
            <p className="mt-1 text-sm text-slate-700 md:text-base">{data.sourceInfo.dateValue}</p>
          </article>
        </div>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:flex xl:h-[640px] xl:flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[22px] font-bold uppercase tracking-[0.04em] text-slate-900">Peta Sebaran Penilaian Kampus Sehat Secara Nasional </h3>
            <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
              {data.provinces.map((province) => <option key={province}>{province}</option>)}
            </select>
          </div>
          <p className="mb-3 text-base leading-relaxed text-slate-600">Pemetaan ini menampilkan distribusi capaian kampus sehat antar provinsi untuk membantu identifikasi wilayah dengan performa tertinggi dan terendah.</p>
          <div className="h-[520px] overflow-hidden rounded-xl border border-dashed border-teal-200 bg-[#e6f5f3] xl:h-full xl:flex-1">
            <ProvinceMapOlComponent selectedProvince={selectedProvince} />
          </div>
        </article>
      </div>
      <AiRecommendationModal open={aiRecommendationOpen} onClose={() => setAiRecommendationOpen(false)} />
    </section>
  )
}

// Fixed color palette per bintang level (5=hijau tua → 1=merah)
const STAR_COLORS = ['#16a34a', '#84cc16', '#eab308', '#f97316', '#ef4444']

// 8 aspek bar colors matching reference
const ASPECT_BAR_COLORS = ['#0d9488', '#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f97316', '#a855f7']

// Trend data fixed with decimal values like reference
const TREND_DATA_FIXED = [
  { year: '2021', value: 412.32 },
  { year: '2022', value: 463.18 },
  { year: '2023', value: 512.67 },
  { year: '2024', value: 564.24 },
  { year: '2025', value: 612.45 },
]

// 8 aspect scores matching reference
const ASPECT_SCORES_8 = [
  { name: 'Kebijakan &\nKomitmen', value: 664, color: ASPECT_BAR_COLORS[0] },
  { name: 'Promosi\nKesehatan', value: 568, color: ASPECT_BAR_COLORS[1] },
  { name: 'Kes. Jiwa', value: 593, color: ASPECT_BAR_COLORS[2] },
  { name: 'Relasi Sehat &\nPencegahan Kel.', value: 576, color: ASPECT_BAR_COLORS[3] },
  { name: 'Pelayanan\nKesehatan Fisik', value: 620, color: ASPECT_BAR_COLORS[4] },
  { name: 'Pembinaan\nLingkungan', value: 610, color: ASPECT_BAR_COLORS[5] },
  { name: 'Penelitian &\nPengabdian Masy.', value: 503, color: ASPECT_BAR_COLORS[6] },
  { name: 'Survei &\nAsesemen Mandiri', value: 567, color: ASPECT_BAR_COLORS[7] },
]

const NATIONAL_AVG = 612.45

// Star distribution fixed data matching reference
const STAR_DIST_FIXED = [
  { label: 'Bintang 5', range: '(800 - 1000)', total: 210, percent: 17.24, color: STAR_COLORS[0] },
  { label: 'Bintang 4', range: '(600 - 799)', total: 403, percent: 33.08, color: STAR_COLORS[1] },
  { label: 'Bintang 3', range: '(400 - 599)', total: 372, percent: 30.54, color: STAR_COLORS[2] },
  { label: 'Bintang 2', range: '(200 - 399)', total: 176, percent: 14.45, color: STAR_COLORS[3] },
  { label: 'Bintang 1', range: '(1 - 199)', total: 57, percent: 4.68, color: STAR_COLORS[4] },
]

// Custom tooltip for bar chart
function AspekTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number } }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-800">{d.name.replace(/\n/g, ' ')}</p>
      <p className="text-slate-500">value : <span className="font-bold text-slate-800">{d.value}</span></p>
    </div>
  )
}

// Custom dot for line chart
function CustomDot(props: { cx?: number; cy?: number; value?: number }) {
  const { cx = 0, cy = 0 } = props
  return <circle cx={cx} cy={cy} r={5} fill="#0d9488" stroke="#fff" strokeWidth={2} />
}

// Custom label above dot
function CustomLabel(props: { x?: number; y?: number; value?: number }) {
  const { x = 0, y = 0, value } = props
  return (
    <text x={x} y={y - 10} textAnchor="middle" fontSize={11} fontWeight={600} fill="#334155">
      {value?.toFixed(2)}
    </text>
  )
}

function ScoreSection({
  starDistribution,
}: {
  aspectScores: AspectScore[]
  trend: Array<{ year: string; value: number }>
  starDistribution: Array<{ label: string; total: number; percent: number; tone: string }>
}) {
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null)
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null)

  const pieData = STAR_DIST_FIXED
  const totalCampus = pieData.reduce((acc, item) => acc + item.total, 0)

  return (
    <section className="px-4 pb-5 md:px-6">
      <div className="grid gap-4 xl:grid-cols-3 xl:items-stretch">

        {/* ── CARD 1: Distribusi Kategori Bintang ── */}
        <article className="rounded-2xl border border-[#d5e6e5] bg-white p-5 shadow-sm flex flex-col min-h-[520px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-bold uppercase tracking-[0.04em] text-slate-900">Distribusi Kategori Bintang</h2>
            <button type="button" className={outlineActionButtonClass}><Eye className="h-4 w-4" />LIHAT DETAIL</button>
          </div>
          <p className="mt-1 text-base leading-relaxed text-slate-500">Proporsi jumlah kampus pada tiap level bintang.</p>

          <div className="mt-4 flex-1 flex flex-row items-center gap-4">
            {/* Donut */}
            <div className="relative shrink-0" style={{ width: 220, height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="total"
                    innerRadius={66}
                    outerRadius={96}
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                    animationDuration={550}
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    onMouseLeave={() => setActivePieIndex(null)}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.label}
                        fill={entry.color}
                        fillOpacity={activePieIndex === null || activePieIndex === index ? 1 : 0.2}
                        style={{ transition: 'opacity 200ms ease' }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-[32px] font-extrabold leading-none text-slate-800">{totalCampus.toLocaleString('id-ID')}</p>
                <p className="text-sm text-slate-500">Kampus</p>
              </div>
            </div>

            {/* Legend di samping */}
            <div className="flex-1 space-y-2">
              {pieData.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onMouseEnter={() => setActivePieIndex(index)}
                  onMouseLeave={() => setActivePieIndex(null)}
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-2 transition ${activePieIndex === index ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 shrink-0" style={{ fill: item.color, color: item.color }} />
                    <div className="text-left leading-tight">
                      <span className="block font-semibold text-slate-800 text-[13px]">{item.label.toUpperCase()}</span>
                      <span className="text-[11px] text-slate-400">{item.range}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-700 text-[13px] whitespace-nowrap ml-2">
                    {item.total} ({item.percent}%)
                  </span>
                </button>
              ))}
            </div>
          </div>
        </article>

        {/* ── CARD 2: Rata-rata Skor per Aspek ── */}
        <article className="rounded-2xl border border-[#d5e6e5] bg-white p-5 shadow-sm flex flex-col min-h-[520px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-bold uppercase tracking-[0.04em] text-slate-900">Rata-rata Skor per Aspek</h2>
            <button type="button" className={outlineActionButtonClass}><Eye className="h-4 w-4" />LIHAT DETAIL</button>
          </div>
          <p className="mt-1 text-base leading-relaxed text-slate-500">Perbandingan nilai setiap aspek penilaian utama.</p>
          <div className="mt-3 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ASPECT_SCORES_8}
                margin={{ top: 22, right: 4, left: -20, bottom: 80 }}
                barCategoryGap="18%"
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-38}
                  textAnchor="end"
                  height={80}
                />
                <YAxis domain={[0, 1000]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} ticks={[0, 250, 500, 750, 1000]} />
                <Tooltip content={<AspekTooltip />} cursor={{ fill: 'rgba(15,23,42,0.04)' }} />
                <ReferenceLine
                  y={NATIONAL_AVG}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  strokeWidth={1.5}
                  label={{ value: `Rata-rata Nasional (${NATIONAL_AVG})`, position: 'insideBottomRight', fontSize: 9, fill: '#ef4444' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={650}
                  onMouseEnter={(_, index) => setActiveBarIndex(index)}
                  onMouseLeave={() => setActiveBarIndex(null)}
                >
                  <LabelList dataKey="value" position="top" style={{ fontSize: 10, fontWeight: 700, fill: '#334155' }} />
                  {ASPECT_SCORES_8.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      fillOpacity={activeBarIndex === null || activeBarIndex === index ? 1 : 0.3}
                      style={{ transition: 'opacity 200ms ease' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* ── CARD 3: Tren Skor Rata-rata Nasional ── */}
        <article className="rounded-2xl border border-[#d5e6e5] bg-white p-5 shadow-sm flex flex-col min-h-[520px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-bold uppercase tracking-[0.04em] text-slate-900">Tren Skor Rata-rata Nasional</h2>
            <button type="button" className={outlineActionButtonClass}><Eye className="h-4 w-4" />LIHAT DETAIL</button>
          </div>
          <p className="mt-1 text-base leading-relaxed text-slate-500">Pergerakan skor nasional dari tahun ke tahun.</p>
          <div className="mt-3 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA_FIXED} margin={{ top: 28, right: 16, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis domain={[0, 1000]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} ticks={[0, 250, 500, 750, 1000]} />
                <Tooltip
                  formatter={(value) => [Number(value ?? 0).toFixed(2), 'Skor']}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  dot={<CustomDot />}
                  activeDot={{ r: 7, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={700}
                >
                  <LabelList content={<CustomLabel />} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// NEW: DECISION SUPPORT SECTION
// ─────────────────────────────────────────────
function DecisionSupportSection() {
  const [activeTab, setActiveTab] = useState<'insight' | 'warning'>('insight')

  return (
    <article className="rounded-2xl border border-[#d5e6e5] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[20px] font-bold uppercase tracking-[0.04em] text-slate-900">Decision Support</h2>
        </div>
        <button type="button" className={`${outlineActionButtonClass} shrink-0 whitespace-nowrap`}>
          <Eye className="h-4 w-4" />LIHAT DETAIL
        </button>
      </div>
      <p className="mt-1 text-[15px] leading-relaxed text-slate-500">Ringkasan rekomendasi dan peringatan dini untuk membantu prioritas intervensi kampus.</p>

      {/* Tabs */}
      <div className="mt-3 flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('insight')}
          className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[13px] font-bold uppercase tracking-[0.02em] transition ${activeTab === 'insight' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">Ringkasan Insight</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('warning')}
          className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[13px] font-bold uppercase tracking-[0.02em] transition ${activeTab === 'warning' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Bell className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">Peringatan Dini</span>
        </button>
      </div>

      {activeTab === 'insight' ? (
        <div className="mt-3 space-y-2">
          {dssInsights.slice(0, 4).map((item) => {
            const Icon = item.icon
            return (
              <div key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.iconBg}`}>
                  <Icon className={`h-4 w-4 ${item.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] leading-relaxed text-slate-700">
                    {item.title}
                    {item.highlight ? <span className="font-semibold text-slate-900"> {item.highlight}</span> : null}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-teal-700">{item.action}</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {earlyWarnings.map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <p className="flex-1 text-[15px] text-slate-700">{item.label}</p>
              <span className="rounded-full px-2 py-0.5 text-[13px] font-bold text-white" style={{ backgroundColor: item.color }}>
                {item.value} Kampus
              </span>
            </div>
          ))}
          <p className="mt-1 text-[13px] text-slate-400">*Data diperbarui secara berkala berdasarkan laporan masuk.</p>
        </div>
      )}
    </article>
  )
}

// ─────────────────────────────────────────────
// NEW: KAMPUS PRIORITAS PENDAMPINGAN SECTION
// ─────────────────────────────────────────────
function KampusPrioritasSection() {
  return (
    <article className="rounded-2xl border border-[#d5e6e5] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[20px] font-bold uppercase tracking-[0.04em] text-slate-900">Kampus Prioritas Pendampingan</h2>
        </div>
        <button type="button" className={`${outlineActionButtonClass} shrink-0 whitespace-nowrap`}>
          <Eye className="h-4 w-4" />LIHAT DETAIL
        </button>
      </div>
      <p className="mt-1 text-[15px] leading-relaxed text-slate-500">Daftar perguruan tinggi dengan skor rendah yang membutuhkan intervensi segera.</p>

      <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-[15px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-2.5 py-2 text-left text-sm font-semibold text-slate-500">Perguruan Tinggi</th>
              <th className="px-2.5 py-2 text-center text-sm font-semibold text-slate-500">Skor</th>
              <th className="px-2.5 py-2 text-center text-sm font-semibold text-slate-500">Kategori</th>
              <th className="px-2.5 py-2 text-center text-sm font-semibold text-slate-500">Prioritas</th>
            </tr>
          </thead>
          <tbody>
            {kampusPrioritasData.slice(0, 5).map((row, i) => (
              <tr key={row.no} className={`border-b border-slate-50 transition hover:bg-teal-50/40 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                <td className="px-2.5 py-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[12px] font-bold text-slate-500">{row.no}</span>
                    <span className="font-medium leading-snug text-slate-800">{row.name}</span>
                  </div>
                </td>
                <td className="px-2.5 py-2 text-center font-bold text-slate-800">{row.skor}</td>
                <td className="px-2.5 py-2 text-center">
                  <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-yellow-200 bg-yellow-50 px-1.5 py-0.5 text-[12px] font-semibold leading-none text-yellow-700">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {row.kategori}
                  </span>
                </td>
                <td className="px-2.5 py-2 text-center">
                  <span className="inline-block rounded-full bg-red-100 px-1.5 py-0.5 text-[12px] font-bold leading-none text-red-600">
                    {row.prioritas}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

// ─────────────────────────────────────────────
// NEW: PROYEKSI SKOR (WHAT-IF ANALYSIS)
// ─────────────────────────────────────────────
function ProyeksiSkorSection() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const kampus = proyeksiKampusData[selectedIdx]

  // Track checked aspects per kampus
  const [checkedMap, setCheckedMap] = useState<Record<number, Record<string, boolean>>>(() => {
    const init: Record<number, Record<string, boolean>> = {}
    proyeksiKampusData.forEach((k, i) => {
      init[i] = {}
      k.aspects.forEach((a) => { init[i][a.key] = a.defaultChecked })
    })
    return init
  })

  const checked = checkedMap[selectedIdx] ?? {}

  const totalGain = kampus.aspects.reduce((acc, a) => acc + (checked[a.key] ? a.gain : 0), 0)
  const proyeksiSkor = Math.min(1000, kampus.skorSaatIni + totalGain)
  const maxSkor = 1000

  // Derive projected category
  function getCategory(skor: number) {
    if (skor >= 800) return 'BINTANG 5'
    if (skor >= 600) return 'BINTANG 4'
    if (skor >= 400) return 'BINTANG 3'
    if (skor >= 200) return 'BINTANG 2'
    return 'BINTANG 1'
  }

  const currentCat = getCategory(kampus.skorSaatIni)
  const projectedCat = getCategory(proyeksiSkor)

  const toggleAspect = (key: string) => {
    setCheckedMap((prev) => ({
      ...prev,
      [selectedIdx]: { ...prev[selectedIdx], [key]: !prev[selectedIdx][key] },
    }))
  }

  // Gauge math
  const pct = Math.max(0, Math.min(1, proyeksiSkor / maxSkor))
  const radius = 54
  const cx = 80
  const cy = 72
  const gaugePath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`

  return (
    <article className="rounded-2xl border border-[#d5e6e5] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-[20px] font-bold uppercase tracking-[0.04em] text-slate-900">Proyeksi Skor (What-if Analysis)</h2>
      </div>
      <p className="mt-1 text-[15px] leading-relaxed text-slate-500">Simulasi peningkatan skor jika aspek tertentu ditingkatkan.</p>

      {/* Dropdown */}
      <div className="mt-3">
        <label className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Pilih Perguruan Tinggi</label>
        <select
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[15px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          {proyeksiKampusData.map((k, i) => (
            <option key={k.name} value={i}>{k.name}</option>
          ))}
        </select>
      </div>

      {/* Aspects checklist */}
      <div className="mt-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Jika aspek berikut ditingkatkan:</p>
        <div className="mt-2 space-y-1.5">
          {kampus.aspects.map((a) => (
            <label key={a.key} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={checked[a.key] ?? false}
                onChange={() => toggleAspect(a.key)}
                className="h-4 w-4 rounded border-slate-300 accent-teal-600"
              />
              <span className="flex-1 text-[15px] text-slate-700">{a.label}</span>
              <span className="text-sm font-semibold text-teal-600">+{a.gain} poin</span>
            </label>
          ))}
        </div>
      </div>

      {/* Gauge */}
      <div className="mt-4 flex flex-col items-center">
        <svg viewBox="0 0 160 90" className="w-full max-w-[200px]" aria-label="Gauge proyeksi skor">
          {/* Background arc */}
          <path
            d={gaugePath}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
            strokeLinecap="round"
            pathLength={100}
          />
          {/* Foreground arc */}
          {pct > 0 && (
            <path
              d={gaugePath}
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${pct * 100} 100`}
              style={{ transition: 'stroke-dasharray 500ms ease' }}
            />
          )}
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          {/* Labels */}
          <text x={cx - radius - 4} y={cy + 14} fontSize="8" fill="#94a3b8" textAnchor="middle">0</text>
          <text x={cx + radius + 4} y={cy + 14} fontSize="8" fill="#94a3b8" textAnchor="middle">1000</text>
          {/* Center value */}
          <text x={cx} y={cy - 4} fontSize="18" fontWeight="bold" fill="#0f172a" textAnchor="middle" style={{ transition: 'all 500ms ease' }}>
            {proyeksiSkor.toFixed(0)}
          </text>
          <text x={cx} y={cy + 10} fontSize="7.5" fill="#64748b" textAnchor="middle">{projectedCat}</text>
        </svg>

        <div className="mt-1 flex items-center gap-3 text-base">
          <div className="text-center">
            <p className="text-slate-400">Skor Saat Ini</p>
            <p className="font-bold text-slate-700">{kampus.skorSaatIni}</p>
            <span className="mt-0.5 inline-block rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-sm font-semibold text-slate-600">{currentCat}</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <p className="text-slate-400">Skor Nasional</p>
            <p className="font-bold text-slate-700">1000</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-teal-100 bg-teal-50 px-3 py-2">
        <p className="text-base font-semibold text-teal-800">Estimasi Kategori:</p>
        <span className="flex items-center gap-1 rounded-full bg-teal-600 px-3 py-1 text-base font-bold text-white">
          <Star className="h-3 w-3 fill-white" />
          {projectedCat}{' -> '}
        </span>
      </div>
    </article>
  )
}

// ─────────────────────────────────────────────
// NEW: Combined 3-card row
// ─────────────────────────────────────────────
function RekomendasiPrioritasSection() {
  return (
    <article className="rounded-2xl border border-[#d5e6e5] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="text-[20px] font-bold uppercase tracking-[0.04em] text-slate-900">Rekomendasi Prioritas (Top 5)</h2>
        </div>
        <button type="button" className={`${outlineActionButtonClass} shrink-0 whitespace-nowrap`}>
          <Eye className="h-4 w-4" />DETAIL
        </button>
      </div>
      <p className="mt-1 text-[15px] leading-relaxed text-slate-500">Area intervensi dengan dampak terbesar untuk peningkatan Kampus Sehat.</p>

      <div className="mt-3 space-y-2">
        {rekomendasiPrioritas.map((item, index) => (
          <div key={item.label} className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-[0_1px_8px_rgba(15,23,42,0.04)]">
            <div className="flex items-start gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold"
                style={{ backgroundColor: `${item.color}12`, color: item.color }}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">{item.label}</p>
                <div className="mt-1 flex items-center gap-3 text-[13px]">
                  <span className="text-slate-500">
                    Prioritas: <strong className={item.tone}>{item.priority}</strong>
                  </span>
                  <span className="text-slate-500">Dampak</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#0f8f7f] transition-[width] duration-700"
                      style={{ width: `${item.impact}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-[13px] font-bold text-teal-700">{item.impact}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

function DecisionSupportSystemIntro() {
  return (
    <section className="px-4 pb-5 md:px-6">
      <div className="relative overflow-hidden rounded-2xl border border-[#bfe3e2] bg-white shadow-sm">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-95" style={{ backgroundImage: "url('/bg header.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/84 to-white/92" />
        <div className="relative px-5 py-5 md:px-6">
          <div className="max-w-5xl">
            <h2 className="mt-1 text-[28px] font-extrabold uppercase leading-tight tracking-normal text-slate-900">
              Decision Support System
            </h2>
            <p className="mt-2 max-w-4xl text-base leading-relaxed text-slate-600">
              Ringkasan rekomendasi, kampus prioritas, dan proyeksi skenario untuk menentukan pendampingan yang paling mendesak.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function AnalyticsSection() {
  return (
    <section className="px-4 pb-8 md:px-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DecisionSupportSection />
        <KampusPrioritasSection />
        <ProyeksiSkorSection />
        <RekomendasiPrioritasSection />
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {sidebarOpen ? <button type="button" aria-label="Tutup sidebar" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-900/35 backdrop-blur-[1px]" /> : null}
      <DashboardSidebar open={sidebarOpen} menuGroups={dashboardData.sidebarMenu} />
      <DashboardHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className="w-full py-3 md:py-5">
        <MetricsSection cards={metricCards} />
        <OverviewSplitSection data={dashboardData} />
        <ScoreSection aspectScores={dashboardData.aspectScores} starDistribution={dashboardData.starDistribution} trend={dashboardData.trend} />
        <DecisionSupportSystemIntro />
        <AnalyticsSection />
        <section className="px-4 pb-8 ">
          <FacilityProvinceSection />
        </section>
      </div>
    </main>
  )
}
