'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Leaf, Home, Heart, Bell, Sun, BookOpen, Settings, Search,
  ChevronRight, AlertTriangle, Info, ArrowRight, Shield, MapPin,
  Activity, FileText, Clock, CheckCircle, MessageSquare, Menu, X,
  Users, PlusCircle, Edit, LayoutDashboard, TrendingUp, LogOut, Eye
} from 'lucide-react'

const C = {
  primary:'#22c55e', primaryDark:'#166534', primaryLight:'#dcfce7',
  bg:'#F8FAF5', white:'#FFFFFF', text:'#616161', border:'#E8EDE4', dark:'#111111',
}

const PLANT_COLORS = [C.primaryLight,'#FFFDE8','#FFF8E8','#FFF0F0','#F0EFF0','#E8F5E8','#EFF6FF','#F3E8FF']
const PLANT_EMOJI: Record<string,string> = { Goyave:'🍃',Citronnelle:'🌿',Gingembre:'🫚',Prunier:'🌲',Moringa:'🌱',Neem:'🍀',Aloe:'🪴',Eucalyptus:'🌿',Papayer:'🍃',Basilic:'🌿' }
const plantEmoji = (n:string) => { const k=Object.keys(PLANT_EMOJI).find(k=>n.includes(k)); return k?PLANT_EMOJI[k]:'🌿' }
const plantColor = (i:number) => PLANT_COLORS[i%PLANT_COLORS.length]
const todayLabel = () => new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).replace(/^\w/,c=>c.toUpperCase())

type Profile     = { display_name:string|null; role:string }
type PlantRow    = { id:string; name:string; latin_name:string|null; description:string; properties:string[] }
type FavoriteRow = { id:string; plant_id:string; plants:PlantRow }
type ConsultRow  = { id:string; symptoms_description:string; status:string; admin_response:string|null; created_at:string; profiles?:{display_name:string|null}|null }
type TipRow      = { title:string; content:string; plant_name:string|null }
type AdminStats  = { plants:number; pendingCons:number; totalCons:number; glossary:number }

/* ── Stat card compacte (horizontale) ─────────── */
function StatCard({ value,label,Icon,bg,iconColor }:{value:number|string;label:string;Icon:React.ElementType;bg:string;iconColor:string}) {
  return (
    <div style={{background:C.white,borderRadius:14,padding:'11px 14px',border:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:10}}>
      <div style={{width:36,height:36,background:bg,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <Icon style={{width:16,height:16,color:iconColor}}/>
      </div>
      <div>
        <div style={{fontSize:22,fontWeight:800,color:'#111',lineHeight:'26px',fontFamily:"'Poppins',sans-serif"}}>{value}</div>
        <div style={{fontSize:11,color:C.text,marginTop:1}}>{label}</div>
      </div>
    </div>
  )
}

/* ── Badge statut ─────────────────────────────── */
function StatusBadge({status}:{status:string}) {
  const map:Record<string,{label:string;bg:string;color:string;Icon:React.ElementType}> = {
    en_attente:{label:'En attente',bg:'#FFF8EF',color:'#E65100',Icon:Clock},
    en_cours:  {label:'En cours',  bg:'#EFF6FF',color:'#1565C0',Icon:Activity},
    traitee:   {label:'Répondu',   bg:C.primaryLight,color:C.primaryDark,Icon:CheckCircle},
    fermee:    {label:'Fermée',    bg:'#F4F4F4',color:'#616161',Icon:CheckCircle},
  }
  const s=map[status]??map['en_attente']; const {Icon}=s
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,height:22,padding:'0 8px',background:s.bg,borderRadius:6,fontSize:11,fontWeight:700,color:s.color,flexShrink:0}}>
      <Icon style={{width:10,height:10}}/>{s.label}
    </span>
  )
}

/* ── Sidebar ──────────────────────────────────── */
const USER_NAV = [
  {Icon:Home,       label:'Tableau de bord', href:'/dashboard'},
  {Icon:Activity,   label:'Symptômes',       href:'/symptomes'},
  {Icon:Heart,      label:'Mes favoris',     href:'/favoris'},
  {Icon:BookOpen,   label:'Glossaire',       href:'/glossaire'},
  {Icon:Sun,        label:'Conseils',        href:'/conseils'},
  {Icon:MapPin,     label:'Carte',           href:'/carte'},
  {Icon:FileText,   label:'Consultations',   href:'/consultation'},
  {Icon:Settings,   label:'Mon profil',      href:'/profil'},
]

const ADMIN_NAV = [
  {Icon:LayoutDashboard,label:'Dashboard',       href:'/dashboard',           section:'admin'},
  {Icon:Leaf,           label:'Plantes',         href:'/admin/plantes',       section:'admin'},
  {Icon:MessageSquare,  label:'Consultations',   href:'/admin/consultations', section:'admin'},
  {Icon:Users,          label:'Utilisateurs',    href:'/admin/utilisateurs',  section:'admin'},
  {Icon:Search,         label:'Catalogue',       href:'/plantes',             section:'app'},
  {Icon:Activity,       label:'Symptômes',       href:'/symptomes',           section:'app'},
  {Icon:MapPin,         label:'Carte',           href:'/carte',               section:'app'},
  {Icon:BookOpen,       label:'Glossaire',       href:'/glossaire',           section:'app'},
  {Icon:Sun,            label:'Conseils',        href:'/conseils',            section:'app'},
  {Icon:Settings,       label:'Profil',          href:'/profil',              section:'profile'},
]

const HERBORISTE_NAV = [
  {Icon:LayoutDashboard,label:'Dashboard',       href:'/dashboard',           section:'admin'},
  {Icon:Leaf,           label:'Plantes',         href:'/admin/plantes',       section:'admin'},
  {Icon:MessageSquare,  label:'Consultations',   href:'/dashboard',           section:'admin'},
  {Icon:Search,         label:'Catalogue',       href:'/plantes',             section:'app'},
  {Icon:Activity,       label:'Symptômes',       href:'/symptomes',           section:'app'},
  {Icon:MapPin,         label:'Carte',           href:'/carte',               section:'app'},
  {Icon:BookOpen,       label:'Glossaire',       href:'/glossaire',           section:'app'},
  {Icon:Sun,            label:'Conseils',        href:'/conseils',            section:'app'},
  {Icon:Settings,       label:'Profil',          href:'/profil',              section:'profile'},
]

