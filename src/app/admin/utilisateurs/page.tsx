import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Users, ArrowLeft, Shield, UserCheck, UserX } from 'lucide-react'

const C = { primary:'#22c55e', primaryDark:'#166534', primaryLight:'#dcfce7', text:'#616161', bg:'#F8FAF5', white:'#FFFFFF', border:'#E8EDE4' }

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
}

type AuthUser = { id:string; email?:string; created_at:string; last_sign_in_at?:string }
type Profile  = { id:string; display_name:string|null; role:string }

export default async function AdminUtilisateursPage() {
  /* Auth guard */
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  /* Fetch users via Admin API (service_role) */
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

  let authUsers: AuthUser[] = []
  let profiles:  Profile[]  = []
  let fetchError = false

  if (url && svcKey) {
    try {
      const adminClient = createAdminClient(url, svcKey, { auth: { autoRefreshToken: false, persistSession: false } })
      const [{ data: usersData, error: usersErr }, { data: profilesData }] = await Promise.all([
        adminClient.auth.admin.listUsers({ page: 1, perPage: 100 }),
        adminClient.from('profiles').select('id, display_name, role'),
      ])
      if (usersErr) { fetchError = true }
      else {
        authUsers = (usersData?.users ?? []) as AuthUser[]
        profiles  = (profilesData ?? []) as Profile[]
      }
    } catch { fetchError = true }
  }

  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))

  const stats = {
    total:  authUsers.length,
    admins: profiles.filter(p => p.role === 'admin').length,
    actifs: authUsers.filter(u => u.last_sign_in_at).length,
  }

  return (
    <div style={{ fontFamily:'"Inter",Arial,sans-serif', background:C.bg, minHeight:'100vh' }}>
      <Navbar />
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'40px 24px 80px' }}>

        <Link href="/admin/plantes" style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:14, color:C.text, textDecoration:'none', marginBottom:28 }}>
          <ArrowLeft style={{ width:16, height:16 }}/> Retour à la gestion des plantes
        </Link>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32, flexWrap:'wrap', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:52, height:52, background:'#EFF6FF', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Users style={{ width:26, height:26, color:'#1565C0' }}/>
            </div>
            <div>
              <h1 style={{ fontSize:32, fontWeight:800, color:'#111', fontFamily:"'Poppins',sans-serif" }}>Gestion des utilisateurs</h1>
              <p style={{ fontSize:14, color:C.text, marginTop:2 }}>
                {fetchError ? 'Erreur de chargement' : `${stats.total} utilisateurs enregistrés`}
              </p>
            </div>
          </div>
        </div>

        {fetchError ? (
          <div style={{ background:'#FFF0F0', border:'1px solid #FFD6D6', borderRadius:16, padding:'20px 24px', color:'#D32F2F', fontSize:14 }}>
            Impossible de charger les utilisateurs. Vérifiez la clé SUPABASE_SERVICE_ROLE_KEY dans .env.local.
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="tb-grid-4" style={{ marginBottom:28 }}>
              {[
                { value:stats.total,  label:'Total utilisateurs', bg:'#EFF6FF', color:'#1565C0', Icon:Users },
                { value:stats.actifs, label:'Connectés au moins une fois', bg:C.primaryLight, color:C.primaryDark, Icon:UserCheck },
                { value:stats.admins, label:'Administrateurs', bg:'#F3E8FF', color:'#6B21A8', Icon:Shield },
                { value:stats.total - stats.admins, label:'Utilisateurs standard', bg:'#F5F9EF', color:C.primaryDark, Icon:Users },
              ].map(({ value, label, bg, color, Icon }) => (
                <div key={label} style={{ background:C.white, borderRadius:18, padding:'20px 22px', border:`1px solid ${C.border}` }}>
                  <div style={{ width:36, height:36, background:bg, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                    <Icon style={{ width:18, height:18, color }}/>
                  </div>
                  <div style={{ fontSize:28, fontWeight:800, color:'#111', fontFamily:"'Poppins',sans-serif" }}>{value}</div>
                  <div style={{ fontSize:13, color:C.text, marginTop:4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Tableau */}
            <div style={{ background:C.white, borderRadius:22, border:`1px solid ${C.border}`, overflow:'hidden' }}>
              {/* Header */}
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 0.8fr 0.8fr', padding:'14px 22px', background:C.bg, borderBottom:`1px solid ${C.border}` }}>
                {['Email / Nom', 'Date d\'inscription', 'Rôle', 'Dernière connexion'].map(h => (
                  <div key={h} style={{ fontSize:12, fontWeight:700, color:C.text, textTransform:'uppercase', letterSpacing:0.5 }}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              {authUsers.length === 0 ? (
                <div style={{ padding:'40px 22px', textAlign:'center', color:C.text }}>
                  <p style={{ fontSize:15 }}>Aucun utilisateur trouvé.</p>
                </div>
              ) : authUsers.map((u, i) => {
                const prof = profileMap[u.id]
                const role = prof?.role ?? 'user'
                const name = prof?.display_name ?? u.email?.split('@')[0] ?? 'Utilisateur'
                const initial = (prof?.display_name ?? u.email ?? 'U').charAt(0).toUpperCase()

                return (
                  <div key={u.id} style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 0.8fr 0.8fr', padding:'16px 22px', borderBottom:i < authUsers.length-1 ? `1px solid ${C.border}` : 'none', alignItems:'center' }}>
                    {/* Email */}
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:role==='admin' ? '#F3E8FF' : C.primaryLight, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16, color:role==='admin' ? '#6B21A8' : C.primaryDark, flexShrink:0 }}>
                        {initial}
                      </div>
                      <div>
                        <div style={{ fontSize:14, color:'#111', fontWeight:500 }}>{name}</div>
                        <div style={{ fontSize:12, color:C.text }}>{u.email}</div>
                      </div>
                    </div>
                    {/* Date */}
                    <div style={{ fontSize:13, color:C.text }}>{formatDate(u.created_at)}</div>
                    {/* Rôle */}
                    <div>
                      <span style={{ height:26, padding:'0 10px', borderRadius:8, fontSize:12, fontWeight:700, display:'inline-flex', alignItems:'center', gap:5, background:role==='admin' ? '#F3E8FF' : C.primaryLight, color:role==='admin' ? '#6B21A8' : C.primaryDark }}>
                        {role==='admin' && <Shield style={{ width:11, height:11 }}/>}
                        {role==='admin' ? 'Admin' : role==='herboriste' ? 'Herboriste' : 'Utilisateur'}
                      </span>
                    </div>
                    {/* Dernière connexion */}
                    <div style={{ fontSize:13, color:C.text }}>
                      {u.last_sign_in_at ? (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                          <UserCheck style={{ width:13, height:13, color:C.primary }}/>
                          {formatDate(u.last_sign_in_at)}
                        </span>
                      ) : (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, color:'#BDBDBD' }}>
                          <UserX style={{ width:13, height:13 }}/> Jamais connecté
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
