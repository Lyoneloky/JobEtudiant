import { createBrowserClient } from '@supabase/ssr'

function getValidCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  return {
    url: url.startsWith('http') ? url : 'https://placeholder.supabase.co',
    key: key.length > 10 ? key : 'placeholder-anon-key-terrabio',
  }
}

export function createClient() {
  const { url, key } = getValidCredentials()
  return createBrowserClient(url, key)
}
