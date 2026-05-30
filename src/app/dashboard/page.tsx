'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Leaf, Home, Heart, Bell, Sun, BookOpen, Settings, Search,
  ChevronRight, AlertTriangle, Info, ArrowRight, Shield, MapPin,
  Activity, FileText, Clock, CheckCircle, MessageSquare, Menu, X,
  Users, PlusCircle, Edit, LayoutDashboard, TrendingUp
} from 'lucide-react'

const C = {
  primary: '#22c55e', primaryDark: '#166534', primaryLight: '#dcfce7',
  bg: '#F8FAF5', white: '#FFFFFF', text: '#616161', border: '#E8EDE4', dark: '#111111',
}

/* ─── helpers ────────────────────────────────── */
const PLANT_COLORS = [C.primaryLight,'#FFFDE8','#FFF8E8','#FFF0F0','#F0EFF0','#E8F5E8','#EFF6FF','#F3E8FF']
const PLANT_EMOJI: Record<string,string> = { Goyave:'🍃',Citronnelle:'🌿',Gingembre:'🫚',Prunier:'🌲',Moringa:'🌱',Neem:'🍀',Aloe:'🪴',Eucalyptus:'🌿',Papayer:'🍃',Basilic:'🌿' }
const plantEmoji = (n:string) => { const k=Object.keys(PLANT_EMOJI).find(k=>n.includes(k)); return k?PLANT_EMOJI[k]:'🌿' }
const plantColor = (i:number) => PLANT_COLORS[i%PLANT_COLORS.length]
const todayLabel = () => new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).replace(/^\w/,c=>c.toUpperCase())

/* ─── Types ──────────────────────────────────── */
type Profile       = { display_name:string|null; role:string }
type PlantRow      = { id:string; name:string; latin_name:string|null; description:string; properties:string[] }
type FavoriteRow   = { id:string; plant_id:string; plants:PlantRow }
type ConsultRow    = { id:string; symptoms_description:string; status:string; admin_response:string|null; created_at:string; profiles?:{display_name:string|null}|null }
type TipRow        = { title:string; content:string; plant_name:string|null }
type AdminStats    = { plants:number; pendingCons:number; totalCons:number; glossary:number }

/* ─── Composants partagés ────────────────────── */
function StatCard({ value,label,Icon,bg,iconBg,iconColor }:{value:number|string;label:string;Icon:React.ElementType;bg:string;iconBg:string;iconColor:string}) {
  return (
    <div style={{background:bg,borderRadius:24,padding:'22px 20px',border:`1px solid ${C.border}`,boxShadow:'0 8px 24px rgba(20,40,18,0.04)'}}>
      <div style={{width:50,height:50,background:iconBg,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
        <Icon style={{width:22,height:22,color:iconColor}} />
      </div>
      <div style={{fontSize:40,fontWeight:800,color:'#171717',lineHeight:'44px',fontFamily:"'Poppins',sans-serif"}}>{value}</div>
      <div style={{fontSize:14,fontWeight:600,color:'#3D3D3D',marginTop:6}}>{label}</div>
    </div>
  )
}

function StatusBadge({status}:{status:string}) {
  const map:Record<string,{label:string;bg:string;color:string;Icon:React.ElementType}> = {
    en_attente:{label:'En attente',bg:'#FFF8EF',color:'#E65100',Icon:Clock},
    en_cours:  {label:'En cours',  bg:'#EFF6FF',color:'#1565C0',Icon:Activity},
    traitee:   {label:'Répondu',   bg:C.primaryLight,color:C.primaryDark,Icon:CheckCircle},
    fermee:    {label:'Fermée',    bg:'#F4F4F4',color:'#616161',Icon:CheckCircle},
  }
  const s=map[status]??map['en_attente']; const {Icon}=s
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,height:24,padding:'0 8px',background:s.bg,borderRadius:6,fontSize:11,fontWeight:700,color:s.color,flexShrink:0}}>
      <Icon style={{width:11,height:11}}/>{s.label}
    </span>
  )
}

/* ─── SIDEBAR USER ───────────────────────────── */
const USER_NAV = [
  {Icon:Home,       label:'Tableau de bord',       href:'/dashboard'},
  {Icon:Activity,   label:'Recherche symptôme',     href:'/symptomes'},
  {Icon:Heart,      label:'Mes favoris',            href:'/favoris'},
  {Icon:BookOpen,   label:'Glossaire',              href:'/glossaire'},
  {Icon:Sun,        label:'Conseils',               href:'/conseils'},
  {Icon:MapPin,     label:'Géolocalisation',        href:'/carte'},
  {Icon:FileText,   label:'Mes consultations',      href:'/consultation'},
  {Icon:Settings,   label:'Mon profil',             href:'/profil'},
]

