'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { addFavorite, removeFavorite } from '@/lib/actions'

export default function FavoriteButton({
  plantId,
  initialFavorite,
  isLoggedIn,
}: {
  plantId: string
  initialFavorite: boolean
  isLoggedIn: boolean
}) {
  const [isFav, setIsFav] = useState(initialFavorite)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function toggle() {
    if (!isLoggedIn) { router.push('/auth/login'); return }
    startTransition(async () => {
      if (isFav) {
        await removeFavorite(plantId)
        setIsFav(false)
      } else {
        await addFavorite(plantId)
        setIsFav(true)
      }
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: 48, padding: '0 20px', borderRadius: 14,
        background: isFav ? '#FFF0F0' : '#f4f4f4',
        border: isFav ? '1.5px solid #FFB3B3' : '1.5px solid #E0E0E0',
        color: isFav ? '#D32F2F' : '#555',
        fontSize: 15, fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.2s',
        opacity: isPending ? 0.7 : 1,
      }}
    >
      <Heart style={{ width: 18, height: 18, fill: isFav ? '#D32F2F' : 'none' }} />
      {isFav ? 'Favori' : 'Ajouter aux favoris'}
    </button>
  )
}