function NavItem({Icon,label,href,active}:{Icon:React.ElementType;label:string;href:string;active?:boolean}) {
  return (
    <Link href={href} style={{height:40,padding:'0 12px',borderRadius:10,display:'flex',alignItems:'center',gap:10,background:active?C.primaryLight:'transparent',color:active?C.primaryDark:'#3D3D3D',fontWeight:active?600:500,fontSize:13,textDecoration:'none'}}>
      <Icon style={{width:16,height:16,flexShrink:0,color:active?C.primaryDark:'#6B7B69'}}/>
      {label}
    </Link>
  )
}

function SectionLabel({label}:{label:string}) {
  return <div style={{fontSize:10,fontWeight:700,color:'#9AA49A',letterSpacing:1.5,padding:'8px 12px 3px',textTransform:'uppercase'}}>{label}</div>
}

function Sidebar({displayName,email,role,open,onClose,navContent,onSignOut}:{
  displayName:string|null;email:string|null;role:string;open:boolean;onClose:()=>void;navContent:React.ReactNode;onSignOut:()=>void
}) {
  const name    = displayName||email?.split('@')[0]||'Utilisateur'
  const initial = name.charAt(0).toUpperCase()

  const roleBadge = role==='admin'
    ? {label:'Admin',      bg:'#F3E8FF', color:'#6B21A8'}
    : role==='herboriste'
    ? {label:'Herboriste', bg:C.primaryLight, color:C.primaryDark}
    : {label:'Utilisateur',bg:'#F0F0F0',      color:'#555'}

  return (
    <>
      <div className={`tb-sidebar-overlay${open?' open':''}`} onClick={onClose}/>
      <aside className={`tb-sidebar${open?' open':''}`}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,flexShrink:0}}>
          <img src="/logo.png" alt="TerraBio" style={{width:38,height:38,borderRadius:10,flexShrink:0}} />
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:17,fontWeight:700,color:C.primaryDark,fontFamily:"'Poppins',sans-serif"}}>TerraBio</div>
          </div>
          <button onClick={onClose} className="tb-nav-burger" style={{background:'none',border:'none',cursor:'pointer',padding:4}}>
            <X style={{width:18,height:18,color:C.text}}/>
          </button>
        </div>

        {/* User card compacte */}
        <div style={{background:'#F4F8F3',border:`1px solid #E7ECE3`,borderRadius:14,padding:'12px 14px',marginBottom:14,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span style={{fontSize:15,fontWeight:700,color:C.white}}>{initial}</span>
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:'#1B1B1B',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</div>
              <span style={{fontSize:10,background:roleBadge.bg,color:roleBadge.color,padding:'1px 7px',borderRadius:999,fontWeight:700}}>{roleBadge.label}</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{display:'flex',flexDirection:'column',gap:1,flex:1,overflowY:'auto'}}>
          {navContent}
          {/* Déconnexion */}
          <div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${C.border}`}}>
            <button onClick={onSignOut} style={{width:'100%',height:40,padding:'0 12px',borderRadius:10,display:'flex',alignItems:'center',gap:10,background:'transparent',color:'#D32F2F',fontWeight:500,fontSize:13,textDecoration:'none',border:'none',cursor:'pointer'}}>
              <LogOut style={{width:16,height:16,flexShrink:0}}/> Déconnexion
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}

/* ── TopBar ───────────────────────────────────── */
function TopBar({onMenuClick,name,showSearch=true}:{onMenuClick:()=>void;name:string;showSearch?:boolean}) {
  const router = useRouter()
  return (
    <>
      {/* Mobile */}
      <div className="tb-mobile-topbar">
        <button onClick={onMenuClick} style={{background:'none',border:'none',cursor:'pointer',padding:4}}>
          <Menu style={{width:22,height:22,color:C.text}}/>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <img src="/logo.png" alt="TerraBio" style={{width:30,height:30,borderRadius:8}} />
          <span style={{fontSize:15,fontWeight:700,color:C.primaryDark,fontFamily:"'Poppins',sans-serif"}}>TerraBio</span>
        </div>
        <div style={{marginLeft:'auto',width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:13,fontWeight:700,color:C.white}}>{name.charAt(0).toUpperCase()}</span>
        </div>
      </div>
      {/* Desktop — barre de recherche + date */}
      <div className="tb-dash-topbar">
        {showSearch&&(
          <div style={{flex:1,maxWidth:440,height:44,background:C.white,border:`1px solid #E7ECE3`,borderRadius:999,display:'flex',alignItems:'center',padding:'0 16px',gap:8}}>
            <Search style={{width:16,height:16,color:'#9AA49A',flexShrink:0}}/>
            <input type="text" placeholder="Rechercher une plante..."
              onKeyDown={e=>{if(e.key==='Enter')router.push(`/plantes?q=${(e.target as HTMLInputElement).value}`)}}
              style={{border:'none',outline:'none',fontSize:13,color:'#1A1A1A',background:'transparent',flex:1}}/>
          </div>
        )}
        <div style={{marginLeft:'auto',background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:'8px 14px',display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:16}}>📅</span>
          <div>
            <div style={{fontSize:11,color:C.text,lineHeight:'14px'}}>Aujourd&apos;hui</div>
            <div style={{fontSize:12,fontWeight:700,color:'#1A1A1A',lineHeight:'16px'}}>{todayLabel()}</div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════ ADMIN DASHBOARD ════════════════════ */
const SAFETY_ALERTS_ADMIN = [
  {type:'red',   title:'Grossesse & plantes',  desc:'Neem, papayer et citronnelle contre-indiqués pendant la grossesse.'},
  {type:'orange',title:'Dosage — Gingembre',   desc:'Dose max. gingembre frais : 4g/jour. Surdosage → irritation gastrique.'},
  {type:'blue',  title:'Paludisme',            desc:'Paludisme avéré = consultation médicale immédiate requise.'},
]

