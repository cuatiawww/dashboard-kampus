import { Bell, CalendarDays, ChevronDown, Download, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type DashboardHeaderProps = {
  onToggleSidebar: () => void
}

export default function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!profileRef.current) return
      if (!profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }

    if (profileOpen) {
      document.addEventListener('mousedown', onClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [profileOpen])

  return (
    <header className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Buka menu"
          onClick={onToggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            className="flex min-w-[220px] items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left"
          >
            <span>
              <span className="block text-xs text-slate-500">Tahun Penilaian</span>
              <span className="text-sm font-semibold">2025</span>
            </span>
            <CalendarDays className="h-4 w-4 text-slate-500" />
          </button>

          <button
            type="button"
            className="flex min-w-[220px] items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left"
          >
            <span>
              <span className="block text-xs text-slate-500">Periode Apresiasi</span>
              <span className="text-sm font-semibold">2025 - 2026</span>
            </span>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 rounded-full bg-teal-600 px-1.5 text-[10px] font-semibold text-white">5</span>
        </button>

        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          <Download className="h-4 w-4" />
          Unduh Laporan
        </button>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 text-left transition hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">AP</div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-4">Admin Pusat</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>

          {profileOpen ? (
            <div className="absolute right-0 top-14 z-30 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Admin Pusat</p>
                  <p className="text-xs text-slate-500">admin.pusat@kampussehat.go.id</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2 text-sm">
                <button type="button" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left transition hover:bg-slate-50">
                  Profil Saya
                </button>
                <button type="button" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left transition hover:bg-slate-50">
                  Pengaturan Akun
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg border border-red-200 px-3 py-2 text-left text-red-600 transition hover:bg-red-50"
                >
                  Keluar
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
