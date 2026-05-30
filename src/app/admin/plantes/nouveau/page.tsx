import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlantForm from '../PlantForm'
import type { Category } from '@/lib/types'

export default async function NouvelPlantePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Ajouter une plante</h1>
      <PlantForm categories={(categories as Category[]) ?? []} />
    </div>
  )
}
