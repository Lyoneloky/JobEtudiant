import { createClient } from '@/lib/supabase/server'
import SymptomesClient from '@/app/symptomes/SymptomesClient'

export default async function AdminSymptomesPage({ searchParams }: { searchParams: Promise<{ selected?: string }> }) {
  const { selected } = await searchParams
  const supabase = await createClient()

  const { data: symptomsDb } = await supabase
    .from('symptoms')
    .select('id, name, category')
    .order('category')
    .order('name')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: plantsDbRaw } = await supabase
    .from('plant_symptoms')
    .select('symptom_id, plants(id, name, latin_name, properties, usage, contraindications)')
  const plantsDb = (plantsDbRaw as any[]) ?? []

  return (
    <div style={{ padding: '4px 0 60px' }}>
      <SymptomesClient
        symptomsDb={symptomsDb ?? []}
        plantsDb={plantsDb}
        initialSelected={selected}
      />
    </div>
  )
}
