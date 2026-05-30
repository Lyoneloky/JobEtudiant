import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getValidCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  return {
    url: url.startsWith('http') ? url : 'https://placeholder.supabase.co',
    key: key.length > 10 ? key : 'placeholder-anon-key-terrabio',
  }
}

export async function createClient() {
  const cookieStore = await cookies()
  const { url, key } = getValidCredentials()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignoré dans les Server Components
        }
      },
    },
  })
}
