'use client'

import { useEffect, useMemo, useRef } from 'react'
import GeoJSON from 'ol/format/GeoJSON'
import Map from 'ol/Map'
import View from 'ol/View'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Fill, Stroke, Style, Text } from 'ol/style'

type ProvinceMapOlProps = {
  selectedProvince: string
}

const PALETTE = ['#c8ece8', '#b8e4e0', '#aadbd6', '#9ad2cd', '#8ac9c4', '#7bbfbb', '#6cb5b2']

function getProvinceName(properties: Record<string, unknown>) {
  const candidates = ['name', 'NAME_1', 'PROPINSI', 'PROVINSI', 'province', 'WADMPR']
  for (const key of candidates) {
    const value = properties[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

export default function ProvinceMapOl({ selectedProvince }: ProvinceMapOlProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapObjRef = useRef<Map | null>(null)
  const vectorRef = useRef<VectorLayer<VectorSource> | null>(null)

  const baseStyle = useMemo(
    () =>
      new Style({
        fill: new Fill({ color: '#bde5e1' }),
        stroke: new Stroke({ color: '#ffffff', width: 1 }),
      }),
    []
  )

  useEffect(() => {
    if (!mapRef.current || mapObjRef.current) return

    const vectorSource = new VectorSource()
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        const idx = Number(feature.get('colorIdx') ?? 0)
        return new Style({
          fill: new Fill({ color: PALETTE[idx % PALETTE.length] }),
          stroke: new Stroke({ color: '#f8fffe', width: 1 }),
        })
      },
    })

    vectorRef.current = vectorLayer

    const map = new Map({
      target: mapRef.current,
      layers: [vectorLayer],
      view: new View({
        center: [13100000, -250000],
        zoom: 4.4,
      }),
      controls: [],
    })

    mapObjRef.current = map

    fetch('/indonesia-provinces.geojson')
      .then((res) => res.json())
      .then((geojson) => {
        const features = new GeoJSON().readFeatures(geojson, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        })
        features.forEach((feature, index) => feature.set('colorIdx', index))
        vectorSource.addFeatures(features)
        if (features.length > 0) {
          const extent = vectorSource.getExtent()
          if (extent) {
            map.getView().fit(extent, { padding: [25, 25, 25, 25], duration: 400, maxZoom: 6.2 })
          }
        }
      })
      .catch(() => {
        vectorLayer.setStyle(baseStyle)
      })

    return () => {
      map.setTarget(undefined)
      mapObjRef.current = null
    }
  }, [baseStyle])

  useEffect(() => {
    const layer = vectorRef.current
    if (!layer) return
    const source = layer.getSource()
    if (!source) return

    const selected = selectedProvince.toLowerCase()
    const isAll = selected.includes('semua')

    layer.setStyle((feature) => {
      const props = feature.getProperties() as Record<string, unknown>
      const name = getProvinceName(props).toLowerCase()
      const idx = Number(feature.get('colorIdx') ?? 0)
      const active = !isAll && name.includes(selected)

      return new Style({
        fill: new Fill({ color: active ? '#0f8f96' : PALETTE[idx % PALETTE.length] }),
        stroke: new Stroke({ color: active ? '#0a5f64' : '#f8fffe', width: active ? 2 : 1 }),
        text: active
          ? new Text({
              text: getProvinceName(props),
              fill: new Fill({ color: '#0b2f32' }),
              stroke: new Stroke({ color: '#ffffff', width: 3 }),
              font: '600 11px sans-serif',
            })
          : undefined,
      })
    })
  }, [selectedProvince])

  return <div ref={mapRef} className="h-full w-full rounded-xl" />
}
