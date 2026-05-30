'use client'

import { useEffect, useRef } from 'react'

interface Location {
  id: string; name: string; type: string; latitude: number | null;
  longitude: number | null; address: string | null; city: string | null;
  region: string | null; description: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  herboristerie: '#166534',
  marche: '#E65100',
  zone_cueillette: '#1565C0',
}
const TYPE_LABELS: Record<string, string> = {
  herboristerie: 'Herboristerie',
  marche: 'Marché',
  zone_cueillette: 'Zone de cueillette',
}

export default function DynamicMap({ locations }: { locations: Location[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then(L => {
      if (!mapRef.current || mapInstanceRef.current) return

      // Fix leaflet default icon
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!).setView([3.848, 11.502], 12)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      const validLocations = locations.filter(l => l.latitude != null && l.longitude != null)

      validLocations.forEach(loc => {
        const color = TYPE_COLORS[loc.type] ?? '#22c55e'
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:32px;height:32px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconAnchor: [16, 32],
          popupAnchor: [0, -36],
        })

        const popup = `
          <div style="font-family:Inter,sans-serif;min-width:200px;padding:4px">
            <div style="background:${color};color:white;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;margin-bottom:8px;display:inline-block">${TYPE_LABELS[loc.type] ?? loc.type}</div>
            <div style="font-size:16px;font-weight:700;color:#111;margin-bottom:4px">${loc.name}</div>
            ${loc.address ? `<div style="font-size:13px;color:#616161;margin-bottom:2px">📍 ${loc.address}</div>` : ''}
            ${loc.city ? `<div style="font-size:13px;color:#616161;margin-bottom:6px">${loc.city}${loc.region ? ` · ${loc.region}` : ''}</div>` : ''}
            ${loc.description ? `<div style="font-size:13px;color:#444;line-height:1.5;border-top:1px solid #eee;padding-top:6px">${loc.description}</div>` : ''}
          </div>
        `
        L.marker([loc.latitude!, loc.longitude!], { icon }).addTo(map).bindPopup(popup)
      })

      if (validLocations.length > 1) {
        const bounds = L.latLngBounds(validLocations.map(l => [l.latitude!, l.longitude!]))
        map.fitBounds(bounds, { padding: [40, 40] })
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  }, [locations])

  return <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
}
