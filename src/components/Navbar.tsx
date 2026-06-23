'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const C = { primaryDark:'#166534', primary:'#22c55e', primaryLight:'#dcfce7', white:'#FFFFFF', border:'#E8EDE4', text:'#616161' }

export default function Navbar() {
  const [user,     setUser]     = useState<User|null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router   = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(()=>{
    supabase.auth.getUser().then(({data})=>setUser(data.user))
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>setUser(session?.user??null))
    return ()=>subscription.unsubscribe()
  },[])

  useEffect(()=>{ setMenuOpen(false) },[pathname])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    {label:'Plantes',   href:'/plantes'},
    {label:'Symptômes', href:'/symptomes'},
    {label:'Conseils',  href:'/conseils'},
    {label:'Carte',     href:'/carte'},
    {label:'Glossaire', href:'/glossaire'},
  ]

  const isActive = (href:string) => pathname===href

  return (
    <nav style={{background:C.white,borderBottom:`1px solid ${C.border}`,position:'sticky',top:0,zIndex:100,fontFamily:'"Inter",Arial,sans-serif'}}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 20px',height:64,display:'flex',justifyContent:'space-between',alignItems:'center',gap:16}}>

        {/* Logo */}
        <Link href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none',flexShrink:0}}>
          <img src="/logo.png" alt="TerraBio" style={{width:38,height:38,borderRadius:10,flexShrink:0}} />
          <div>
            <div style={{fontSize:17,fontWeight:700,color:C.primaryDark,lineHeight:'20px',fontFamily:"'Poppins',sans-serif"}}>TerraBio</div>
            <div style={{fontSize:10,color:C.text,lineHeight:'13px'}}>Santé naturelle · Cameroun</div>
          </div>
        </Link>

        {/* Desktop — liens navigation (masqué sur mobile via CSS) */}
        <div className="tb-nav-links">
          {navLinks.map(({label,href})=>(
            <Link key={label} href={href} style={{fontSize:14,fontWeight:500,color:isActive(href)?C.primaryDark:'#3D3D3D',textDecoration:'none',borderBottom:isActive(href)?`2px solid ${C.primary}`:'2px solid transparent',paddingBottom:2,whiteSpace:'nowrap'}}>
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop — auth (masqué sur mobile via CSS) */}
        <div className="tb-nav-auth">
          {user?(
            <>
              <Link href="/dashboard" style={{display:'flex',alignItems:'center',gap:6,height:36,padding:'0 14px',borderRadius:10,background:isActive('/dashboard')?C.primaryLight:'transparent',color:isActive('/dashboard')?C.primaryDark:'#3D3D3D',fontSize:13,fontWeight:500,textDecoration:'none',whiteSpace:'nowrap'}}>
                <LayoutDashboard style={{width:14,height:14}}/> Tableau de bord
              </Link>
              <button onClick={handleSignOut} style={{display:'flex',alignItems:'center',gap:5,background:'#FFF0F0',color:'#D32F2F',height:36,padding:'0 12px',borderRadius:10,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,whiteSpace:'nowrap'}}>
                <LogOut style={{width:13,height:13}}/> Déconnexion
              </button>
            </>
          ):(
            <>
              <Link href="/auth/login" style={{height:36,padding:'0 14px',borderRadius:10,border:`1.5px solid ${C.border}`,color:'#333',fontSize:13,fontWeight:500,textDecoration:'none',display:'inline-flex',alignItems:'center',whiteSpace:'nowrap'}}>
                Connexion
              </Link>
              <Link href="/auth/register" style={{height:36,padding:'0 14px',borderRadius:10,background:C.primaryDark,color:'white',fontSize:13,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',whiteSpace:'nowrap'}}>
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile — hamburger (visible uniquement sur mobile via CSS) */}
        <button
          className="tb-nav-burger"
          onClick={()=>setMenuOpen(!menuOpen)}
          style={{background:'none',border:'none',cursor:'pointer',width:40,height:40,alignItems:'center',justifyContent:'center',borderRadius:8,color:'#333',flexShrink:0}}
          aria-label="Menu"
        >
          {menuOpen?<X style={{width:22,height:22}}/>:<Menu style={{width:22,height:22}}/>}
        </button>
      </div>

      {/* Mobile — overlay pour fermer */}
      {menuOpen&&(
        <div onClick={()=>setMenuOpen(false)} style={{position:'fixed',inset:0,zIndex:98,background:'transparent'}}/>
      )}

      {/* Mobile — menu panel */}
      <div style={{
        position:'fixed',top:64,left:0,right:0,
        background:C.white,
        borderBottom:`1px solid ${C.border}`,
        zIndex:99,
        maxHeight:menuOpen?'calc(100vh - 64px)':'0',
        overflow:'hidden',
        transition:'max-height .25s ease',
        boxShadow:menuOpen?'0 8px 32px rgba(0,0,0,.12)':'none',
      }}>
        <div style={{padding:'12px 20px 20px',display:'flex',flexDirection:'column',gap:2}}>

          {/* Liens navigation */}
          {navLinks.map(({label,href})=>(
            <Link key={label} href={href} onClick={()=>setMenuOpen(false)}
              style={{height:46,display:'flex',alignItems:'center',padding:'0 12px',borderRadius:10,fontSize:15,fontWeight:500,color:isActive(href)?C.primaryDark:'#333',background:isActive(href)?C.primaryLight:'transparent',textDecoration:'none'}}>
              {label}
            </Link>
          ))}

          <div style={{height:1,background:C.border,margin:'8px 0'}}/>

          {/* Auth */}
          {user?(
            <>
              <Link href="/dashboard" onClick={()=>setMenuOpen(false)}
                style={{height:46,display:'flex',alignItems:'center',gap:10,padding:'0 12px',borderRadius:10,fontSize:15,fontWeight:500,color:isActive('/dashboard')?C.primaryDark:'#333',background:isActive('/dashboard')?C.primaryLight:'transparent',textDecoration:'none'}}>
                <LayoutDashboard style={{width:16,height:16}}/> Tableau de bord
              </Link>
              <button onClick={handleSignOut}
                style={{height:46,display:'flex',alignItems:'center',gap:10,padding:'0 12px',borderRadius:10,fontSize:15,fontWeight:500,color:'#D32F2F',background:'#FFF5F4',border:'none',cursor:'pointer',textAlign:'left',marginTop:4}}>
                <LogOut style={{width:15,height:15}}/> Se déconnecter
              </button>
            </>
          ):(
            <div style={{display:'flex',gap:10,marginTop:4}}>
              <Link href="/auth/login" onClick={()=>setMenuOpen(false)}
                style={{flex:1,height:46,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:12,border:`1.5px solid ${C.border}`,fontSize:15,fontWeight:600,color:'#333',textDecoration:'none'}}>
                Connexion
              </Link>
              <Link href="/auth/register" onClick={()=>setMenuOpen(false)}
                style={{flex:1,height:46,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:12,background:C.primaryDark,fontSize:15,fontWeight:600,color:'white',textDecoration:'none'}}>
                S&apos;inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
