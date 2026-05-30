'use client'

import Link from 'next/link'
import Image from 'next/image'
import { AlertTriangle } from 'lucide-react'
import type { Plant } from '@/lib/types'

const C = { primary:'#22c55e', primaryDark:'#166534', primaryLight:'#dcfce7', text:'#616161', border:'#E8EDE4', white:'#FFFFFF', bg:'#F8FAF5' }

const PLANT_COLORS = [C.primaryLight,'#FFFDE8','#FFF8E8','#FFF0F0','#F0EFF0','#E8F5E8','#EFF6FF','#F3E8FF']
const PLANT_EMOJI: Record<string,string> = { Goyave:'🍃',Citronnelle:'🌿',Gingembre:'🫚',Prunier:'🌲',Moringa:'🌱',Neem:'🍀',Aloe:'🪴',Eucalyptus:'🌿',Papayer:'🍃',Basilic:'🌿' }

function getEmoji(name: string) {
  const k = Object.keys(PLANT_EMOJI).find(k => name.includes(k))
  return k ? PLANT_EMOJI[k] : '🌿'
}
function getColor(name: string) {
  return PLANT_COLORS[name.charCodeAt(0) % PLANT_COLORS.length]
}

export default function PlantCard({ plant }: { plant: Plant }) {
  return (
    <Link href={`/plantes/${plant.id}`} style={{ textDecoration:'none', display:'block' }}>
      <div
        style={{ background:C.white, borderRadius:20, border:`1px solid ${C.border}`, overflow:'hidden', cursor:'pointer', transition:'box-shadow .2s, border-color .2s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.cssText += ';box-shadow:0 8px 28px rgba(22,101,52,0.12);border-color:#bbf7d0' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='none'; (e.currentTarget as HTMLDivElement).style.borderColor=C.border }}
      >
        {/* Zone image */}
        <div style={{ height:180, background:getColor(plant.name), display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
          {plant.image_url ? (
            <Image
              src={plant.image_url}
              alt={plant.name}
              fill
              sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
              style={{ objectFit:'cover' }}
              unoptimized
            />
          ) : (
            <span style={{ fontSize:60 }}>{getEmoji(plant.name)}</span>
          )}
          {/* Badge catégorie */}
          {plant.categories && (
            <span style={{ position:'absolute', top:12, left:12, height:26, padding:'0 12px', background:'rgba(22,101,52,0.85)', backdropFilter:'blur(4px)', borderRadius:999, fontSize:11, fontWeight:700, color:C.white, display:'inline-flex', alignItems:'center', zIndex:1 }}>
              {plant.categories.name}
            </span>
          )}
        </div>

        {/* Contenu */}
        <div style={{ padding:'16px 18px' }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:'#111', fontFamily:"'Poppins',sans-serif", marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {plant.name}
          </h3>
          {plant.latin_name && (
            <p style={{ fontSize:12, color:'#9AA49A', fontStyle:'italic', marginBottom:8 }}>{plant.latin_name}</p>
          )}
          <p className="line-clamp-2" style={{ fontSize:13, color:C.text, lineHeight:'20px', marginBottom:12 }}>
            {plant.description}
          </p>
          {plant.properties && plant.properties.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
              {plant.properties.slice(0, 3).map((p, i) => (
                <span key={i} style={{ height:22, padding:'0 8px', background:C.primaryLight, borderRadius:7, fontSize:11, fontWeight:600, color:C.primaryDark, display:'inline-flex', alignItems:'center' }}>{p}</span>
              ))}
              {plant.properties.length > 3 && (
                <span style={{ height:22, padding:'0 8px', background:'#F4F4F4', borderRadius:7, fontSize:11, color:C.text, display:'inline-flex', alignItems:'center' }}>+{plant.properties.length - 3}</span>
              )}
            </div>
          )}
          {plant.contraindications && (
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#D97706' }}>
              <AlertTriangle style={{ width:12, height:12 }}/> Contre-indications
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
