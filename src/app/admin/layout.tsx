import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="tb-dashboard" style={{ fontFamily: '"Inter", Arial, sans-serif', background: '#F8FAF5', minHeight: '100vh' }}>
      <AdminSidebar displayName={profile?.display_name ?? null} email={user.email ?? null} />
      <div className="tb-main-content">
        {children}
      </div>
    </div>
  )
}
