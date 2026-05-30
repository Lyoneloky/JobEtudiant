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
    const { error } = await supabase.auth.exchangeCodeForSession(params.code)

    if (!error) {
      if (params.type === 'recovery') {
        redirect('/auth/update-password')
      }
      redirect('/dashboard')
    }
  }

  redirect('/auth/login')
}
