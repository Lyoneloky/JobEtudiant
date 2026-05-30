import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PlantForm from '../../PlantForm'
import type { Category, Plant } from '@/lib/types'

export default async function ModifierPlantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: plant }, { data: categories }] = await Promise.all([
    supabase.from('plants').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!plant) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Modifier — {plant.name}</h1>
      <PlantForm categories={(categories as Category[]) ?? []} plant={plant as Plant} />
    </div>
  )
}
