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
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Supprimer"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
