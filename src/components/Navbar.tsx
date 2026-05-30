'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Leaf, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const C = { primaryDark:'#166534', primary:'#22c55e', primaryLight:'#dcfce7', white:'#FFFFFF', border:'#E8EDE4', text:'#616161', bg:'#F8FAF5' }

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

  /* Ferme le menu mobile si on navigue */
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
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 24px',height:68,display:'flex',justifyContent:'space-between',alignItems:'center'}}>

        {/* Logo */}
        <Link href="/" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none',flexShrink:0}}>
          <div style={{width:40,height:40,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Leaf style={{width:20,height:20,color:'white'}}/>
          </div>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:C.primaryDark,lineHeight:'22px',fontFamily:"'Poppins',sans-serif"}}>TerraBio</div>
            <div style={{fontSize:10,color:C.text,lineHeight:'14px'}}>Santé naturelle · Cameroun</div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex" style={{alignItems:'center',gap:24}}>
          {navLinks.map(({label,href})=>(
            <Link key={label} href={href} style={{fontSize:14,fontWeight:500,color:isActive(href)?C.primaryDark:'#3D3D3D',textDecoration:'none',borderBottom:isActive(href)?`2px solid ${C.primary}`:'2px solid transparent',paddingBottom:2,transition:'color .15s'}}>
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex" style={{alignItems:'center',gap:10}}>
          {user?(
            <>
              <Link href="/dashboard" style={{display:'flex',alignItems:'center',gap:6,height:38,padding:'0 14px',borderRadius:10,background:isActive('/dashboard')?C.primaryLight:'transparent',color:isActive('/dashboard')?C.primaryDark:'#3D3D3D',fontSize:14,fontWeight:500,textDecoration:'none'}}>
                <LayoutDashboard style={{width:15,height:15}}/> Tableau de bord
              </Link>
              <button onClick={handleSignOut} style={{display:'flex',alignItems:'center',gap:6,background:'#FFF0F0',color:'#D32F2F',height:38,padding:'0 14px',borderRadius:10,border:'none',cursor:'pointer',fontSize:13,fontWeight:600}}>
                <LogOut style={{width:14,height:14}}/> Déconnexion
              </button>
            </>
          ):(
            <>
              <Link href="/auth/login" style={{height:38,padding:'0 16px',borderRadius:10,border:`1.5px solid ${C.border}`,color:'#333',fontSize:14,fontWeight:500,textDecoration:'none',display:'inline-flex',alignItems:'center'}}>
                Connexion
              </Link>
              <Link href="/auth/register" style={{height:38,padding:'0 16px',borderRadius:10,background:C.primaryDark,color:'white',fontSize:14,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center'}}>
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden"
          onClick={()=>setMenuOpen(!menuOpen)}
          style={{background:'none',border:'none',cursor:'pointer',width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,color:'#333'}}
          aria-label="Menu"
        >
          {menuOpen?<X style={{width:22,height:22}}/>:<Menu style={{width:22,height:22}}/>}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen&&(
        <div style={{position:'fixed',inset:0,zIndex:99}} onClick={()=>setMenuOpen(false)}/>
      )}

      {/* Mobile menu panel */}
      <div style={{
        position:'fixed',top:68,left:0,right:0,background:C.white,
        borderBottom:`1px solid ${C.border}`,zIndex:100,
        transform:menuOpen?'translateY(0)':'translateY(-110%)',
        transition:'transform .22s ease',
        boxShadow:menuOpen?'0 8px 32px rgba(0,0,0,.12)':'none',
        maxHeight:'calc(100vh - 68px)',overflowY:'auto',
      }}>
        <div style={{padding:'16px 24px',display:'flex',flexDirection:'column',gap:4}}>

          {/* Nav links */}
          <div style={{paddingBottom:12,borderBottom:`1px solid ${C.border}`,display:'flex',flexDirection:'column',gap:2}}>
            {navLinks.map(({label,href})=>(
              <Link key={label} href={href} onClick={()=>setMenuOpen(false)} style={{height:46,display:'flex',alignItems:'center',padding:'0 12px',borderRadius:12,fontSize:15,fontWeight:500,color:isActive(href)?C.primaryDark:'#333',background:isActive(href)?C.primaryLight:'transparent',textDecoration:'none'}}>
                {label}
              </Link>
            ))}
          </div>

          {/* Auth links */}
          <div style={{paddingTop:12,display:'flex',flexDirection:'column',gap:2}}>
            {user?(
              <>
                <Link href="/dashboard" onClick={()=>setMenuOpen(false)} style={{height:46,display:'flex',alignItems:'center',gap:10,padding:'0 12px',borderRadius:12,fontSize:15,fontWeight:500,color:isActive('/dashboard')?C.primaryDark:'#333',background:isActive('/dashboard')?C.primaryLight:'transparent',textDecoration:'none'}}>
                  <LayoutDashboard style={{width:16,height:16}}/> Tableau de bord
                </Link>
                <button onClick={handleSignOut} style={{height:46,display:'flex',alignItems:'center',gap:10,padding:'0 12px',borderRadius:12,fontSize:15,fontWeight:500,color:'#D32F2F',background:'#FFF5F4',border:'none',cursor:'pointer',textAlign:'left',marginTop:4}}>
                  <LogOut style={{width:15,height:15}}/> Se déconnecter
                </button>
              </>
            ):(
              <div style={{display:'flex',gap:10,paddingTop:4}}>
                <Link href="/auth/login" onClick={()=>setMenuOpen(false)} style={{flex:1,height:46,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:12,border:`1.5px solid ${C.border}`,fontSize:14,fontWeight:600,color:'#333',textDecoration:'none'}}>
                  Connexion
                </Link>
                <Link href="/auth/register" onClick={()=>setMenuOpen(false)} style={{flex:1,height:46,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:12,background:C.primaryDark,fontSize:14,fontWeight:600,color:'white',textDecoration:'none'}}>
                  S&apos;inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