function AlertItem({type,title,desc}:{type:string;title:string;desc:string}) {
  const s:{[k:string]:{bg:string;bd:string;c:string;Icon:React.ElementType}}={
    red:   {bg:'#FFF5F4',bd:'#FFD8D5',c:'#D32F2F',Icon:AlertTriangle},
    orange:{bg:'#FFF8EF',bd:'#FFE0B2',c:'#E65100',Icon:Bell},
    blue:  {bg:'#F1F7FF',bd:'#D6E8FF',c:'#1565C0',Icon:Info},
  }
  const st=s[type]; const {Icon}=st
  return (
    <div style={{padding:'10px 14px',borderRadius:12,background:st.bg,border:`1px solid ${st.bd}`,display:'flex',gap:10,alignItems:'flex-start'}}>
      <Icon style={{width:14,height:14,color:st.c,flexShrink:0,marginTop:2}}/>
      <div>
        <div style={{fontSize:12,fontWeight:700,color:'#1A1A1A',marginBottom:2}}>{title}</div>
        <div style={{fontSize:11,color:C.text,lineHeight:'17px'}}>{desc}</div>
      </div>
    </div>
  )
}

function AdminDashboard({displayName,email,adminStats,recentCons,plants}:{
  displayName:string|null;email:string|null;adminStats:AdminStats;recentCons:ConsultRow[];plants:PlantRow[]
}) {
  const [sidebarOpen,setSidebarOpen] = useState(false)
  const name    = displayName||email?.split('@')[0]||'Admin'
  const pathname = typeof window!=='undefined'?window.location.pathname:''
  const router  = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="tb-dashboard" style={{fontFamily:'"Inter",Arial,sans-serif',background:C.bg}}>
      <Sidebar displayName={displayName} email={email} role="admin" open={sidebarOpen} onClose={()=>setSidebarOpen(false)} onSignOut={handleSignOut}
        navContent={<>
          <SectionLabel label="Administration"/>
          {ADMIN_NAV.filter(n=>n.section==='admin').map(({Icon,label,href})=>(<NavItem key={href} Icon={Icon} label={label} href={href} active={pathname===href}/>))}
          <SectionLabel label="Application"/>
          {ADMIN_NAV.filter(n=>n.section==='app').map(({Icon,label,href})=>(<NavItem key={href} Icon={Icon} label={label} href={href}/>))}
          <SectionLabel label="Compte"/>
          {ADMIN_NAV.filter(n=>n.section==='profile').map(({Icon,label,href})=>(<NavItem key={href} Icon={Icon} label={label} href={href}/>))}
        </>}
      />

      <div className="tb-main-content tb-admin-content">
        <TopBar onMenuClick={()=>setSidebarOpen(true)} name={name}/>

        {/* ── Ligne 1 : badge + salutation + raccourcis ── */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexShrink:0,flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:5,background:'#F3E8FF',borderRadius:999,padding:'3px 10px',flexShrink:0}}>
              <Shield style={{width:11,height:11,color:'#6B21A8'}}/><span style={{fontSize:10,fontWeight:700,color:'#6B21A8',letterSpacing:0.3}}>ADMINISTRATEUR</span>
            </div>
            <h1 style={{fontSize:20,fontWeight:800,color:C.dark,letterSpacing:'-0.3px',fontFamily:"'Poppins',sans-serif",whiteSpace:'nowrap'}}>Bonjour, {name} 👋</h1>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {[{href:'/plantes',label:'Catalogue'},{href:'/symptomes',label:'Symptômes'},{href:'/carte',label:'Carte'},{href:'/conseils',label:'Conseils'}].map(({href,label})=>(
              <Link key={href} href={href} style={{height:30,padding:'0 11px',background:C.white,border:`1px solid ${C.border}`,borderRadius:8,color:'#333',fontSize:12,fontWeight:500,textDecoration:'none',display:'inline-flex',alignItems:'center'}}>{label}</Link>
            ))}
          </div>
        </div>

        {/* ── Ligne 2 : stats ── */}
        <div className="tb-grid-4" style={{marginBottom:10,flexShrink:0}}>
          <StatCard value={adminStats.plants}      label="Plantes publiées"      Icon={Leaf}          bg={C.primaryLight} iconColor={C.primaryDark}/>
          <StatCard value={adminStats.pendingCons} label="En attente de réponse" Icon={Clock}         bg="#FFE8B0"         iconColor="#E65100"/>
          <StatCard value={adminStats.totalCons}   label="Consultations total"   Icon={MessageSquare} bg="#D6E8FF"         iconColor="#1565C0"/>
          <StatCard value={adminStats.glossary}    label="Termes glossaire"      Icon={BookOpen}      bg="#E9D5FF"         iconColor="#6B21A8"/>
        </div>

        {/* ── Ligne 3 : corps — remplit la hauteur restante ── */}
        <div className="tb-admin-main">

          {/* Consultations récentes — flex column + scroll interne */}
          <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 18px',borderBottom:`1px solid ${C.border}`,background:'#FAFBF8',flexShrink:0}}>
              <h2 style={{fontSize:13,fontWeight:700,color:'#111',fontFamily:"'Poppins',sans-serif"}}>Consultations récentes</h2>
              <Link href="/admin/consultations" style={{fontSize:12,color:C.primaryDark,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:3}}>
                Tout voir <ChevronRight style={{width:13,height:13}}/>
              </Link>
            </div>
            {recentCons.length===0?(
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'30px 18px',textAlign:'center',color:C.text}}>
                <MessageSquare style={{width:32,height:32,color:'#E8EDE4',marginBottom:8}}/>
                <p style={{fontSize:13,fontWeight:500,marginBottom:4}}>Aucune consultation pour le moment.</p>
                <p style={{fontSize:12}}>Les demandes des utilisateurs apparaîtront ici.</p>
              </div>
            ):(
              <>
                <div className="tb-consult-header">
                  <div style={{fontSize:10,fontWeight:700,color:C.text,textTransform:'uppercase',letterSpacing:0.5}}>Symptômes décrits</div>
                  <div className="tb-consult-col-user" style={{fontSize:10,fontWeight:700,color:C.text,textTransform:'uppercase',letterSpacing:0.5}}>Utilisateur</div>
                  <div className="tb-consult-col-date" style={{fontSize:10,fontWeight:700,color:C.text,textTransform:'uppercase',letterSpacing:0.5}}>Date</div>
                  <div style={{fontSize:10,fontWeight:700,color:C.text,textTransform:'uppercase',letterSpacing:0.5}}>Statut</div>
                </div>
                <div style={{flex:1,overflowY:'auto'}}>
                  {recentCons.map((c,i)=>(
                    <div key={c.id} className="tb-consult-row" style={{borderBottom:i<recentCons.length-1?`1px solid #F5F7F4`:'none'}}>
                      <p style={{fontSize:12,color:'#111',lineHeight:'17px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const,margin:0}}>{c.symptoms_description}</p>
                      <div className="tb-consult-col-user" style={{fontSize:11,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.profiles?.display_name||'—'}</div>
                      <div className="tb-consult-col-date" style={{fontSize:11,color:C.text,whiteSpace:'nowrap'}}>{new Date(c.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</div>
                      <div style={{display:'flex',flexDirection:'column',gap:3,alignItems:'flex-start'}}>
                        <StatusBadge status={c.status}/>
                        {c.status==='en_attente'&&(
                          <Link href={`/admin/consultations/${c.id}`} style={{fontSize:10,fontWeight:700,color:C.primaryDark,textDecoration:'none'}}>Répondre →</Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Colonne droite : scroll interne */}
          <div style={{display:'flex',flexDirection:'column',gap:10,overflowY:'auto',paddingRight:2}}>

            {/* Actions rapides */}
            <div style={{background:C.white,borderRadius:14,padding:'12px 14px',border:`1px solid ${C.border}`,flexShrink:0}}>
              <div style={{fontSize:12,fontWeight:700,color:'#111',marginBottom:8}}>Actions rapides</div>
              <div style={{display:'flex',flexDirection:'column',gap:5}}>
                {[
                  {href:'/admin/plantes/nouveau', Icon:PlusCircle,   label:'Ajouter une plante',    bg:C.primaryDark,  color:C.white},
                  {href:'/admin/consultations',   Icon:MessageSquare,label:'Voir les consultations', bg:'#EFF6FF',      color:'#1565C0'},
                  {href:'/admin/plantes',         Icon:Edit,         label:'Gérer le catalogue',    bg:C.primaryLight, color:C.primaryDark},
                  {href:'/admin/utilisateurs',    Icon:Users,        label:'Utilisateurs',           bg:'#F3E8FF',      color:'#6B21A8'},
                ].map(({href,Icon,label,bg,color})=>(
                  <Link key={href} href={href} style={{height:32,padding:'0 10px',borderRadius:8,background:bg,color,fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:7,textDecoration:'none'}}>
                    <Icon style={{width:12,height:12,flexShrink:0}}/>{label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Catalogue plantes */}
            <div style={{background:C.white,borderRadius:14,padding:'12px 14px',border:`1px solid ${C.border}`,flexShrink:0}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:700,color:'#111'}}>Catalogue</div>
                <Link href="/admin/plantes" style={{fontSize:11,color:C.primaryDark,fontWeight:600,textDecoration:'none'}}>Gérer</Link>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:5}}>
                {plants.map((p,i)=>(
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:26,height:26,borderRadius:7,background:plantColor(i),display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>{plantEmoji(p.name)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:600,color:'#1A1A1A',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                    </div>
                    <Link href={`/admin/plantes/${p.id}/modifier`} style={{fontSize:10,fontWeight:600,color:C.primaryDark,textDecoration:'none',flexShrink:0}}>Éditer</Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Rappels santé */}
            <div style={{background:C.white,borderRadius:14,padding:'12px 14px',border:`1px solid ${C.border}`,flexShrink:0}}>
              <div style={{fontSize:12,fontWeight:700,color:'#111',marginBottom:7}}>Rappels santé</div>
              <div style={{display:'flex',flexDirection:'column',gap:5}}>
                {SAFETY_ALERTS_ADMIN.map((a,i)=><AlertItem key={i} {...a}/>)}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════ HERBORISTE DASHBOARD ══════════════ */
function HerboristeDashboard({displayName,email,herbStats,recentCons,plants}:{
  displayName:string|null;email:string|null;herbStats:AdminStats;recentCons:ConsultRow[];plants:PlantRow[]
}) {
  const [sidebarOpen,setSidebarOpen] = useState(false)
  const name    = displayName||email?.split('@')[0]||'Herboriste'
  const pathname = typeof window!=='undefined'?window.location.pathname:''
  const router  = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="tb-dashboard" style={{fontFamily:'"Inter",Arial,sans-serif',background:C.bg}}>
      <Sidebar displayName={displayName} email={email} role="herboriste" open={sidebarOpen} onClose={()=>setSidebarOpen(false)} onSignOut={handleSignOut}
        navContent={<>
          <SectionLabel label="Espace herboriste"/>
          {HERBORISTE_NAV.filter(n=>n.section==='admin').map(({Icon,label,href})=>(<NavItem key={label} Icon={Icon} label={label} href={href} active={pathname===href}/>))}
          <SectionLabel label="Application"/>
          {HERBORISTE_NAV.filter(n=>n.section==='app').map(({Icon,label,href})=>(<NavItem key={label} Icon={Icon} label={label} href={href} active={pathname===href}/>))}
          <SectionLabel label="Compte"/>
          {HERBORISTE_NAV.filter(n=>n.section==='profile').map(({Icon,label,href})=>(<NavItem key={label} Icon={Icon} label={label} href={href} active={pathname===href}/>))}
        </>}
      />

      <div className="tb-main-content tb-admin-content">
        <TopBar onMenuClick={()=>setSidebarOpen(true)} name={name}/>

        {/* Ligne 1 : badge + salutation + raccourcis */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexShrink:0,flexWrap:'wrap',gap:8}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:5,background:C.primaryLight,borderRadius:999,padding:'3px 10px',flexShrink:0}}>
              <span style={{fontSize:11}}>🌿</span><span style={{fontSize:10,fontWeight:700,color:C.primaryDark,letterSpacing:0.3}}>HERBORISTE</span>
            </div>
            <h1 style={{fontSize:20,fontWeight:800,color:C.dark,letterSpacing:'-0.3px',fontFamily:"'Poppins',sans-serif",whiteSpace:'nowrap'}}>Bonjour, {name} 👋</h1>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {[{href:'/plantes',label:'Catalogue'},{href:'/symptomes',label:'Symptômes'},{href:'/carte',label:'Carte'},{href:'/conseils',label:'Conseils'}].map(({href,label})=>(
              <Link key={href} href={href} style={{height:30,padding:'0 11px',background:C.white,border:`1px solid ${C.border}`,borderRadius:8,color:'#333',fontSize:12,fontWeight:500,textDecoration:'none',display:'inline-flex',alignItems:'center'}}>{label}</Link>
            ))}
          </div>
        </div>

        {/* Ligne 2 : stats */}
        <div className="tb-grid-4" style={{marginBottom:10,flexShrink:0}}>
          <StatCard value={herbStats.plants}      label="Plantes publiées"      Icon={Leaf}          bg={C.primaryLight} iconColor={C.primaryDark}/>
          <StatCard value={herbStats.pendingCons} label="Consultations en attente" Icon={Clock}      bg="#FFE8B0"         iconColor="#E65100"/>
          <StatCard value={herbStats.totalCons}   label="Mes consultations"     Icon={MessageSquare} bg="#D6E8FF"         iconColor="#1565C0"/>
          <StatCard value={herbStats.glossary}    label="Termes glossaire"      Icon={BookOpen}      bg="#E9D5FF"         iconColor="#6B21A8"/>
        </div>

        {/* Ligne 3 : corps */}
        <div className="tb-admin-main">

          {/* Consultations récentes */}
          <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 18px',borderBottom:`1px solid ${C.border}`,background:'#FAFBF8',flexShrink:0}}>
              <h2 style={{fontSize:13,fontWeight:700,color:'#111',fontFamily:"'Poppins',sans-serif"}}>Mes consultations récentes</h2>
              {herbStats.pendingCons>0&&(
                <span style={{height:22,padding:'0 8px',background:'#FFF8EF',borderRadius:999,fontSize:11,fontWeight:700,color:'#E65100',display:'inline-flex',alignItems:'center',gap:4}}>
                  <Clock style={{width:10,height:10}}/>{herbStats.pendingCons} en attente
                </span>
              )}
            </div>
            {recentCons.length===0?(
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'30px 18px',textAlign:'center',color:C.text}}>
                <MessageSquare style={{width:32,height:32,color:'#E8EDE4',marginBottom:8}}/>
                <p style={{fontSize:13,fontWeight:500,marginBottom:4}}>Aucune consultation reçue.</p>
                <p style={{fontSize:12}}>Les demandes qui vous sont adressées apparaîtront ici.</p>
              </div>
            ):(
              <>
                <div className="tb-consult-header">
                  <div style={{fontSize:10,fontWeight:700,color:C.text,textTransform:'uppercase',letterSpacing:0.5}}>Symptômes décrits</div>
                  <div className="tb-consult-col-user" style={{fontSize:10,fontWeight:700,color:C.text,textTransform:'uppercase',letterSpacing:0.5}}>Patient</div>
                  <div className="tb-consult-col-date" style={{fontSize:10,fontWeight:700,color:C.text,textTransform:'uppercase',letterSpacing:0.5}}>Date</div>
                  <div style={{fontSize:10,fontWeight:700,color:C.text,textTransform:'uppercase',letterSpacing:0.5}}>Statut</div>
                </div>
                <div style={{flex:1,overflowY:'auto'}}>
                  {recentCons.map((c,i)=>(
                    <div key={c.id} className="tb-consult-row" style={{borderBottom:i<recentCons.length-1?`1px solid #F5F7F4`:'none'}}>
                      <p style={{fontSize:12,color:'#111',lineHeight:'17px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const,margin:0}}>{c.symptoms_description}</p>
                      <div className="tb-consult-col-user" style={{fontSize:11,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{(c.profiles as {display_name:string|null}|null)?.display_name||'—'}</div>
                      <div className="tb-consult-col-date" style={{fontSize:11,color:C.text,whiteSpace:'nowrap'}}>{new Date(c.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</div>
                      <div style={{display:'flex',flexDirection:'column',gap:3,alignItems:'flex-start'}}>
                        <StatusBadge status={c.status}/>
                        {c.status==='en_attente'&&(
                          <Link href={`/admin/consultations/${c.id}`} style={{fontSize:10,fontWeight:700,color:C.primaryDark,textDecoration:'none'}}>Répondre →</Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Colonne droite */}
          <div style={{display:'flex',flexDirection:'column',gap:10,overflowY:'auto',paddingRight:2}}>

            {/* Actions rapides */}
            <div style={{background:C.white,borderRadius:14,padding:'12px 14px',border:`1px solid ${C.border}`,flexShrink:0}}>
              <div style={{fontSize:12,fontWeight:700,color:'#111',marginBottom:8}}>Actions rapides</div>
              <div style={{display:'flex',flexDirection:'column',gap:5}}>
                {[
                  {href:'/admin/plantes/nouveau', Icon:PlusCircle,   label:'Ajouter une plante',    bg:C.primaryDark,  color:C.white},
                  {href:'/dashboard',             Icon:MessageSquare,label:'Mes consultations',      bg:'#EFF6FF',      color:'#1565C0'},
                  {href:'/admin/plantes',         Icon:Edit,         label:'Gérer le catalogue',    bg:C.primaryLight, color:C.primaryDark},
                  {href:'/conseils',              Icon:Sun,          label:'Publier un conseil',    bg:'#F3E8FF',      color:'#6B21A8'},
                ].map(({href,Icon,label,bg,color})=>(
                  <Link key={label} href={href} style={{height:32,padding:'0 10px',borderRadius:8,background:bg,color,fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:7,textDecoration:'none'}}>
                    <Icon style={{width:12,height:12,flexShrink:0}}/>{label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Catalogue plantes */}
            <div style={{background:C.white,borderRadius:14,padding:'12px 14px',border:`1px solid ${C.border}`,flexShrink:0}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:700,color:'#111'}}>Catalogue</div>
                <Link href="/admin/plantes" style={{fontSize:11,color:C.primaryDark,fontWeight:600,textDecoration:'none'}}>Gérer</Link>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:5}}>
                {plants.map((p,i)=>(
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:26,height:26,borderRadius:7,background:plantColor(i),display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>{plantEmoji(p.name)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:600,color:'#1A1A1A',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                    </div>
                    <Link href={`/admin/plantes/${p.id}/modifier`} style={{fontSize:10,fontWeight:600,color:C.primaryDark,textDecoration:'none',flexShrink:0}}>Éditer</Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Rappels santé */}
            <div style={{background:C.white,borderRadius:14,padding:'12px 14px',border:`1px solid ${C.border}`,flexShrink:0}}>
              <div style={{fontSize:12,fontWeight:700,color:'#111',marginBottom:7}}>Rappels santé</div>
              <div style={{display:'flex',flexDirection:'column',gap:5}}>
                {SAFETY_ALERTS_ADMIN.map((a,i)=><AlertItem key={i} {...a}/>)}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════ USER DASHBOARD ════════════════════ */
const SAFETY_ALERTS = [
  {type:'red',   title:'Grossesse & plantes',  desc:'Neem, papayer et citronnelle contre-indiqués.'},
  {type:'orange',title:'Dosage — Gingembre',   desc:'Max 4g/jour. Surdosage → irritation gastrique.'},
  {type:'blue',  title:'Paludisme',            desc:'Paludisme avéré = consultation médicale urgente.'},
]

function UserDashboard({displayName,email,favoritePlants,allPlants,consultations,tip,totalPlants}:{
  displayName:string|null;email:string|null;favoritePlants:FavoriteRow[];allPlants:PlantRow[];consultations:ConsultRow[];tip:TipRow|null;totalPlants:number
}) {
  const [sidebarOpen,setSidebarOpen] = useState(false)
  const name      = displayName||email?.split('@')[0]||'utilisateur'
  const favCount  = favoritePlants.length
  const consCount = consultations.length
  const pathname  = typeof window!=='undefined'?window.location.pathname:''
  const plantsToShow = favCount>0 ? favoritePlants.map(f=>f.plants) : allPlants
  const router    = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="tb-dashboard" style={{fontFamily:'"Inter",Arial,sans-serif',background:C.bg,minHeight:'100vh'}}>
      <Sidebar displayName={displayName} email={email} role="user" open={sidebarOpen} onClose={()=>setSidebarOpen(false)} onSignOut={handleSignOut}
        navContent={USER_NAV.map(({Icon,label,href})=>(<NavItem key={href} Icon={Icon} label={label} href={href} active={pathname===href}/>))}
      />

      <div className="tb-main-content">
        <TopBar onMenuClick={()=>setSidebarOpen(true)} name={name}/>

        {/* En-tête */}
        <div style={{marginBottom:20}}>
          <h1 style={{fontSize:26,fontWeight:800,color:C.dark,letterSpacing:'-0.5px',marginBottom:2,fontFamily:"'Poppins',sans-serif"}}>Bonjour, {name} 👋</h1>
          <p style={{fontSize:13,color:C.text}}>Bienvenue sur TerraBio — Santé naturelle du Cameroun</p>
        </div>

        {/* Stats */}
        <div className="tb-grid-4" style={{marginBottom:16}}>
          <StatCard value={totalPlants}         label="Plantes en base"   Icon={Leaf}          bg={C.primaryLight} iconColor={C.primaryDark}/>
          <StatCard value={favCount}            label="Mes favoris"       Icon={Heart}         bg="#FFE8B0"         iconColor="#D4A017"/>
          <StatCard value={consCount}           label="Consultations"     Icon={MessageSquare} bg="#D6E8FF"         iconColor="#1565C0"/>
          <StatCard value={SAFETY_ALERTS.length}label="Alertes santé"    Icon={Bell}          bg="#FFE8E5"         iconColor="#D32F2F"/>
        </div>

        {/* Ligne 2 : plantes + alertes */}
        <div className="tb-grid-main" style={{marginBottom:16}}>
          {/* Plantes */}
          <div style={{background:C.white,borderRadius:16,padding:'16px 18px',border:`1px solid ${C.border}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <h2 style={{fontSize:15,fontWeight:700,color:'#111',fontFamily:"'Poppins',sans-serif"}}>
                {favCount>0?'Mes favoris':'Plantes recommandées'}
              </h2>
              <Link href={favCount>0?'/favoris':'/plantes'} style={{fontSize:12,color:C.primaryDark,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:3}}>
                Voir tout <ChevronRight style={{width:13,height:13}}/>
              </Link>
            </div>
            {plantsToShow.length===0?(
              <div style={{textAlign:'center',padding:'20px 0',color:C.text}}>
                <div style={{fontSize:28,marginBottom:6}}>🌱</div>
                <p style={{fontSize:13}}>Explorez le <Link href="/plantes" style={{color:C.primaryDark,fontWeight:600,textDecoration:'none'}}>catalogue</Link> et ajoutez vos favoris !</p>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:0}}>
                {plantsToShow.map((plant,i)=>(
                  <div key={plant.id} style={{display:'grid',gridTemplateColumns:'40px 1fr auto',gap:10,alignItems:'center',padding:'9px 0',borderBottom:i<plantsToShow.length-1?`1px solid #EEF2EB`:'none'}}>
                    <div style={{width:40,height:40,borderRadius:10,background:plantColor(i),display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{plantEmoji(plant.name)}</div>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{plant.name}</div>
                      {plant.properties?.[0]&&<span style={{fontSize:10,background:C.primaryLight,color:C.primaryDark,padding:'1px 6px',borderRadius:999,fontWeight:600}}>{plant.properties[0]}</span>}
                    </div>
                    <Link href={`/plantes/${plant.id}`} style={{height:30,padding:'0 10px',borderRadius:8,background:C.primaryDark,color:C.white,fontWeight:600,fontSize:11,display:'inline-flex',alignItems:'center',textDecoration:'none',flexShrink:0}}>Voir</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alertes */}
          <div style={{background:C.white,borderRadius:16,padding:'16px 18px',border:`1px solid ${C.border}`}}>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:12,fontFamily:"'Poppins',sans-serif"}}>Alertes santé</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {SAFETY_ALERTS.map((a,i)=><AlertItem key={i} {...a}/>)}
            </div>
          </div>
        </div>

        {/* Ligne 3 : consultations + conseil du jour */}
        <div className="tb-grid-half" style={{marginBottom:16}}>
          {/* Mes consultations */}
          <div style={{background:C.white,borderRadius:16,padding:'16px 18px',border:`1px solid ${C.border}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <h3 style={{fontSize:15,fontWeight:700,color:'#111',fontFamily:"'Poppins',sans-serif"}}>Mes consultations</h3>
              <Link href="/consultation" style={{fontSize:12,color:C.primaryDark,fontWeight:600,textDecoration:'none'}}>+ Nouvelle</Link>
            </div>
            {consultations.length===0?(
              <div style={{textAlign:'center',padding:'16px 0',color:C.text}}>
                <div style={{fontSize:26,marginBottom:6}}>💬</div>
                <p style={{fontSize:12,lineHeight:'18px',marginBottom:12}}>Posez votre première question à notre équipe !</p>
                <Link href="/consultation" style={{height:34,padding:'0 16px',background:C.primaryDark,color:C.white,borderRadius:10,fontSize:12,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center'}}>Demander un conseil</Link>
              </div>
            ):(
              <div>
                {consultations.map((c,i)=>(
                  <div key={c.id} style={{padding:'9px 0',borderBottom:i<consultations.length-1?`1px solid #F0F3EE`:'none'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:3}}>
                      <p style={{fontSize:12,color:'#1A1A1A',lineHeight:'17px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:1,WebkitBoxOrient:'vertical' as const,flex:1}}>{c.symptoms_description}</p>
                      <StatusBadge status={c.status}/>
                    </div>
                    {c.admin_response&&(
                      <div style={{background:C.primaryLight,borderRadius:8,padding:'6px 10px',marginTop:4}}>
                        <div style={{fontSize:10,fontWeight:700,color:C.primaryDark,marginBottom:1}}>Réponse :</div>
                        <div style={{fontSize:11,color:C.text,lineHeight:'16px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:1,WebkitBoxOrient:'vertical' as const}}>{c.admin_response}</div>
                      </div>
                    )}
                    <div style={{fontSize:10,color:'#9AA49A',marginTop:3}}>{new Date(c.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conseil du jour */}
          <div style={{background:C.white,borderRadius:16,padding:'16px 18px',border:`1px solid ${C.border}`,display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <h3 style={{fontSize:15,fontWeight:700,color:'#111',fontFamily:"'Poppins',sans-serif"}}>Conseil du jour</h3>
              <div style={{height:22,padding:'0 8px',background:C.primaryLight,borderRadius:999,fontSize:10,fontWeight:600,color:C.primaryDark,display:'flex',alignItems:'center'}}>TerraBio</div>
            </div>
            <div style={{width:80,height:70,margin:'0 auto 10px',background:C.primaryLight,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:34}}>
              {tip?.plant_name?(()=>{const k=Object.keys(PLANT_EMOJI).find(k=>tip.plant_name!.includes(k));return k?PLANT_EMOJI[k]:'🌿'})():'🌿'}
            </div>
            {tip?(
              <>
                <p style={{fontSize:13,fontWeight:700,color:'#1A1A1A',textAlign:'center',marginBottom:6}}>{tip.title}</p>
                <p style={{fontSize:12,lineHeight:'18px',color:C.text,textAlign:'center',flex:1,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical' as const}}>{tip.content}</p>
              </>
            ):(
              <p style={{fontSize:12,lineHeight:'18px',fontStyle:'italic',color:'#404640',textAlign:'center',flex:1}}>« Une tisane de gingembre avec du citron renforce les défenses immunitaires. »</p>
            )}
            <div style={{marginTop:10,textAlign:'center'}}>
              <Link href="/conseils" style={{fontSize:12,color:C.primaryDark,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>Voir les conseils <ChevronRight style={{width:12,height:12}}/></Link>
            </div>
          </div>
        </div>

        {/* Catalogue scroll horizontal */}
        <div style={{background:C.white,borderRadius:16,padding:'16px 18px',border:`1px solid ${C.border}`,marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div>
              <h2 style={{fontSize:15,fontWeight:700,color:'#111',fontFamily:"'Poppins',sans-serif"}}>Catalogue des plantes</h2>
              <p style={{fontSize:11,color:C.text}}>{totalPlants} plantes médicinales camerounaises</p>
            </div>
            <Link href="/plantes" style={{height:32,padding:'0 12px',background:C.primaryLight,borderRadius:10,color:C.primaryDark,fontWeight:600,fontSize:12,display:'inline-flex',alignItems:'center',gap:4,textDecoration:'none'}}>
              Voir tout <ChevronRight style={{width:12,height:12}}/>
            </Link>
          </div>
          <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:4}}>
            {allPlants.map((plant,i)=>(
              <Link key={plant.id} href={`/plantes/${plant.id}`} style={{width:130,borderRadius:14,overflow:'hidden',background:C.bg,border:`1px solid #EEF2EB`,flexShrink:0,textDecoration:'none',display:'block'}}>
                <div style={{height:90,background:plantColor(i),display:'flex',alignItems:'center',justifyContent:'center',fontSize:36}}>{plantEmoji(plant.name)}</div>
                <div style={{padding:'8px 10px'}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#1A1A1A',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'Poppins',sans-serif"}}>{plant.name}</div>
                  {plant.properties?.[0]&&<div style={{fontSize:10,background:C.primaryLight,color:C.primaryDark,padding:'1px 6px',borderRadius:999,fontWeight:600,marginTop:4,display:'inline-block'}}>{plant.properties[0]}</div>}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA banner */}
        <div style={{background:`linear-gradient(90deg,${C.primaryLight},#bbf7d0)`,borderRadius:16,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',border:`1px solid #86efac`,flexWrap:'wrap',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:38,height:38,background:C.white,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Shield style={{width:18,height:18,color:C.primaryDark}}/>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.primaryDark}}>TerraBio vous accompagne</div>
              <div style={{fontSize:11,color:C.text}}>Informations issues de la pharmacopée camerounaise</div>
            </div>
          </div>
          <Link href="/symptomes" style={{height:36,padding:'0 18px',background:C.primaryDark,borderRadius:10,fontWeight:600,fontSize:13,color:C.white,display:'inline-flex',alignItems:'center',gap:6,textDecoration:'none'}}>
            Rechercher par symptôme <ArrowRight style={{width:14,height:14}}/>
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════ PAGE PRINCIPALE ════════════════════ */
export default function DashboardPage() {
  const router = useRouter()
  const [loading,  setLoading]        = useState(true)
  const [profile,  setProfile]        = useState<Profile|null>(null)
  const [email,    setEmail]          = useState<string|null>(null)
  const [favoritePlants,setFavorites] = useState<FavoriteRow[]>([])
  const [allPlants,    setAllPlants]  = useState<PlantRow[]>([])
  const [consultations,setConsults]   = useState<ConsultRow[]>([])
  const [tip,          setTip]        = useState<TipRow|null>(null)
  const [totalPlants,  setTotal]      = useState(0)
  const [adminStats,   setAdminStats] = useState<AdminStats>({plants:0,pendingCons:0,totalCons:0,glossary:0})
  const [recentCons,   setRecentCons] = useState<ConsultRow[]>([])

  useEffect(()=>{
    const supabase = createClient()
    supabase.auth.getUser().then(async({data})=>{
      if(!data.user){router.push('/auth/login');return}
      const uid = data.user.id
      setEmail(data.user.email??null)
      const {data:prof} = await supabase.from('profiles').select('display_name,role').eq('id',uid).single()
      setProfile(prof??null)

      if(prof?.role==='herboriste'){
        const [{count:pc},{count:tc},{count:gc},{count:plc},{data:lc},{data:pl}] = await Promise.all([
          supabase.from('consultations').select('*',{count:'exact',head:true}).eq('herboriste_id',uid).eq('status','en_attente'),
          supabase.from('consultations').select('*',{count:'exact',head:true}).eq('herboriste_id',uid),
          supabase.from('glossary').select('*',{count:'exact',head:true}),
          supabase.from('plants').select('*',{count:'exact',head:true}).eq('is_published',true),
          supabase.from('consultations').select('id,symptoms_description,status,admin_response,created_at,profiles(display_name)').eq('herboriste_id',uid).order('created_at',{ascending:false}).limit(5),
          supabase.from('plants').select('id,name,latin_name,description,properties').eq('is_published',true).order('created_at',{ascending:false}).limit(5),
        ])
        setAdminStats({plants:plc??0,pendingCons:pc??0,totalCons:tc??0,glossary:gc??0})
        setRecentCons((lc as unknown as ConsultRow[])??[])
        setAllPlants(pl??[])
        setLoading(false)
        return
      }

      if(prof?.role==='admin'){
        const [{count:pc},{count:tc},{count:gc},{count:plc},{data:lc},{data:pl}] = await Promise.all([
          supabase.from('consultations').select('*',{count:'exact',head:true}).eq('status','en_attente'),
          supabase.from('consultations').select('*',{count:'exact',head:true}),
          supabase.from('glossary').select('*',{count:'exact',head:true}),
          supabase.from('plants').select('*',{count:'exact',head:true}).eq('is_published',true),
          supabase.from('consultations').select('id,symptoms_description,status,admin_response,created_at,profiles(display_name)').eq('status','en_attente').order('created_at',{ascending:false}).limit(5),
          supabase.from('plants').select('id,name,latin_name,description,properties').eq('is_published',true).order('created_at',{ascending:false}).limit(5),
        ])
        setAdminStats({plants:plc??0,pendingCons:pc??0,totalCons:tc??0,glossary:gc??0})
        setRecentCons((lc as unknown as ConsultRow[])??[])
        setAllPlants(pl??[])
      } else {
        const [{data:favs},{data:plants},{data:cons},{data:tips},{count:plantCount}] = await Promise.all([
          supabase.from('favorites').select('id,plant_id,plants(id,name,latin_name,description,properties)').eq('user_id',uid).order('created_at',{ascending:false}).limit(5),
          supabase.from('plants').select('id,name,latin_name,description,properties').eq('is_published',true).limit(5),
          supabase.from('consultations').select('id,symptoms_description,status,admin_response,created_at').eq('user_id',uid).order('created_at',{ascending:false}).limit(4),
          supabase.from('tips').select('title,content,plant_name').limit(1),
          supabase.from('plants').select('*',{count:'exact',head:true}).eq('is_published',true),
        ])
        setFavorites((favs as unknown as FavoriteRow[])??[])
        setAllPlants(plants??[])
        setConsults(cons??[])
        setTip(tips?.[0]??null)
        setTotal(plantCount??0)
      }
      setLoading(false)
    })
  },[router])

  if(loading){
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:C.bg}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:56,height:56,background:C.primaryLight,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
            <Leaf style={{width:26,height:26,color:C.primary}}/>
          </div>
          <div style={{fontSize:14,color:C.text}}>Chargement...</div>
        </div>
      </div>
    )
  }

  if(profile?.role==='admin'){
    return <AdminDashboard displayName={profile.display_name} email={email} adminStats={adminStats} recentCons={recentCons} plants={allPlants}/>
  }
  if(profile?.role==='herboriste'){
    return <HerboristeDashboard displayName={profile.display_name} email={email} herbStats={adminStats} recentCons={recentCons} plants={allPlants}/>
  }
  return <UserDashboard displayName={profile?.display_name??null} email={email} favoritePlants={favoritePlants} allPlants={allPlants} consultations={consultations} tip={tip} totalPlants={totalPlants}/>
}
