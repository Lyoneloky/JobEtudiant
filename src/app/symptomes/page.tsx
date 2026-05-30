import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SymptomesClient from './SymptomesClient'

export default async function SymptomesPage({
  searchParams,
}: {
  searchParams: Promise<{ selected?: string }>
}) {
  const { selected } = await searchParams
  const supabase = await createClient()

  // Charger symptômes depuis DB (avec fallback statique)
  const { data: symptomsDb } = await supabase
    .from('symptoms')
    .select('id, name, category')
    .order('category')
    .order('name')

  // Charger plantes avec leurs symptômes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: plantsDbRaw } = await supabase
    .from('plant_symptoms')
    .select('symptom_id, plants(id, name, latin_name, properties, usage, contraindications)')
  const plantsDb = (plantsDbRaw as any[]) ?? []

  return (
    <div style={{ fontFamily: '"Inter", Arial, sans-serif', background: '#F8FAF5', minHeight: '100vh' }}>
      <Navbar />
      <SymptomesClient
        symptomsDb={symptomsDb ?? []}
        plantsDb={plantsDb}
        initialSelected={selected}
      />
      <Footer />
    </div>
  )
}
