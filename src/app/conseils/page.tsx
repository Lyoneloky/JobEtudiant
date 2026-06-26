import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AlertTriangle } from 'lucide-react'
import ConseilsClient, { type TipItem, type SideEffectReport } from './ConseilsClient'

const C = { primaryDark:'#166534', text:'#616161', bg:'#F8FAF5', border:'#E8EDE4' }

const STATIC_TIPS: TipItem[] = [
  { id:'1', title:'Tisane de gingembre contre la fièvre', content:'Le gingembre est le remède de référence des familles camerounaises contre les états grippaux.', season:'pluies', plant_name:'Gingembre sauvage', category:'fièvre', ingredients:['30g gingembre frais','1 citron','2 c. à café de miel','500ml eau'], steps:['Peler et râper le gingembre','Porter à ébullition 15 min','Filtrer','Ajouter citron et miel hors du feu','Boire chaud 3x/jour'], warning:'Ne pas dépasser 4g de gingembre/jour. Déconseillé aux personnes sous anticoagulants.' },
  { id:'2', title:'Décoction de goyave contre la diarrhée', content:'Les feuilles de goyave contiennent des tanins qui combattent les bactéries responsables de la diarrhée.', season:'all', plant_name:'Goyave (feuilles)', category:'digestif', ingredients:['15 jeunes feuilles de goyave','1 litre d\'eau propre'], steps:['Laver les feuilles','Porter à ébullition','Bouillir 20 min','Filtrer','Boire 1 tasse toutes les 4h'], warning:'Si diarrhée persiste plus de 48h ou avec du sang, consulter un médecin.' },
  { id:'3', title:'Tisane de citronnelle pour le sommeil', content:'La citronnelle possède des propriétés sédatives douces qui favorisent la détente.', season:'all', plant_name:'Citronnelle', category:'bien-être', ingredients:['3 tiges citronnelle fraîche','500ml eau','1 c. de miel'], steps:['Couper les tiges en tronçons','Écraser légèrement','Infuser 12 min dans eau bouillante','Filtrer, ajouter miel','Boire 30 min avant coucher'], warning:'Éviter en cas de grossesse. Ne pas associer avec des somnifères.' },
  { id:'4', title:'Moringa — nutrition et immunité', content:'Le moringa est considéré par l\'ONU comme une solution contre la malnutrition.', season:'seche', plant_name:'Moringa', category:'nutrition', ingredients:['Feuilles de moringa fraîches ou en poudre'], steps:['Récolter les jeunes feuilles','Sécher à l\'ombre 2-3 jours','Réduire en poudre','Ajouter à la bouillie ou aux sauces','Consommer quotidiennement'], warning:'Éviter les racines (toxiques). Prudence si traitement antidiabétique.' },
  { id:'5', title:'Aloe vera pour les brûlures légères', content:'Le gel d\'Aloe vera est le remède naturel le plus efficace contre les brûlures légères.', season:'all', plant_name:'Aloe vera', category:'peau', ingredients:['1 grande feuille d\'Aloe vera','Eau froide propre'], steps:['Couper la feuille à la base','Laisser écouler le latex jaune','Peler la peau verte','Extraire le gel','Appliquer sur la brûlure refroidie','Renouveler 3-4x/jour'], warning:'Toujours refroidir à l\'eau froide avant d\'appliquer. Ne jamais sur brûlure grave.' },
  { id:'6', title:'Décoction de neem contre le paludisme', content:'Les feuilles de neem contiennent de la nimbolide aux propriétés antiparasitaires reconnues.', season:'pluies', plant_name:'Neem', category:'antipaludique', ingredients:['40-50 feuilles de neem fraîches','1 litre d\'eau'], steps:['Laver les feuilles','Porter à ébullition','Bouillir 25 min','Laisser refroidir totalement','Filtrer','Boire 1 tasse le matin à jeun'], warning:'En prévention uniquement. Paludisme avéré : consulter immédiatement un médecin.' },
]

export default async function ConseilsPage() {
  let tips: TipItem[] = STATIC_TIPS
  let currentUserId: string | null = null
  let currentUserRole: string | null = null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  if (supabaseUrl.startsWith('http')) {
    const supabase = await createClient()

    // Utilisateur connecté + rôle
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      currentUserId = user.id
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      currentUserRole = profile?.role ?? 'user'
    }

    // Conseils avec auteur
    const { data: tipsData } = await supabase
      .from('tips')
      .select('id, title, content, season, plant_name, category, ingredients, steps, warning, author_name, author_id')
      .order('created_at', { ascending: true })

    if (tipsData && tipsData.length > 0) {
      tips = tipsData as TipItem[]

      // Signalements d'effets secondaires
      const { data: reportsData } = await supabase
        .from('side_effect_reports')
        .select('id, tip_id, user_id, user_name, description, herboriste_response, herboriste_name, status, created_at')
        .order('created_at', { ascending: true })

      if (reportsData && reportsData.length > 0) {
        const byTip: Record<string, SideEffectReport[]> = {}
        for (const r of reportsData as SideEffectReport[]) {
          if (!byTip[r.tip_id]) byTip[r.tip_id] = []
          byTip[r.tip_id].push(r)
        }
        tips = tips.map(t => ({ ...t, side_effect_reports: byTip[t.id] ?? [] }))
      }
    }
  }

  return (
    <div style={{ fontFamily:'"Inter",Arial,sans-serif', background:C.bg, minHeight:'100vh' }}>
      <Navbar />
      <main className="tb-page-sm">

        {/* Header */}
        <div style={{ marginBottom:40, textAlign:'center' }}>
          <h1 style={{ fontSize:40, fontWeight:800, color:'#111', lineHeight:'46px', letterSpacing:'-1px', fontFamily:"'Poppins',sans-serif", marginBottom:12 }}>
            Conseils et Bien-être
          </h1>
          <p style={{ fontSize:17, color:C.text, maxWidth:560, margin:'0 auto', lineHeight:'27px' }}>
            Des conseils publiés par nos herboristes, basés sur les plantes médicinales du Cameroun.
          </p>
        </div>

        <ConseilsClient
          tips={tips}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />

        {/* Avertissement médical */}
        <div style={{ marginTop:48, background:'#FFF8E8', border:'1px solid #FDE68A', borderRadius:20, padding:24, display:'flex', gap:14 }}>
          <div style={{ width:44, height:44, background:'#FEF3C7', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <AlertTriangle style={{ width:20, height:20, color:'#D97706' }}/>
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#92400E', marginBottom:6, fontFamily:"'Poppins',sans-serif" }}>Avertissement médical</div>
            <p style={{ fontSize:13, color:'#78350F', lineHeight:'21px', margin:0 }}>
              Ces conseils sont fournis à titre éducatif et ne remplacent pas une consultation médicale. Consultez toujours un professionnel de santé avant de commencer tout traitement à base de plantes.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