/* ─── SIDEBAR ADMIN ──────────────────────────── */
const ADMIN_NAV = [
  {Icon:LayoutDashboard,label:'Tableau de bord', href:'/dashboard',  section:'admin'},
  {Icon:Leaf,           label:'Gérer les plantes',href:'/admin/plantes',section:'admin'},
  {Icon:MessageSquare,  label:'Consultations',    href:'/admin/consultations',section:'admin'},
  {Icon:Users,          label:'Utilisateurs',     href:'/admin/utilisateurs',section:'admin'},
  {Icon:Search,         label:'Catalogue plantes',href:'/plantes',    section:'app'},
  {Icon:Activity,       label:'Symptômes',        href:'/symptomes',  section:'app'},
  {Icon:MapPin,         label:'Carte',            href:'/carte',      section:'app'},
  {Icon:BookOpen,       label:'Glossaire',        href:'/glossaire',  section:'app'},
  {Icon:Sun,            label:'Conseils',         href:'/conseils',   section:'app'},
  {Icon:Settings,       label:'Mon profil',       href:'/profil',     section:'profile'},
]

function SidebarShell({displayName,email,children,isAdmin,open,onClose}:{
  displayName:string|null;email:string|null;children:React.ReactNode;isAdmin:boolean;open:boolean;onClose:()=>void
}) {
  const name    = displayName||email?.split('@')[0]||'Utilisateur'
  const initial = name.charAt(0).toUpperCase()
  const pathname = typeof window!=='undefined'?window.location.pathname:''

  return (
    <>
      <div className={`tb-sidebar-overlay${open?' open':''}`} onClick={onClose} />
      <aside className={`tb-sidebar${open?' open':''}`}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:24}}>
          <div style={{width:44,height:44,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Leaf style={{width:24,height:24,color:C.white}}/>
          </div>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:C.primaryDark,fontFamily:"'Poppins',sans-serif"}}>TerraBio</div>
            <div style={{fontSize:11,color:C.text}}>Santé naturelle · Cameroun</div>
          </div>
          <button onClick={onClose} className="md:hidden" style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',padding:4}}>
            <X style={{width:20,height:20,color:C.text}}/>
          </button>
        </div>

        {/* User card */}
        <div style={{background:'#FAFBF8',border:`1px solid #E7ECE3`,borderRadius:20,padding:16,marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:44,height:44,borderRadius:'50%',background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span style={{fontSize:20,fontWeight:700,color:C.white}}>{initial}</span>
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:15,fontWeight:600,color:'#1B1B1B',fontFamily:"'Poppins',sans-serif",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</div>
              <div style={{fontSize:11,color:C.text}}>
                <span style={{background:isAdmin?'#F3E8FF':C.primaryLight,color:isAdmin?'#6B21A8':C.primaryDark,padding:'2px 8px',borderRadius:999,fontWeight:700}}>{isAdmin?'Admin':'Utilisateur'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{display:'flex',flexDirection:'column',gap:2,flex:1,overflowY:'auto'}}>
          {children}
        </nav>

        {/* Footer tip */}
        <div style={{marginTop:16,padding:14,background:C.primaryLight,borderRadius:16,border:`1px solid #bbf7d0`}}>
          <div style={{fontSize:13,fontWeight:700,color:C.primaryDark,marginBottom:6,fontFamily:"'Poppins',sans-serif"}}>Conseil du jour</div>
          <p style={{fontSize:11,color:C.text,lineHeight:'16px'}}>Une tisane de citronnelle le soir favorise un sommeil réparateur.</p>
        </div>
      </aside>
    </>
  )
}

function NavItem({Icon,label,href,active}:{Icon:React.ElementType;label:string;href:string;active?:boolean}) {
  return (
    <a href={href} style={{height:46,padding:'0 14px',borderRadius:12,display:'flex',alignItems:'center',gap:12,background:active?C.primaryLight:'transparent',color:active?C.primaryDark:'#3D3D3D',fontWeight:active?600:500,fontSize:13,textDecoration:'none'}}>
      <Icon style={{width:18,height:18,strokeWidth:2,flexShrink:0,color:active?C.primaryDark:'#6B7B69'}}/>
      {label}
    </a>
  )
}

function SectionLabel({label}:{label:string}) {
  return <div style={{fontSize:10,fontWeight:700,color:'#9AA49A',letterSpacing:1.5,padding:'10px 14px 4px',textTransform:'uppercase'}}>{label}</div>
}

