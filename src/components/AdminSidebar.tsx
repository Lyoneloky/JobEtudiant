'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Leaf, BookOpen, MapPin, Menu, X, LogOut,
  MessageSquare, Users, LayoutDashboard, Search, Activity, Sun, Settings,
} from 'lucide-react'

const C = {
  primary: '#22c55e', primaryDark: '#166534', primaryLight: '#dcfce7',
  white: '#FFFFFF', text: '#616161', border: '#E8EDE4',
}

const ADMIN_NAV = [
  { Icon: LayoutDashboard, label: 'Dashboard',    href: '/dashboard',           section: 'admin' },
  { Icon: Leaf,            label: 'Plantes',       href: '/admin/plantes',       section: 'admin' },
  { Icon: MessageSquare,   label: 'Consultations', href: '/admin/consultations', section: 'admin' },
  { Icon: Users,           label: 'Utilisateurs',  href: '/admin/utilisateurs',  section: 'admin' },
  { Icon: Search,          label: 'Catalogue',     href: '/admin/app/catalogue', section: 'app' },
  { Icon: Activity,        label: 'Symptômes',     href: '/admin/app/symptomes', section: 'app' },
  { Icon: MapPin,          label: 'Carte',         href: '/admin/app/carte',     section: 'app' },
  { Icon: BookOpen,        label: 'Glossaire',     href: '/admin/app/glossaire', section: 'app' },
  { Icon: Sun,             label: 'Conseils',      href: '/admin/app/conseils',  section: 'app' },
  { Icon: Settings,        label: 'Profil',        href: '/profil',              section: 'profile' },
] as const

function NavItem({ Icon, label, href, active }: { Icon: React.ElementType; label: string; href: string; active?: boolean }) {
  return (
    <Link href={href} style={{ height: 40, padding: '0 12px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, background: active ? C.primaryLight : 'transparent', color: active ? C.primaryDark : '#3D3D3D', fontWeight: active ? 600 : 500, fontSize: 13, textDecoration: 'none' }}>
      <Icon style={{ width: 16, height: 16, flexShrink: 0, color: active ? C.primaryDark : '#6B7B69' }} />
      {label}
    </Link>
  )
}

function SectionLabel({ label }: { label: string }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: '#9AA49A', letterSpacing: 1.5, padding: '8px 12px 3px', textTransform: 'uppercase' }}>{label}</div>
}

export default function AdminSidebar({ displayName, email }: { displayName: string | null; email: string | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router   = useRouter()
  const name    = displayName || email?.split('@')[0] || 'Admin'
  const initial = name.charAt(0).toUpperCase()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Topbar mobile */}
      <div className="tb-mobile-topbar">
        <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <Menu style={{ width: 22, height: 22, color: C.text }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.png" alt="TerraBio" style={{ width: 30, height: 30, borderRadius: 8 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: C.primaryDark, fontFamily: "'Poppins',sans-serif" }}>TerraBio</span>
        </div>
        <div style={{ marginLeft: 'auto', width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{initial}</span>
        </div>
      </div>

      {/* Overlay mobile */}
      <div className={`tb-sidebar-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

      {/* Sidebar */}
      <aside className={`tb-sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexShrink: 0 }}>
          <img src="/logo.png" alt="TerraBio" style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 700, color: C.primaryDark, fontFamily: "'Poppins',sans-serif" }}>TerraBio</div>
          <button onClick={() => setOpen(false)} className="tb-nav-burger" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X style={{ width: 18, height: 18, color: C.text }} />
          </button>
        </div>

        {/* User card */}
        <div style={{ background: '#F4F8F3', border: '1px solid #E7ECE3', borderRadius: 14, padding: '12px 14px', marginBottom: 14, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.white }}>{initial}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1B1B1B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <span style={{ fontSize: 10, background: '#F3E8FF', color: '#6B21A8', padding: '1px 7px', borderRadius: 999, fontWeight: 700 }}>Admin</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflowY: 'auto' }}>
          <SectionLabel label="Administration" />
          {ADMIN_NAV.filter(n => n.section === 'admin').map(({ Icon, label, href }) => (
            <NavItem key={href} Icon={Icon} label={label} href={href} active={isActive(href)} />
          ))}
          <SectionLabel label="Application" />
          {ADMIN_NAV.filter(n => n.section === 'app').map(({ Icon, label, href }) => (
            <NavItem key={href} Icon={Icon} label={label} href={href} active={isActive(href)} />
          ))}
          <SectionLabel label="Compte" />
          {ADMIN_NAV.filter(n => n.section === 'profile').map(({ Icon, label, href }) => (
            <NavItem key={href} Icon={Icon} label={label} href={href} active={isActive(href)} />
          ))}
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
            <button onClick={handleSignOut} style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', color: '#D32F2F', fontWeight: 500, fontSize: 13, border: 'none', cursor: 'pointer' }}>
              <LogOut style={{ width: 16, height: 16, flexShrink: 0 }} /> Déconnexion
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}
