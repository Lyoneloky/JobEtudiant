import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; type?: string; error?: string; error_description?: string }>
}) {
  const params = await searchParams

  if (params.error) {
    redirect(`/auth/login?error=${encodeURIComponent(params.error_description ?? params.error)}`)
  }

  if (params.code) {
    const supabase = await createClient()
    const { error, data: session } = await supabase.auth.exchangeCodeForSession(params.code)

    if (!error) {
      if (params.type === 'recovery') {
        redirect('/auth/update-password')
      }
      // Redirection selon le rôle : admin/herboriste → dashboard, utilisateur standard → accueil
      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      redirect((prof?.role === 'admin' || prof?.role === 'herboriste') ? '/dashboard' : '/plantes')
    }
  }

  redirect('/auth/login')
}
