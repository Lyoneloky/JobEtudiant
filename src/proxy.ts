import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith('http')) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Routes publiques : page d'accueil et authentification uniquement
  const isPublic = pathname === '/' || pathname.startsWith('/auth/')
  const isAdminRoute = pathname.startsWith('/admin')

  // Visiteur non connecté → redirige vers login pour toute route non-publique
  if (!user && !isPublic) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Récupérer le profil si connecté
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, approved')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // Herboriste non approuvé → page d'attente
  if (user && profile?.role === 'herboriste' && !profile.approved && !isPublic) {
    return NextResponse.redirect(new URL('/auth/pending', request.url))
  }

  // Utilisateur connecté sur une page auth ou l'accueil → redirige selon son rôle
  const isAuthOrHome = pathname.startsWith('/auth/') || pathname === '/'
  if (user && isAuthOrHome && pathname !== '/auth/pending') {
    const dest = (profile?.role === 'admin' || profile?.role === 'herboriste') ? '/dashboard' : '/plantes'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Accès /admin réservé aux admins
  if (user && isAdminRoute) {
    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
