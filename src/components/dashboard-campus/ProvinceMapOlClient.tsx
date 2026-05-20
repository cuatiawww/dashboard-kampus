'use client'

import { useEffect, useRef, useState } from 'react'
import GeoJSON from 'ol/format/GeoJSON'
import type { FeatureLike } from 'ol/Feature'
import OlMap from 'ol/Map'
import { unByKey } from 'ol/Observable'
import View from 'ol/View'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Fill, Stroke, Style, Text } from 'ol/style'
import { defaults as defaultControls } from 'ol/control'
import { X, MapPin, RotateCcw } from 'lucide-react'
import 'ol/ol.css'

type ProvinceMapOlProps = { selectedProvince: string }

type ProvinceDetail = {
  province: string
  totalCampus: number
  averageScore: number
  category: string
  verified: number
  reportCompletion: number
  priorityCampus: number
  recommendation: string
}

type PetaSebaranItem = {
  kode?: string
  nama?: string
  kode_provinsi?: string
  nama_provinsi?: string
  total_faskes?: string | number
  total_rs?: string | number
  total_puskesmas?: string | number
  total_posyandu?: string | number
  total_klinik?: string | number
  total_pustu?: string | number
  total_bkk?: string | number
  properties?: PetaSebaranItem
}

// ── Choropleth ──────────────────────────────────────────────────────────────

function scoreFill(s: number) {
  if (s >= 800) return '#059669'
  if (s >= 600) return '#16a34a'
  if (s >= 500) return '#65a30d'
  if (s >= 400) return '#ca8a04'
  if (s >= 300) return '#ea580c'
  if (s >= 200) return '#dc2626'
  return '#b91c1c'
}
function scoreFillLight(s: number) {
  if (s >= 800) return '#a7f3d0'
  if (s >= 600) return '#bbf7d0'
  if (s >= 500) return '#d9f99d'
  if (s >= 400) return '#fef08a'
  if (s >= 300) return '#fed7aa'
  if (s >= 200) return '#fecaca'
  return '#fca5a5'
}
function scoreCategory(s: number) {
  if (s >= 800) return 'BINTANG 5'
  if (s >= 600) return 'BINTANG 4'
  if (s >= 400) return 'BINTANG 3'
  if (s >= 200) return 'BINTANG 2'
  return 'BINTANG 1'
}

// ── Province name ────────────────────────────────────────────────────────────