/* ── Top bar commun ──────────────────────────── */
function TopBar({onMenuClick,name}:{onMenuClick:()=>void;name:string}) {
  const router = useRouter()
  return (
    <>
      {/* Mobile topbar */}
      <div className="tb-mobile-topbar">
        <button onClick={onMenuClick} style={{background:'none',border:'none',cursor:'pointer',padding:4}}>
          <Menu style={{width:22,height:22,color:C.text}}/>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:32,height:32,background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Leaf style={{width:16,height:16,color:C.white}}/>
          </div>
          <span style={{fontSize:16,fontWeight:700,color:C.primaryDark,fontFamily:"'Poppins',sans-serif"}}>TerraBio</span>
        </div>
        <div style={{marginLeft:'auto',width:36,height:36,borderRadius:'50%',background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:15,fontWeight:700,color:C.white}}>{name.charAt(0).toUpperCase()}</span>
        </div>
      </div>

      {/* Desktop topbar */}
      <div className="hidden md:flex" style={{justifyContent:'space-between',alignItems:'center',marginBottom:32}}>
        <div style={{width:500,height:56,background:C.white,border:`1px solid #E7ECE3`,borderRadius:999,display:'flex',alignItems:'center',padding:'0 20px',gap:10}}>
          <Search style={{width:18,height:18,color:'#9AA49A',flexShrink:0}}/>
          <input type="text" placeholder="Rechercher une plante ou un symptôme..."
            onKeyDown={e=>{if(e.key==='Enter')router.push(`/plantes?q=${(e.target as HTMLInputElement).value}`)}}
            style={{border:'none',outline:'none',fontSize:14,color:'#1A1A1A',background:'transparent',flex:1}}/>
        </div>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:'10px 16px',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,background:C.primaryLight,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:16}}>📅</span>
          </div>
          <div>
            <div style={{fontSize:11,color:C.text}}>Aujourd&apos;hui</div>
            <div style={{fontSize:13,fontWeight:700,color:'#1A1A1A'}}>{todayLabel()}</div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════ */
