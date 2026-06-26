'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
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
    herboriste_id: (formData.get('herboriste_id') as string) || null,
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

export async function approveUser(userId: string) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Vérifier si l'utilisateur connecté est admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Non autorisé' }

  const { error } = await supabase
    .from('profiles')
    .update({ approved: true, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin/utilisateurs')
  return { success: true }
}

export async function blockUser(userId: string) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Non autorisé' }

  const { error } = await supabase
    .from('profiles')
    .update({ approved: false, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin/utilisateurs')
  return { success: true }
}

export async function changeUserRole(userId: string, newRole: 'admin' | 'herboriste' | 'user') {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Non autorisé' }

  if (userId === user.id) return { error: 'Impossible de modifier votre propre rôle.' }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin/utilisateurs')
  return { success: true }
}

/* ── VALIDATION INSCRIPTION HERBORISTES ──────────────── */

export async function submitHerboristeApplication(formData: FormData) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('displayName') as string

  if (!email || !password || !displayName) {
    return { error: 'Tous les champs sont requis.' }
  }

  // Vérifier si l'email existe déjà dans auth.users via admin client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (url && svcKey) {
    try {
      const adminClient = createAdminClient(url, svcKey, { auth: { autoRefreshToken: false, persistSession: false } })
      const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers()
      if (!listError && usersData?.users) {
        const emailExists = usersData.users.some(u => u.email === email)
        if (emailExists) {
          return { error: 'Cette adresse e-mail est déjà utilisée par un compte actif.' }
        }
      }
    } catch (e) {
      console.error('Error listing users in admin check:', e)
    }
  }

  // Vérifier s'il y a déjà une demande d'inscription en cours
  const { data: existingApp } = await supabase
    .from('herboriste_applications')
    .select('id, status')
    .eq('email', email)
    .maybeSingle()

  if (existingApp) {
    if (existingApp.status === 'en_attente') {
      return { error: 'Une demande d\'inscription pour cet e-mail est déjà en cours de validation.' }
    }
    if (existingApp.status === 'approuve') {
      return { error: 'Cette demande a déjà été approuvée.' }
    }
    // Si rejetée, on supprime l'ancienne demande pour en créer une nouvelle
    await supabase.from('herboriste_applications').delete().eq('id', existingApp.id)
  }

  // Insérer la demande d'inscription
  const { error: insertError } = await supabase
    .from('herboriste_applications')
    .insert({
      email,
      password, // Plain text pour permettre à l'admin de créer le compte Supabase Auth ultérieurement
      display_name: displayName,
      status: 'en_attente'
    })

  if (insertError) {
    return { error: insertError.message }
  }

  return { success: true }
}

export async function approveHerboristeApplication(applicationId: string) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { error: 'Non authentifié' }

  // Vérifier si l'utilisateur est admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single()
  if (profile?.role !== 'admin') return { error: 'Non autorisé' }

  // Récupérer la demande d'inscription
  const { data: app, error: fetchError } = await supabase
    .from('herboriste_applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (fetchError || !app) return { error: 'Demande d\'inscription introuvable.' }
  if (app.status !== 'en_attente') return { error: 'Cette demande a déjà été traitée.' }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !svcKey) return { error: 'Clé d\'administration Supabase manquante.' }

  const adminClient = createAdminClient(url, svcKey, { auth: { autoRefreshToken: false, persistSession: false } })

  // 1. Créer le compte dans auth.users
  const { data: newUserData, error: createError } = await adminClient.auth.admin.createUser({
    email: app.email,
    password: app.password,
    email_confirm: true,
    user_metadata: {
      display_name: app.display_name,
      role: 'herboriste'
    }
  })

  if (createError) {
    return { error: createError.message }
  }

  const newUser = newUserData.user
  if (!newUser) return { error: 'Erreur lors de la création de l\'utilisateur.' }

  // 2. Mettre à jour public.profiles — le trigger live ne lit pas user_metadata,
  //    il faut donc forcer role + display_name + approved ici
  const { error: profileError } = await adminClient
    .from('profiles')
    .update({ role: 'herboriste', display_name: app.display_name, approved: true, updated_at: new Date().toISOString() })
    .eq('id', newUser.id)

  if (profileError) {
    // Si la mise à jour du profil échoue, on nettoie en supprimant l'utilisateur créé
    await adminClient.auth.admin.deleteUser(newUser.id)
    return { error: profileError.message }
  }

  // 3. Mettre à jour le statut de la demande
  const { error: updateError } = await supabase
    .from('herboriste_applications')
    .update({ status: 'approuve', updated_at: new Date().toISOString() })
    .eq('id', applicationId)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/admin/utilisateurs')
  return { success: true }
}

export async function rejectHerboristeApplication(applicationId: string) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { error: 'Non authentifié' }

  // Vérifier si l'utilisateur est admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single()
  if (profile?.role !== 'admin') return { error: 'Non autorisé' }

  const { error } = await supabase
    .from('herboriste_applications')
    .update({ status: 'rejete', updated_at: new Date().toISOString() })
    .eq('id', applicationId)

  if (error) return { error: error.message }

  revalidatePath('/admin/utilisateurs')
  return { success: true }
}

/* ── SIGNALEMENT EFFETS SECONDAIRES ──────────── */

export async function submitSideEffectReport(tipId: string, description: string) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data: profile } = await supabase
    .from('profiles').select('display_name').eq('id', user.id).single()

  const displayName = profile?.display_name
    || user.email?.split('@')[0]
    || 'Utilisateur'

  const { error } = await supabase.from('side_effect_reports').insert({
    tip_id: tipId,
    user_id: user.id,
    user_name: displayName,
    description: description.trim(),
    status: 'en_attente',
  })
  if (error) return { error: error.message }
  revalidatePath('/conseils')
  return { success: true }
}

export async function respondToSideEffectReport(reportId: string, response: string) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data: profile } = await supabase
    .from('profiles').select('display_name, role').eq('id', user.id).single()
  if (profile?.role !== 'herboriste' && profile?.role !== 'admin')
    return { error: 'Non autorisé — réservé aux herboristes' }

  const herbName = profile?.display_name
    || user.email?.split('@')[0]
    || 'Herboriste'

  const { error } = await supabase.from('side_effect_reports').update({
    herboriste_response: response.trim(),
    herboriste_id: user.id,
    herboriste_name: herbName,
    status: 'repondu',
    updated_at: new Date().toISOString(),
  }).eq('id', reportId)

  if (error) return { error: error.message }
  revalidatePath('/conseils')
  return { success: true }
}

export async function checkPendingApplication(email: string) {
  if (!isSupabaseConfigured()) return { exists: false }
  const supabase = await createClient()
  const { data } = await supabase
    .from('herboriste_applications')
    .select('status')
    .eq('email', email)
    .maybeSingle()

  if (data) {
    return { exists: true, status: data.status }
  }
  return { exists: false }
}