function extractName(props: Record<string, unknown>): string {
  for (const key of ['name', 'NAME_1', 'Propinsi', 'propinsi', 'PROPINSI', 'PROVINSI', 'province', 'WADMPR']) {
    const v = props[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  const code = props.kode
  if (typeof code === 'string' && code.trim()) return `Wilayah ${code.trim()}`
  if (typeof code === 'number') return `Wilayah ${code}`
  return ''
}

function normalizeProvinceName(value: string) {
  return value.toUpperCase().replace(/\s+/g, ' ').trim()
}

function toNumber(value: string | number | undefined) {
  if (typeof value === 'number') return value
  const parsed = Number.parseFloat((value ?? '0').toString().replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function totalFaskes(item: PetaSebaranItem) {
  const direct = toNumber(item.total_faskes)
  if (direct > 0) return direct
  return (
    toNumber(item.total_rs) +
    toNumber(item.total_puskesmas) +
    toNumber(item.total_posyandu) +
    toNumber(item.total_klinik) +
    toNumber(item.total_pustu) +
    toNumber(item.total_bkk)
  )
}

function extractRows(payloadData: unknown): PetaSebaranItem[] {
  if (Array.isArray(payloadData)) return payloadData as PetaSebaranItem[]
  if (!payloadData || typeof payloadData !== 'object') return []
  const obj = payloadData as Record<string, unknown>
  if (Array.isArray(obj.data)) return obj.data as PetaSebaranItem[]
  if (Array.isArray(obj.result)) return obj.result as PetaSebaranItem[]
  if (Array.isArray(obj.features)) return obj.features as PetaSebaranItem[]
  return []
}

// ── Fake data ────────────────────────────────────────────────────────────────

const detailCache = new globalThis.Map<string, ProvinceDetail>()

function getDetail(province: string, idx: number): ProvinceDetail {
  if (detailCache.has(province)) return detailCache.get(province)!
  const seed = province.split('').reduce((s, c) => s + c.charCodeAt(0), 0) + idx * 31
  const score = 150 + (seed % 700)
  const pc = 2 + (seed % 11)
  const d: ProvinceDetail = {
    province,
    totalCampus: 18 + (seed % 84),
    averageScore: score,
    category: scoreCategory(score),
    verified: 52 + (seed % 44),
    reportCompletion: 61 + (seed % 35),
    priorityCampus: pc,
    recommendation: pc > 8
      ? 'Prioritaskan pendampingan dan verifikasi lapangan segera.'
      : 'Pertahankan monitoring rutin dan validasi dokumen.',
  }
  detailCache.set(province, d)
  return d
}

// ── OL style ─────────────────────────────────────────────────────────────────

function mkStyle(fill: string, stroke: string, sw: number, label?: string): Style {
  return new Style({
    fill: new Fill({ color: fill }),
    stroke: new Stroke({ color: stroke, width: sw }),
    ...(label ? {
      text: new Text({
        text: label,
        fill: new Fill({ color: '#0f172a' }),
        stroke: new Stroke({ color: '#ffffff', width: 3 }),
        font: 'bold 11px sans-serif',
        overflow: true,
      }),
    } : {}),
    zIndex: label ? 10 : 1,
  })
}

const LEGEND = [
  { color: '#b91c1c', label: 'Bintang 1  (< 200)' },
  { color: '#dc2626', label: 'Bintang 2  (200-399)' },
  { color: '#ca8a04', label: 'Bintang 3  (400-599)' },
  { color: '#16a34a', label: 'Bintang 4  (600-799)' },
  { color: '#059669', label: 'Bintang 5  (>= 800)' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProvinceMapOl({ selectedProvince }: ProvinceMapOlProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<OlMap | null>(null)
  const layerRef     = useRef<VectorLayer<VectorSource> | null>(null)
  const loadedRef    = useRef(false)
  const activeRef    = useRef('')
  const selRef       = useRef(selectedProvince.toLowerCase())
  const campusByProvinceRef = useRef<Record<string, number>>({})
  const [detail, setDetail] = useState<ProvinceDetail | null>(null)

  function restyle(clicked: string, dropdown: string) {
    const layer = layerRef.current
    if (!layer) return
    const isAll = dropdown.includes('semua')
    layer.setStyle((f: FeatureLike) => {
      const props  = f.getProperties() as Record<string, unknown>
      const pname  = extractName(props)
      const lo     = pname.toLowerCase()
      const idx    = Number(f.get('colorIdx') ?? 0)
      const apiCampus = campusByProvinceRef.current[normalizeProvinceName(pname)] ?? 0
      const scoreFromApi = apiCampus > 0 ? Math.min(950, 120 + apiCampus) : 0
      const score  = pname ? (scoreFromApi || getDetail(pname, idx).averageScore) : 400
      const active = (!isAll && lo.includes(dropdown)) || (!!clicked && lo === clicked)
      if (active) return mkStyle(scoreFill(score), '#0f172a', 2.5)
      return isAll
        ? mkStyle(scoreFill(score), '#ffffff', 0.8)
        : mkStyle(scoreFillLight(score), '#ffffff', 0.8)
    })
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const source = new VectorSource()
    const layer  = new VectorLayer({
      source,
      style: (f: FeatureLike) => {
        const props = f.getProperties() as Record<string, unknown>
        const pname = extractName(props)
        const idx   = Number(f.get('colorIdx') ?? 0)
        const score = pname ? getDetail(pname, idx).averageScore : 400
        return mkStyle(scoreFill(score), '#ffffff', 0.8)
      },
    })
    layerRef.current = layer

    const map = new OlMap({
      target: containerRef.current,
      layers: [layer],
      view: new View({ center: [13100000, -250000], zoom: 4.5 }),
      controls: defaultControls({ attribution: false }),
    })
    mapRef.current = map

    // CLICK — key fix: collect features array, take first, then zoom
    const clickKey = map.on('singleclick', (evt) => {
      if (!loadedRef.current) return

      const hits: FeatureLike[] = []
      map.forEachFeatureAtPixel(
        evt.pixel,
        (f) => {
          hits.push(f)
          return true
        },
        { hitTolerance: 8 }
      )

      if (hits.length === 0) {
        activeRef.current = ''
        setDetail(null)
        restyle('', selRef.current)
        return
      }

      const f     = hits[0]
      const props = f.getProperties() as Record<string, unknown>
      const pname = extractName(props)
      if (!pname) return

      const idx = Number(f.get('colorIdx') ?? 0)
      const d   = getDetail(pname, idx)
      const apiCampus = campusByProvinceRef.current[normalizeProvinceName(pname)] ?? 0
      const mergedDetail: ProvinceDetail =
        apiCampus > 0
          ? {
              ...d,
              totalCampus: apiCampus,
              averageScore: Math.min(950, 120 + apiCampus),
              category: scoreCategory(Math.min(950, 120 + apiCampus)),
            }
          : d
      activeRef.current = pname.toLowerCase()
      setDetail(mergedDetail)
      restyle(pname.toLowerCase(), selRef.current)

      // Zoom to province — need cast to access getGeometry
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const geom = (f as any).getGeometry?.()
      if (geom) {
        map.getView().fit(geom.getExtent(), {
          duration: 450,
          padding: [40, 320, 40, 40],
          maxZoom: 7.5,
        })
      }
    })

    const hoverKey = map.on('pointermove', (evt) => {
      if (evt.dragging) return
      const hit = map.hasFeatureAtPixel(evt.pixel, { hitTolerance: 8 })
      ;(map.getTargetElement() as HTMLElement).style.cursor = hit ? 'pointer' : ''
    })

    const loadApiMetrics = async () => {
      try {
        const resp = await fetch('/api/dashboard-kampus/peta-sebaran', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kode_provinsi: '' }),
        })
        if (!resp.ok) return
        const payload = (await resp.json()) as { data?: unknown }
        const rows = extractRows(payload.data ?? payload)
        const nextMap: Record<string, number> = {}
        for (const row of rows) {
          const source = row.properties ?? row
          const name = String(source.nama ?? source.nama_provinsi ?? '').trim()
          if (!name) continue
          const key = normalizeProvinceName(name)
          nextMap[key] = (nextMap[key] ?? 0) + totalFaskes(source)
        }
        if (Object.keys(nextMap).length > 0) {
          campusByProvinceRef.current = nextMap
          restyle(activeRef.current, selRef.current)
        }
      } catch {
        // Keep deterministic local fallback when API is not reachable.
      }
    }

    void loadApiMetrics()

    fetch('/indonesia-provinces.geojson')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((geojson) => {
        const features = new GeoJSON().readFeatures(geojson, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        })
        features.forEach((f, i) => {
          f.set('colorIdx', i)
        })
        source.addFeatures(features)
        loadedRef.current = true
        const ext = source.getExtent()
        if (ext) map.getView().fit(ext, { padding: [16, 16, 16, 16], duration: 600, maxZoom: 6 })
        restyle(activeRef.current, selRef.current)
      })
      .catch((e) => console.error('[ProvinceMap] GeoJSON load error:', e))

    return () => {
      unByKey([clickKey, hoverKey])
      map.setTarget(undefined)
      mapRef.current = null
      loadedRef.current = false
    }
  }, [])

  useEffect(() => {
    selRef.current = selectedProvince.toLowerCase()
    restyle(activeRef.current, selRef.current)
  }, [selectedProvince])

  const zoom = (d: number) => {
    const v = mapRef.current?.getView()
    if (v) v.animate({ zoom: (v.getZoom() ?? 5) + d, duration: 250 })
  }

  const resetView = () => {
    activeRef.current = ''
    setDetail(null)
    restyle('', selRef.current)
    mapRef.current?.getView().animate({ center: [13100000, -250000], zoom: 4.8, duration: 450 })
  }

  return (
    <div className="relative h-full w-full select-none overflow-hidden rounded-xl">
      <div ref={containerRef} className="h-full w-full" />

      {/* Detail panel */}
      {detail ? (
        <div
          key={detail.province}
          className="absolute right-3 top-3 w-[min(296px,calc(100%-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
          style={{ animation: 'fadeSlideIn 180ms ease' }}
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3"
            style={{ backgroundColor: scoreFill(detail.averageScore) }}>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-white/80" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Provinsi Dipilih</p>
                <h4 className="text-sm font-extrabold leading-tight text-white">{detail.province}</h4>
              </div>
            </div>
            <button type="button" onClick={resetView}
              className="rounded-lg p-1 text-white/70 transition hover:bg-white/20 hover:text-white"
              aria-label="Tutup">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Skor Rata-rata</p>
              <p className="text-2xl font-extrabold leading-none text-slate-900">{detail.averageScore}</p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ backgroundColor: scoreFill(detail.averageScore) }}>
              {detail.category}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-px bg-slate-100">
            {[
              { label: 'Total Kampus',       value: String(detail.totalCampus) },
              { label: 'Terverifikasi',       value: `${detail.verified}%` },
              { label: 'Kelengkapan Laporan', value: `${detail.reportCompletion}%` },
              { label: 'Kampus Prioritas',    value: String(detail.priorityCampus), warn: detail.priorityCampus > 8 },
            ].map((item) => (
              <div key={item.label} className="bg-white px-3 py-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
                <p className={`mt-0.5 text-lg font-extrabold ${item.warn ? 'text-red-600' : 'text-slate-900'}`}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rekomendasi</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-700">{detail.recommendation}</p>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute right-3 top-3 rounded-xl border border-teal-100 bg-white/90 px-3 py-2 text-[11px] font-semibold text-slate-500 shadow-sm">
          Klik provinsi untuk melihat detail
        </div>
      )}

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-2xl border border-slate-200 bg-white/97 p-3 shadow-lg">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Legenda Skor</p>
        <p className="mt-0.5 text-[9px] text-slate-400">Gradasi skor kampus sehat per provinsi</p>
        <ul className="mt-2 space-y-1.5">
          {LEGEND.map(({ color, label }) => (
            <li key={label} className="flex items-center gap-2 text-[10px] text-slate-600">
              <span className="h-3 w-3 shrink-0 rounded-[3px]" style={{ backgroundColor: color }} />
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* Zoom + Reset */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        <button type="button" onClick={() => zoom(0.8)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          aria-label="Zoom in">+</button>
        <button type="button" onClick={() => zoom(-0.8)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          aria-label="Zoom out">-</button>
        <button type="button" onClick={resetView}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
          aria-label="Reset tampilan" title="Reset tampilan">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}
