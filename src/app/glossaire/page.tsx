import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GlossaireClient, { type GlossaryTerm } from './GlossaireClient'

const C = { text:'#616161', bg:'#F8FAF5' }

const STATIC_TERMS: GlossaryTerm[] = [
  { term:'Autosoin',            definition:"Ensemble de pratiques par lesquelles une personne prend en charge sa propre santé sans intervention directe d'un professionnel médical.", category:'médical' },
  { term:'Contre-indication',   definition:"Situation médicale dans laquelle un traitement ne doit pas être utilisé car il peut être dangereux.", category:'médical' },
  { term:'Décoction',           definition:"Méthode d'extraction consistant à faire bouillir une plante dans de l'eau pendant 10 à 30 minutes. Convient aux parties dures : racines, écorces, graines.", category:'préparation' },
  { term:'Infusion',            definition:"Méthode consistant à verser de l'eau bouillante sur une plante et laisser macérer 5-15 minutes hors du feu. Convient aux feuilles et fleurs.", category:'préparation' },
  { term:'Macération',          definition:"Trempage d'une plante dans un liquide froid pendant plusieurs heures pour en extraire les principes actifs sans chaleur.", category:'préparation' },
  { term:'Phytothérapie',       definition:"Branche de la médecine qui utilise les extraits de plantes à des fins thérapeutiques. Reconnue par l'OMS.", category:'discipline' },
  { term:'Posologie',           definition:"Quantité et fréquence avec lesquelles un remède doit être administré pour être efficace et sûr.", category:'médical' },
  { term:'Pharmacopée',         definition:"Collection officielle répertoriant les substances médicinales reconnues et leurs modes d'utilisation.", category:'discipline' },
  { term:'Plante médicinale',   definition:"Espèce végétale dont une ou plusieurs parties contiennent des substances bénéfiques pour la santé humaine.", category:'botanique' },
  { term:'Principe actif',      definition:"Substance chimique présente dans une plante responsable de l'effet thérapeutique observé.", category:'biochimie' },
  { term:'Alcaloïde',           definition:"Composé organique azoté d'origine végétale aux propriétés physiologiques puissantes. Ex : la quinine.", category:'biochimie' },
  { term:'Flavonoïde',          definition:"Composés phénoliques végétaux aux propriétés antioxydantes et anti-inflammatoires.", category:'biochimie' },
  { term:'Tanin',               definition:"Composé polyphénolique aux propriétés astringentes et antibactériennes. Abondants dans les feuilles de goyave.", category:'biochimie' },
  { term:'Fébrifuge',           definition:"Substance qui fait baisser la fièvre. Le neem et le gingembre ont des propriétés fébrifuges.", category:'médical' },
  { term:'Antipaludique',       definition:"Remède utilisé pour traiter ou prévenir le paludisme, causé par le parasite Plasmodium.", category:'médical' },
  { term:'Antioxydant',         definition:"Substance qui neutralise les radicaux libres. Le moringa et la goyave sont riches en antioxydants.", category:'biochimie' },
  { term:'Ethnobotanique',      definition:"Science qui étudie les relations entre les plantes et les cultures humaines, notamment leurs usages médicinaux.", category:'discipline' },
  { term:'Herboriste',          definition:"Personne spécialisée dans la connaissance et la vente des plantes médicinales.", category:'profession' },
  { term:'Huile essentielle',   definition:"Extrait aromatique concentré obtenu par distillation à la vapeur. Très puissante, toujours diluée.", category:'préparation' },
  { term:'Médecine traditionnelle', definition:"Ensemble de pratiques et remèdes basés sur les plantes, transmis de génération en génération.", category:'discipline' },
  { term:'OMS',                 definition:"Organisation Mondiale de la Santé. Reconnaît la médecine traditionnelle et encourage la documentation des plantes médicinales.", category:'institution' },
  { term:'Teinture mère',       definition:"Extrait liquide obtenu par macération d'une plante fraîche dans l'alcool éthylique. Concentrée, longue conservation.", category:'préparation' },
  { term:'Toxicité',            definition:"Capacité d'une substance à causer des effets nocifs. Certaines plantes sont toxiques à forte dose.", category:'médical' },
  { term:'Interaction médicamenteuse', definition:"Modification des effets d'un médicament par une autre substance. Ex : le millepertuis interagit avec de nombreux médicaments.", category:'médical' },
  { term:'Cataplasme',          definition:"Application externe d'une préparation à base de plantes directement sur la peau pour un effet local.", category:'préparation' },
]

export default async function GlossairePage() {
  let terms: GlossaryTerm[] = STATIC_TERMS

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  if (supabaseUrl.startsWith('http')) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('glossary')
      .select('id, term, definition, category')
      .order('term', { ascending: true })
    if (data && data.length > 0) terms = data as GlossaryTerm[]
  }

  return (
    <div style={{ fontFamily:'"Inter",Arial,sans-serif', background:C.bg, minHeight:'100vh' }}>
      <Navbar />
      <main style={{ maxWidth:960, margin:'0 auto' }} className="tb-page">

        {/* Header */}
        <div style={{ marginBottom:40, textAlign:'center' }}>
          <h1 style={{ fontSize:40, fontWeight:800, color:'#111', lineHeight:'46px', letterSpacing:'-1px', fontFamily:"'Poppins',sans-serif", marginBottom:12 }}>
            Glossaire médical et botanique
          </h1>
          <p style={{ fontSize:17, color:C.text, maxWidth:520, margin:'0 auto', lineHeight:'27px' }}>
            Comprendre les termes techniques de la phytothérapie et de la botanique pour utiliser les plantes en connaissance de cause.
          </p>
          <div style={{ marginTop:12, fontSize:13, color:C.text }}>{terms.length} termes disponibles</div>
        </div>

        <GlossaireClient terms={terms} />
      </main>
      <Footer />
    </div>
  )
}
