'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.startsWith('http') && !url.includes('placeholder')
}

const NOT_CONFIGURED = { error: 'Supabase non configuré. Renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local.' }

/* ── FAVORIS ──────────────────────────────── */

export async function addFavorite(plantId: string) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }
  const { error } = await supabase.from('favorites').insert({ user_id: user.id, plant_id: plantId })
  if (error) return { error: error.message }
  revalidatePath(`/plantes/${plantId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function removeFavorite(plantId: string) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }
  const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('plant_id', plantId)
  if (error) return { error: error.message }
  revalidatePath(`/plantes/${plantId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

/* ── CONSULTATION ──────────────────────────── */

export async function submitConsultation(formData: FormData) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté pour envoyer une demande.' }

  const payload = {
    user_id: user.id,
    symptoms_description: formData.get('symptoms') as string,
    age: Number(formData.get('age')) || null,
    duration: formData.get('duration') as string,
    current_treatments: formData.get('treatments') as string,
    allergies: formData.get('allergies') as string,
    status: 'en_attente',
  }

  if (!payload.symptoms_description?.trim()) return { error: 'Veuillez décrire vos symptômes.' }

  const { error } = await supabase.from('consultations').insert(payload)
  if (error) return { error: error.message }
  return { success: true }
}

export async function respondConsultation(id: string, response: string, plantId?: string) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()
  const { error } = await supabase
    .from('consultations')
    .update({ admin_response: response, plant_recommended_id: plantId || null, status: 'traitee', updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/consultations')
  return { success: true }
}

/* ── PROFIL ───────────────────────────────── */

export async function updateProfile(displayName: string) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, display_name: displayName.trim(), updated_at: new Date().toISOString() })
  if (error) return { error: error.message }
  revalidatePath('/profil')
  return { success: true }
}

/* ── PLANTES (ADMIN) ──────────────────────── */

export async function deletePlant(plantId: string) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }
  const { error } = await supabase.from('plants').delete().eq('id', plantId)
  if (error) return { error: error.message }
  revalidatePath('/admin/plantes')
  revalidatePath('/plantes')
  return { success: true }
}

export async function savePlant(formData: FormData, plantId?: string) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const payload = {
    name: formData.get('name') as string,
    latin_name: (formData.get('latin_name') as string) || null,
    description: formData.get('description') as string,
    properties: ((formData.get('properties') as string) || '').split(',').map(s => s.trim()).filter(Boolean),
    usage: (formData.get('usage') as string) || null,
    preparation: (formData.get('preparation') as string) || null,
    contraindications: (formData.get('contraindications') as string) || null,
    dosage: (formData.get('dosage') as string) || null,
    image_url: (formData.get('image_url') as string) || null,
    category_id: (formData.get('category_id') as string) || null,
    is_published: formData.get('is_published') === 'on',
    updated_at: new Date().toISOString(),
  }

  if (plantId) {
    const { error } = await supabase.from('plants').update(payload).eq('id', plantId)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('plants').insert(payload)
    if (error) return { error: error.message }
  }

  revalidatePath('/admin/plantes')
  revalidatePath('/plantes')
  return { success: true }
}