function AdminDashboard({displayName,email,adminStats,recentCons,plants}:{
  displayName:string|null; email:string|null
  adminStats:AdminStats; recentCons:ConsultRow[]; plants:PlantRow[]
}) {
  const [sidebarOpen,setSidebarOpen] = useState(false)
  const name = displayName||email?.split('@')[0]||'Admin'
  const pathname = typeof window!=='undefined'?window.location.pathname:''

  return (
    <div className="tb-dashboard" style={{fontFamily:'"Inter",Arial,sans-serif',background:C.bg}}>
      <SidebarShell displayName={displayName} email={email} isAdmin open={sidebarOpen} onClose={()=>setSidebarOpen(false)}>
        <SectionLabel label="Administration"/>
        {ADMIN_NAV.filter(n=>n.section==='admin').map(({Icon,label,href})=>(
          <NavItem key={href} Icon={Icon} label={label} href={href} active={pathname===href}/>
        ))}
        <SectionLabel label="Application"/>
        {ADMIN_NAV.filter(n=>n.section==='app').map(({Icon,label,href})=>(
          <NavItem key={href} Icon={Icon} label={label} href={href}/>
        ))}
        <SectionLabel label="Compte"/>
        {ADMIN_NAV.filter(n=>n.section==='profile').map(({Icon,label,href})=>(
          <NavItem key={href} Icon={Icon} label={label} href={href}/>
        ))}
      </SidebarShell>

      <div className="tb-main-content">
        <TopBar onMenuClick={()=>setSidebarOpen(true)} name={name}/>

        {/* Titre */}
        <div style={{marginBottom:28}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'#F3E8FF',borderRadius:999,padding:'4px 14px',marginBottom:12}}>
            <Shield style={{width:14,height:14,color:'#6B21A8'}}/>
            <span style={{fontSize:12,fontWeight:700,color:'#6B21A8',letterSpacing:0.5}}>ESPACE ADMINISTRATEUR</span>
          </div>
          <h1 style={{fontSize:36,fontWeight:800,color:C.dark,lineHeight:'42px',letterSpacing:'-1px',marginBottom:6,fontFamily:"'Poppins',sans-serif"}}>
            Bonjour, {name} 👋
          </h1>
          <p style={{fontSize:16,color:C.text}}>Tableau de bord d&apos;administration TerraBio</p>
        </div>

        {/* Stats admin */}
        <div className="tb-grid-4" style={{marginBottom:24}}>
          <StatCard value={adminStats.plants}     label="Plantes publiées"  Icon={Leaf}          bg="#F5F9EF" iconBg={C.primaryLight} iconColor={C.primaryDark}/>
          <StatCard value={adminStats.pendingCons} label="Consultations en attente" Icon={Clock} bg="#FFF8EF" iconBg="#FFE8B0"        iconColor="#E65100"/>
          <StatCard value={adminStats.totalCons}  label="Consultations total" Icon={MessageSquare} bg="#EEF6FF" iconBg="#D6E8FF" iconColor="#1565C0"/>
          <StatCard value={adminStats.glossary}   label="Termes glossaire"  Icon={BookOpen}      bg="#F3E8FF" iconBg="#E9D5FF"        iconColor="#6B21A8"/>
        </div>

        {/* Actions rapides */}
        <div style={{background:C.white,borderRadius:24,padding:'20px 24px',border:`1px solid ${C.border}`,marginBottom:24,display:'flex',gap:12,flexWrap:'wrap'}}>
          <div style={{fontSize:15,fontWeight:700,color:'#111',fontFamily:"'Poppins',sans-serif",width:'100%',marginBottom:4}}>Actions rapides</div>
          {[
            {href:'/admin/plantes/nouveau',Icon:PlusCircle,label:'Ajouter une plante',    bg:C.primaryDark,color:C.white},
            {href:'/admin/consultations',  Icon:MessageSquare,label:'Voir consultations',  bg:'#EFF6FF',   color:'#1565C0'},
            {href:'/admin/plantes',        Icon:Edit,      label:'Gérer le catalogue',     bg:C.primaryLight,color:C.primaryDark},
            {href:'/admin/utilisateurs',   Icon:Users,     label:'Utilisateurs',           bg:'#F3E8FF',   color:'#6B21A8'},
          ].map(({href,Icon,label,bg,color})=>(
            <a key={href} href={href} style={{height:44,padding:'0 18px',borderRadius:12,background:bg,color,fontSize:13,fontWeight:700,display:'inline-flex',alignItems:'center',gap:8,textDecoration:'none',border:`1px solid transparent`}}>
              <Icon style={{width:15,height:15}}/>{label}
            </a>
          ))}
        </div>

        {/* Grille principale */}
        <div className="tb-grid-main" style={{marginBottom:24}}>

          {/* Consultations récentes */}
          <div style={{background:C.white,borderRadius:28,padding:24,border:`1px solid #E9EEE5`,boxShadow:'0 8px 24px rgba(20,40,18,0.04)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{fontSize:18,fontWeight:700,color:'#171717',fontFamily:"'Poppins',sans-serif"}}>Consultations en attente</h2>
              <a href="/admin/consultations" style={{fontSize:13,color:C.primaryDark,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>
                Voir tout <ChevronRight style={{width:14,height:14}}/>
              </a>
            </div>

            {recentCons.length===0?(
              <div style={{textAlign:'center',padding:'32px 16px',color:C.text}}>
                <div style={{fontSize:32,marginBottom:10}}>✅</div>
                <p style={{fontSize:14}}>Aucune consultation en attente.</p>
              </div>
            ):(
              <div>
                {recentCons.map((c,i)=>(
                  <div key={c.id} style={{padding:'14px 0',borderBottom:i<recentCons.length-1?`1px solid #EEF2EB`:'none'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10,marginBottom:6}}>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:600,color:C.primaryDark,marginBottom:2}}>
                          {c.profiles?.display_name||'Utilisateur'}
                        </div>
                        <p style={{fontSize:13,color:'#333',lineHeight:'18px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const}}>
                          {c.symptoms_description}
                        </p>
                      </div>
                      <StatusBadge status={c.status}/>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:11,color:'#9AA49A'}}>
                        {new Date(c.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}
                      </span>
                      <a href={`/admin/consultations/${c.id}`} style={{fontSize:12,fontWeight:700,color:C.primaryDark,textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>
                        Répondre <ChevronRight style={{width:13,height:13}}/>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plantes récentes */}
          <div style={{background:C.white,borderRadius:28,padding:24,border:`1px solid #E9EEE5`,boxShadow:'0 8px 24px rgba(20,40,18,0.04)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{fontSize:18,fontWeight:700,color:'#171717',fontFamily:"'Poppins',sans-serif"}}>Catalogue</h2>
              <a href="/admin/plantes" style={{fontSize:13,color:C.primaryDark,fontWeight:600,textDecoration:'none'}}>Gérer</a>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {plants.map((p,i)=>(
                <div key={p.id} style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:44,height:44,borderRadius:12,background:plantColor(i),display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                    {plantEmoji(p.name)}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,color:'#1A1A1A',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                    <div style={{fontSize:12,color:C.text,fontStyle:'italic'}}>{p.latin_name}</div>
                  </div>
                  <a href={`/admin/plantes/${p.id}/modifier`} style={{padding:'4px 10px',background:C.primaryLight,borderRadius:8,fontSize:12,fontWeight:600,color:C.primaryDark,textDecoration:'none',flexShrink:0}}>Éditer</a>
                </div>
              ))}
            </div>
            <div style={{marginTop:16,textAlign:'center'}}>
              <a href="/admin/plantes/nouveau" style={{fontSize:13,color:C.primaryDark,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:5}}>
                <PlusCircle style={{width:14,height:14}}/> Ajouter une plante
              </a>
            </div>
          </div>
        </div>

        {/* Accès rapide app */}
        <div style={{background:`linear-gradient(90deg,${C.primaryLight},#bbf7d0)`,borderRadius:24,padding:'24px 32px',display:'flex',justifyContent:'space-between',alignItems:'center',border:`1px solid #86efac`,flexWrap:'wrap',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:48,height:48,background:C.white,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <TrendingUp style={{width:22,height:22,color:C.primaryDark}}/>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:C.primaryDark,fontFamily:"'Poppins',sans-serif"}}>Accédez à toutes les fonctionnalités</div>
              <div style={{fontSize:13,color:C.text}}>Naviguez dans l&apos;application comme un utilisateur</div>
            </div>
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {[{href:'/plantes',label:'Catalogue'},{href:'/symptomes',label:'Symptômes'},{href:'/carte',label:'Carte'},{href:'/conseils',label:'Conseils'}].map(({href,label})=>(
              <a key={href} href={href} style={{height:40,padding:'0 16px',background:C.primaryDark,borderRadius:12,color:C.white,fontSize:13,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center'}}>{label}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   USER DASHBOARD
═══════════════════════════════════════════════ */
const SAFETY_ALERTS = [
  {type:'red',   title:'Grossesse & plantes',  desc:'Neem, papayer et citronnelle sont contre-indiqués pendant la grossesse.'},
  {type:'orange',title:'Dosage — Gingembre',   desc:'La dose quotidienne maximale de gingembre frais est de 4g.'},
  {type:'blue',  title:'Paludisme : vigilance',desc:'En cas de paludisme avéré, consultation médicale immédiate requise.'},
]

function AlertCard({type,title,desc}:{type:string;title:string;desc:string}) {
  const s:{[k:string]:{bg:string;border:string;iconBg:string;iconColor:string;Icon:React.ElementType}}={
    red:   {bg:'#FFF5F4',border:'#FFD8D5',iconBg:'#FFE8E5',iconColor:'#D32F2F',Icon:AlertTriangle},
    orange:{bg:'#FFF8EF',border:'#FFE0B2',iconBg:'#FFF3E0',iconColor:'#E65100',Icon:Bell},
    blue:  {bg:'#F1F7FF',border:'#D6E8FF',iconBg:'#E3F2FD',iconColor:'#1565C0',Icon:Info},
  }
  const st=s[type]; const {Icon}=st
  return (
    <div style={{padding:16,borderRadius:16,background:st.bg,border:`1px solid ${st.border}`}}>
      <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
        <div style={{width:34,height:34,borderRadius:'50%',background:st.iconBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <Icon style={{width:16,height:16,color:st.iconColor}}/>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:'#1A1A1A',marginBottom:3}}>{title}</div>
          <div style={{fontSize:12,color:C.text,lineHeight:'18px'}}>{desc}</div>
        </div>
      </div>
    </div>
  )
}

function UserDashboard({displayName,email,favoritePlants,allPlants,consultations,tip,totalPlants}:{
  displayName:string|null; email:string|null
  favoritePlants:FavoriteRow[]; allPlants:PlantRow[]; consultations:ConsultRow[]
  tip:TipRow|null; totalPlants:number
}) {
  const [sidebarOpen,setSidebarOpen] = useState(false)
  const name     = displayName||email?.split('@')[0]||'utilisateur'
  const favCount = favoritePlants.length
  const consCount= consultations.length
  const pathname = typeof window!=='undefined'?window.location.pathname:''
  const plantsToShow = favCount>0 ? favoritePlants.map(f=>f.plants) : allPlants

  return (
    <div className="tb-dashboard" style={{fontFamily:'"Inter",Arial,sans-serif',background:C.bg}}>
      <SidebarShell displayName={displayName} email={email} isAdmin={false} open={sidebarOpen} onClose={()=>setSidebarOpen(false)}>
        {USER_NAV.map(({Icon,label,href})=>(
          <NavItem key={href} Icon={Icon} label={label} href={href} active={pathname===href}/>
        ))}
      </SidebarShell>

      <div className="tb-main-content">
        <TopBar onMenuClick={()=>setSidebarOpen(true)} name={name}/>

        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:34,fontWeight:800,color:C.dark,lineHeight:'40px',letterSpacing:'-1px',marginBottom:6,fontFamily:"'Poppins',sans-serif"}}>
            Bonjour, {name} 👋
          </h1>
          <p style={{fontSize:16,color:C.text}}>Bienvenue sur TerraBio — Santé naturelle du Cameroun</p>
        </div>

        {/* Stats */}
        <div className="tb-grid-4" style={{marginBottom:24}}>
          <StatCard value={totalPlants}         label="Plantes en base"    Icon={Leaf}          bg="#F5F9EF" iconBg={C.primaryLight} iconColor={C.primaryDark}/>
          <StatCard value={favCount}            label="Mes favoris"        Icon={Heart}         bg="#FFF8E8" iconBg="#FFE8B0"        iconColor="#D4A017"/>
          <StatCard value={consCount}           label="Mes consultations"  Icon={MessageSquare} bg="#EEF6FF" iconBg="#D6E8FF"        iconColor="#1565C0"/>
          <StatCard value={SAFETY_ALERTS.length}label="Alertes santé"     Icon={Bell}          bg="#FFF5F4" iconBg="#FFE8E5"        iconColor="#D32F2F"/>
        </div>

        {/* Plantes + alertes */}
        <div className="tb-grid-main" style={{marginBottom:24}}>
          <div style={{background:C.white,borderRadius:28,padding:24,border:`1px solid #E9EEE5`,boxShadow:'0 8px 24px rgba(20,40,18,0.04)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{fontSize:18,fontWeight:700,color:'#171717',fontFamily:"'Poppins',sans-serif"}}>
                {favCount>0?'Mes plantes favorites':'Plantes recommandées'}
              </h2>
              <span style={{height:28,padding:'0 12px',background:C.primaryLight,borderRadius:999,fontSize:12,fontWeight:600,color:C.primaryDark,display:'inline-flex',alignItems:'center'}}>
                {favCount>0?`${favCount} favori${favCount>1?'s':''}`:'Cameroun'}
              </span>
            </div>
            {plantsToShow.length===0?(
              <div style={{textAlign:'center',padding:'32px 16px',color:C.text}}>
                <div style={{fontSize:36,marginBottom:10}}>🌱</div>
                <p style={{fontSize:14}}>Explorez le catalogue et ajoutez vos plantes préférées !</p>
                <a href="/plantes" style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:12,color:C.primaryDark,fontWeight:600,fontSize:14,textDecoration:'none'}}>
                  Voir le catalogue <ChevronRight style={{width:14,height:14}}/>
                </a>
              </div>
            ):(
              <div>
                {plantsToShow.map((plant,i)=>(
                  <div key={plant.id} style={{display:'grid',gridTemplateColumns:'60px 1fr auto',gap:12,alignItems:'center',padding:'12px 0',borderBottom:i<plantsToShow.length-1?`1px solid #EEF2EB`:'none'}}>
                    <div style={{width:60,height:60,borderRadius:14,background:plantColor(i),display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>
                      {plantEmoji(plant.name)}
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2,flexWrap:'wrap'}}>
                        <span style={{fontSize:14,fontWeight:700,color:'#171717',fontFamily:"'Poppins',sans-serif"}}>{plant.name}</span>
                        {plant.properties?.[0]&&<span style={{height:20,padding:'0 7px',background:C.primaryLight,borderRadius:999,fontSize:10,fontWeight:600,color:C.primaryDark,display:'inline-flex',alignItems:'center',flexShrink:0}}>{plant.properties[0]}</span>}
                      </div>
                      <div style={{fontSize:12,color:C.text,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:1,WebkitBoxOrient:'vertical' as const}}>{plant.description}</div>
                    </div>
                    <a href={`/plantes/${plant.id}`} style={{height:36,padding:'0 12px',borderRadius:10,background:C.primaryDark,color:C.white,fontWeight:600,fontSize:12,border:'none',cursor:'pointer',whiteSpace:'nowrap',display:'inline-flex',alignItems:'center',textDecoration:'none',flexShrink:0}}>Voir</a>
                  </div>
                ))}
              </div>
            )}
            <div style={{marginTop:16,textAlign:'center'}}>
              <a href="/plantes" style={{fontSize:13,color:C.primaryDark,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:5}}>
                Voir toutes les plantes <ChevronRight style={{width:14,height:14}}/>
              </a>
            </div>
          </div>

          <div style={{background:C.white,borderRadius:28,padding:24,border:`1px solid #E9EEE5`,boxShadow:'0 8px 24px rgba(20,40,18,0.04)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
              <h2 style={{fontSize:18,fontWeight:700,color:'#171717',fontFamily:"'Poppins',sans-serif"}}>Alertes santé</h2>
              <span style={{height:24,padding:'0 8px',background:'#FFF5F4',borderRadius:6,fontSize:11,fontWeight:700,color:'#D32F2F',display:'inline-flex',alignItems:'center'}}>{SAFETY_ALERTS.length} alertes</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {SAFETY_ALERTS.map((a,i)=><AlertCard key={i} {...a}/>)}
            </div>
          </div>
        </div>

        {/* Consultations + conseil */}
        <div className="tb-grid-half" style={{marginBottom:24}}>
          <div style={{background:C.white,borderRadius:24,padding:22,border:`1px solid ${C.border}`,boxShadow:'0 8px 24px rgba(20,40,18,0.04)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'#171717',fontFamily:"'Poppins',sans-serif"}}>Mes consultations</h3>
              <a href="/consultation" style={{fontSize:12,color:C.primaryDark,fontWeight:600,textDecoration:'none'}}>+ Nouvelle</a>
            </div>
            {consultations.length===0?(
              <div style={{textAlign:'center',padding:'24px 12px',color:C.text}}>
                <div style={{fontSize:32,marginBottom:8}}>💬</div>
                <p style={{fontSize:13,lineHeight:'19px'}}>Posez votre première question à notre équipe !</p>
                <a href="/consultation" style={{display:'inline-flex',alignItems:'center',gap:5,marginTop:12,height:36,padding:'0 16px',background:C.primaryDark,color:C.white,borderRadius:10,fontSize:12,fontWeight:600,textDecoration:'none'}}>
                  Demander un conseil
                </a>
              </div>
            ):(
              <div>
                {consultations.map((c,i)=>(
                  <div key={c.id} style={{padding:'12px 0',borderBottom:i<consultations.length-1?`1px solid #F0F3EE`:'none'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4,gap:8}}>
                      <p style={{fontSize:12,color:'#1A1A1A',fontWeight:500,lineHeight:'17px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const,flex:1}}>{c.symptoms_description}</p>
                      <StatusBadge status={c.status}/>
                    </div>
                    {c.admin_response&&(
                      <div style={{background:C.primaryLight,borderRadius:8,padding:'7px 10px',marginTop:5}}>
                        <div style={{fontSize:10,fontWeight:700,color:C.primaryDark,marginBottom:2}}>Réponse :</div>
                        <div style={{fontSize:11,color:C.text,lineHeight:'16px',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const}}>{c.admin_response}</div>
                      </div>
                    )}
                    <div style={{fontSize:10,color:'#9AA49A',marginTop:4}}>{new Date(c.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{background:C.white,borderRadius:24,padding:22,border:`1px solid ${C.border}`,boxShadow:'0 8px 24px rgba(20,40,18,0.04)',display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'#171717',fontFamily:"'Poppins',sans-serif"}}>Conseil du jour</h3>
              <div style={{height:24,padding:'0 10px',background:C.primaryLight,borderRadius:999,fontSize:11,fontWeight:600,color:C.primaryDark,display:'flex',alignItems:'center'}}>TerraBio</div>
            </div>
            <div style={{width:120,height:100,margin:'0 auto 14px',background:C.primaryLight,borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:44}}>
              {tip?.plant_name?plantEmoji(tip.plant_name):'🌿'}
            </div>
            {tip?(
              <>
                <p style={{fontSize:14,fontWeight:700,color:'#1A1A1A',textAlign:'center',marginBottom:6,fontFamily:"'Poppins',sans-serif"}}>{tip.title}</p>
                <p style={{fontSize:12,lineHeight:'19px',color:C.text,textAlign:'center',flex:1,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical' as const}}>{tip.content}</p>
              </>
            ):(
              <p style={{fontSize:13,lineHeight:'20px',fontStyle:'italic',color:'#404640',textAlign:'center',flex:1}}>« Une tisane de gingembre avec du citron renforce les défenses immunitaires. »</p>
            )}
            <div style={{marginTop:14,textAlign:'center'}}>
              <a href="/conseils" style={{fontSize:12,color:C.primaryDark,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>Voir tous les conseils <ChevronRight style={{width:13,height:13}}/></a>
            </div>
          </div>
        </div>

        {/* Catalogue horizontal */}
        <div style={{background:C.white,borderRadius:24,padding:'22px 22px',border:`1px solid ${C.border}`,boxShadow:'0 8px 24px rgba(20,40,18,0.04)',marginBottom:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
            <div>
              <h2 style={{fontSize:18,fontWeight:700,color:'#171717',marginBottom:2,fontFamily:"'Poppins',sans-serif"}}>Catalogue des plantes</h2>
              <p style={{fontSize:13,color:C.text}}>{totalPlants} plantes médicinales camerounaises</p>
            </div>
            <a href="/plantes" style={{height:38,padding:'0 16px',background:C.primaryLight,borderRadius:12,color:C.primaryDark,fontWeight:600,fontSize:13,display:'inline-flex',alignItems:'center',gap:5,textDecoration:'none'}}>
              Voir tout <ChevronRight style={{width:14,height:14}}/>
            </a>
          </div>
          <div style={{display:'flex',gap:14,overflowX:'auto',paddingBottom:6}}>
            {allPlants.map((plant,i)=>(
              <a key={plant.id} href={`/plantes/${plant.id}`} style={{width:160,borderRadius:18,overflow:'hidden',background:C.white,border:`1px solid #EEF2EB`,flexShrink:0,textDecoration:'none',display:'block'}}>
                <div style={{height:110,background:plantColor(i),display:'flex',alignItems:'center',justifyContent:'center',fontSize:42}}>{plantEmoji(plant.name)}</div>
                <div style={{padding:'10px 12px'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#1A1A1A',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'Poppins',sans-serif"}}>{plant.name}</div>
                  {plant.properties?.[0]&&<div style={{height:20,padding:'0 8px',background:C.primaryLight,borderRadius:999,fontSize:10,fontWeight:600,color:C.primaryDark,display:'inline-flex',alignItems:'center'}}>{plant.properties[0]}</div>}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* CTA banner */}
        <div style={{background:`linear-gradient(90deg,${C.primaryLight},#bbf7d0)`,borderRadius:22,padding:'22px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',border:`1px solid #86efac`,flexWrap:'wrap',gap:14}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:44,height:44,background:C.white,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Shield style={{width:22,height:22,color:C.primaryDark}}/>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:C.primaryDark,fontFamily:"'Poppins',sans-serif"}}>TerraBio vous accompagne</div>
              <div style={{fontSize:13,color:C.text}}>Informations issues de la pharmacopée camerounaise</div>
            </div>
          </div>
          <a href="/symptomes" style={{height:44,padding:'0 22px',background:C.primaryDark,borderRadius:14,fontWeight:600,fontSize:14,color:C.white,display:'inline-flex',alignItems:'center',gap:7,textDecoration:'none'}}>
            Rechercher par symptôme <ArrowRight style={{width:15,height:15}}/>
          </a>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   PAGE PRINCIPALE — détection du rôle
═══════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter()
  const [loading,  setLoading]       = useState(true)
  const [profile,  setProfile]       = useState<Profile|null>(null)
  const [email,    setEmail]         = useState<string|null>(null)

  /* user data */
  const [favoritePlants, setFavorites]    = useState<FavoriteRow[]>([])
  const [allPlants,      setAllPlants]    = useState<PlantRow[]>([])
  const [consultations,  setConsultations]= useState<ConsultRow[]>([])
  const [tip,            setTip]          = useState<TipRow|null>(null)
  const [totalPlants,    setTotalPlants]  = useState(0)

  /* admin data */
  const [adminStats,  setAdminStats]  = useState<AdminStats>({plants:0,pendingCons:0,totalCons:0,glossary:0})
  const [recentCons,  setRecentCons]  = useState<ConsultRow[]>([])

  useEffect(()=>{
    const supabase = createClient()
    supabase.auth.getUser().then(async({data})=>{
      if(!data.user){router.push('/auth/login');return}
      const uid = data.user.id
      setEmail(data.user.email??null)

      const {data:prof} = await supabase.from('profiles').select('display_name,role').eq('id',uid).single()
      setProfile(prof??null)

      if(prof?.role==='admin'){
        const [
          {count:plantsCount},
          {count:totalCons},
          {count:pendingCount},
          {count:glossaryCount},
          {data:lastCons},
          {data:plants},
        ] = await Promise.all([
          supabase.from('plants').select('*',{count:'exact',head:true}).eq('is_published',true),
          supabase.from('consultations').select('*',{count:'exact',head:true}),
          supabase.from('consultations').select('*',{count:'exact',head:true}).eq('status','en_attente'),
          supabase.from('glossary').select('*',{count:'exact',head:true}),
          supabase.from('consultations').select('id,symptoms_description,status,admin_response,created_at,profiles(display_name)').eq('status','en_attente').order('created_at',{ascending:false}).limit(5),
          supabase.from('plants').select('id,name,latin_name,description,properties').eq('is_published',true).order('created_at',{ascending:false}).limit(5),
        ])
        setAdminStats({plants:plantsCount??0,pendingCons:pendingCount??0,totalCons:totalCons??0,glossary:glossaryCount??0})
        setRecentCons((lastCons as unknown as ConsultRow[])??[])
        setAllPlants(plants??[])
      } else {
        const [
          {data:favs},
          {data:plants},
          {data:cons},
          {data:tips},
          {count:plantCount},
        ] = await Promise.all([
          supabase.from('favorites').select('id,plant_id,plants(id,name,latin_name,description,properties)').eq('user_id',uid).order('created_at',{ascending:false}).limit(5),
          supabase.from('plants').select('id,name,latin_name,description,properties').eq('is_published',true).limit(5),
          supabase.from('consultations').select('id,symptoms_description,status,admin_response,created_at').eq('user_id',uid).order('created_at',{ascending:false}).limit(4),
          supabase.from('tips').select('title,content,plant_name').limit(1),
          supabase.from('plants').select('*',{count:'exact',head:true}).eq('is_published',true),
        ])
        setFavorites((favs as unknown as FavoriteRow[])??[])
        setAllPlants(plants??[])
        setConsultations(cons??[])
        setTip(tips?.[0]??null)
        setTotalPlants(plantCount??0)
      }
      setLoading(false)
    })
  },[router])

  if(loading){
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:C.bg}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:60,height:60,background:C.primaryLight,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
            <Leaf style={{width:28,height:28,color:C.primary}}/>
          </div>
          <div style={{fontSize:15,color:C.text}}>Chargement...</div>
        </div>
      </div>
    )
  }

  if(profile?.role==='admin'){
    return <AdminDashboard displayName={profile.display_name} email={email} adminStats={adminStats} recentCons={recentCons} plants={allPlants}/>
  }

  return <UserDashboard displayName={profile?.display_name??null} email={email} favoritePlants={favoritePlants} allPlants={allPlants} consultations={consultations} tip={tip} totalPlants={totalPlants}/>
}
