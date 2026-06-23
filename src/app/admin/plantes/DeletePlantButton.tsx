'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

export default function DeletePlantButton({ plantId, plantName }: { plantId: string; plantName: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm(`Supprimer "${plantName}" ? Cette action est irréversible.`)) return
    setLoading(true)
    await supabase.from('plants').delete().eq('id', plantId)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Supprimer"
      style={{ width: 30, height: 30, borderRadius: 8, background: '#FFF5F5', border: '1px solid #FECACA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
    >
      <Trash2 style={{ width: 13, height: 13 }} />
    </button>
  )
}
