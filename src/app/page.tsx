import { Leaf, Shield, Star, AlertTriangle, Search, BookOpen, MapPin, Activity, Lock, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

/* ─── COULEURS TerraBio ─────────────────────── */
const C = {
  primary: '#22c55e',
  primaryDark: '#166534',
  primaryLight: '#dcfce7',
  beige: '#F1EFE6',
  blue: '#2196F3',
  textSub: '#616161',
  bg: '#F8FAF5',
  white: '#FFFFFF',
  border: '#E8EDE4',
}

const PLANT_EMOJI: Record<string, string> = {
  Goyave:'🍃', Citronnelle:'🌿', Gingembre:'🫚', Prunier:'🌲', Moringa:'🌱',
  Neem:'🍀', Aloe:'🪴', Eucalyptus:'🌿', Papayer:'🍃', Basilic:'🌿',
  Menthe:'🌿', Camomille:'🌼', Thym:'🌿', Romarin:'🌿', Ortie:'🌿',
  Sauge:'🌿', Pissenlit:'🌻', Mélisse:'🌿',
}
const PLANT_COLORS = [C.primaryLight, '#FFFDE8', '#FFF8E8', '#FFF0F0', '#E8F5E8', '#EFF6FF', '#F3E8FF', '#FFF8E8']
const plantEmoji = (n: string) => { const k = Object.keys(PLANT_EMOJI).find(k => n.includes(k)); return k ? PLANT_EMOJI[k] : '🌿' }
const plantColor = (i: number) => PLANT_COLORS[i % PLANT_COLORS.length]

type PlantRow = { id: string; name: string; latin_name: string | null; properties: string[] }

/* ─── HERO ───────────────────────────────────── */
function Hero() {
  return (
    <section style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px', overflow: 'hidden' }}>
      <div className="tb-hero">

        {/* LEFT */}
        <div style={{ maxWidth: 580 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: 44, padding: '0 20px', background: C.primaryLight, borderRadius: 999, marginBottom: 36 }}>
            <Leaf style={{ width: 18, height: 18, color: C.primaryDark, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: C.primaryDark, letterSpacing: 0.5 }}>
              APPLICATION WEB · CAMEROUN · PLANTES MÉDICINALES
            </span>
          </div>

          <h1 className="tb-hero-title" style={{ fontWeight: 800, color: '#111', margin: 0, fontFamily: "'Poppins', sans-serif" }}>
            Les plantes médicinales<br />du Cameroun,<br />
            <span style={{ color: C.primary }}>accessibles à tous.</span>
          </h1>

          <p style={{ fontSize: 20, lineHeight: '34px', color: C.textSub, marginTop: 28, maxWidth: 500 }}>
            TerraBio vous aide à identifier les plantes médicinales locales, comprendre leurs usages et les utiliser en toute sécurité, même en zone rurale.
          </p>

          <div className="tb-cta-btns">
            <Link href="/auth/register" style={{ height: 60, padding: '0 32px', borderRadius: 16, background: C.primaryDark, color: C.white, fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', boxShadow: '0 12px 30px rgba(22,101,52,0.3)' }}>
              <Leaf style={{ width: 18, height: 18 }} />
              Créer mon compte gratuit
            </Link>
            <Link href="/auth/login" style={{ height: 60, padding: '0 32px', borderRadius: 16, background: C.white, color: C.primaryDark, border: `2px solid ${C.primaryDark}`, fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <Search style={{ width: 18, height: 18 }} />
              Se connecter
            </Link>
          </div>

        </div>

        {/* RIGHT — illustration */}
        <div className="tb-hero-right">
          <div style={{ position: 'absolute', width: 520, height: 460, background: C.primaryLight, borderRadius: '48% 52% 61% 39% / 42% 44% 56% 58%', right: -40, top: 80, zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 5, width: 320, background: C.white, borderRadius: 28, padding: 28, boxShadow: '0 30px 80px rgba(22,101,52,0.15)', border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, background: C.primaryLight, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🌿</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#111', fontFamily: "'Poppins', sans-serif" }}>Goyave (Psidium guajava)</div>
                <div style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>Feuilles médicinales</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {['Anti-diarrhéique', 'Antioxydant', 'Antibactérien'].map(tag => (
                <span key={tag} style={{ height: 28, padding: '0 12px', background: C.primaryLight, borderRadius: 10, fontSize: 12, color: C.primaryDark, display: 'inline-flex', alignItems: 'center', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
            <div style={{ fontSize: 14, color: C.textSub, lineHeight: '22px', marginBottom: 16 }}>
              Les feuilles de goyave sont utilisées contre la diarrhée, les infections et pour réguler la glycémie.
            </div>
            <Link href="/auth/register" style={{ height: 46, background: C.primaryDark, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 14, fontWeight: 600, textDecoration: 'none', gap: 8 }}>
              <Lock style={{ width: 14, height: 14 }} /> Voir la fiche complète
            </Link>
          </div>
          <div style={{ position: 'absolute', top: 120, left: 20, background: C.white, borderRadius: 16, padding: '12px 18px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 10, zIndex: 6 }}>
            <span style={{ fontSize: 20 }}>🫚</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Gingembre sauvage</div>
              <div style={{ fontSize: 11, color: C.textSub }}>Anti-inflammatoire</div>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 160, left: 10, background: C.white, borderRadius: 16, padding: '12px 18px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 10, zIndex: 6 }}>
            <span style={{ fontSize: 20 }}>🌱</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Moringa</div>
              <div style={{ fontSize: 11, color: C.textSub }}>Nutrition · Énergie</div>
            </div>
          </div>
          <div style={{ position: 'absolute', top: 200, right: 10, background: C.primaryDark, borderRadius: 16, padding: '10px 16px', zIndex: 6 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.white, fontFamily: "'Poppins', sans-serif" }}>8</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Régions couvertes</div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── FEATURES ───────────────────────────────── */
function Features() {
  const items = [
    { Icon: Activity, title: 'Recherche par symptôme', desc: 'Décrivez vos symptômes et découvrez les plantes médicinales adaptées à votre situation.', color: '#EFF6FF', iconColor: C.blue },
    { Icon: Shield, title: 'Fiches validées', desc: 'Chaque fiche est vérifiée : propriétés, posologie, contre-indications et mode de préparation.', color: C.primaryLight, iconColor: C.primaryDark },
    { Icon: MapPin, title: 'Géolocalisation', desc: 'Trouvez les herboristeries, marchés et zones de cueillette autour de vous au Cameroun.', color: '#FFF8E8', iconColor: '#D4A017' },
    { Icon: BookOpen, title: 'Glossaire', desc: 'Un dictionnaire médical et botanique pour comprendre les termes techniques en toute clarté.', color: '#FFF3F0', iconColor: '#E05D3A' },
  ]
  return (
    <section style={{ maxWidth: 1280, margin: '60px auto 0', padding: '0 24px' }}>
      <h2 style={{ fontSize: 36, fontWeight: 800, color: '#111', textAlign: 'center', marginBottom: 12, fontFamily: "'Poppins', sans-serif", letterSpacing: '-1px' }}>
        Tout ce dont vous avez besoin
      </h2>
      <p style={{ fontSize: 17, color: C.textSub, textAlign: 'center', marginBottom: 40, lineHeight: '28px' }}>
        Des outils simples pour une utilisation responsable des plantes médicinales
      </p>
      <div className="tb-features">
        {items.map(({ Icon, title, desc, color, iconColor }) => (
          <div key={title} style={{ background: C.white, borderRadius: 24, padding: '28px 24px', border: `1px solid ${C.border}`, boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 56, height: 56, background: color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <Icon style={{ width: 26, height: 26, color: iconColor }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 10, fontFamily: "'Poppins', sans-serif" }}>{title}</div>
            <div style={{ fontSize: 14, color: C.textSub, lineHeight: '22px' }}>{desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── HOW IT WORKS ───────────────────────────── */
function HowItWorks() {
  const steps = [
    { n: '1', title: 'Inscrivez-vous', desc: 'Créez votre compte gratuit en quelques secondes pour accéder à toutes les fonctionnalités.', emoji: '✍️' },
    { n: '2', title: 'Identifiez', desc: 'Décrivez un symptôme ou recherchez le nom d\'une plante dans notre catalogue.', emoji: '🔍' },
    { n: '3', title: 'Préparez', desc: 'Suivez les instructions de préparation : infusion, décoction, macération...', emoji: '🍵' },
    { n: '4', title: 'Agissez', desc: 'Utilisez les plantes en toute sécurité grâce aux recommandations intégrées.', emoji: '✅' },
  ]
  return (
    <section style={{ maxWidth: 1280, margin: '60px auto 0', padding: '0 24px' }}>
      <h2 style={{ fontSize: 36, fontWeight: 800, color: '#111', textAlign: 'center', marginBottom: 12, fontFamily: "'Poppins', sans-serif", letterSpacing: '-1px' }}>
        Comment ça marche ?
      </h2>
      <p style={{ fontSize: 17, color: C.textSub, textAlign: 'center', marginBottom: 40, lineHeight: '28px' }}>
        Quatre étapes simples pour une utilisation responsable
      </p>
      <div className="tb-steps">
        <div style={{ position: 'absolute', top: 40, left: '12.5%', right: '12.5%', height: 2, background: `linear-gradient(90deg, ${C.primaryLight}, ${C.primary}, ${C.primaryLight})`, zIndex: 0 }} />
        {steps.map(({ n, title, desc, emoji }) => (
          <div key={n} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: parseInt(n) % 2 === 0 ? C.primary : C.primaryDark, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(34,197,94,0.25)', border: `4px solid ${C.bg}` }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: C.white, fontFamily: "'Poppins', sans-serif" }}>{n}</span>
            </div>
            <div style={{ fontSize: 32, marginBottom: 14 }}>{emoji}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 10, fontFamily: "'Poppins', sans-serif" }}>{title}</div>
            <div style={{ fontSize: 14, color: C.textSub, lineHeight: '22px' }}>{desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── TEASER PLANTES ─────────────────────────── */
const PLANT_GRADIENTS = [
  { bg: 'linear-gradient(135deg, #d1fae5, #6ee7b7, #059669)', accent: '#065f46' },
  { bg: 'linear-gradient(135deg, #fef9c3, #fde68a, #d97706)', accent: '#92400e' },
  { bg: 'linear-gradient(135deg, #dcfce7, #86efac, #16a34a)', accent: '#14532d' },
]
const PLANT_IMAGES = ['/plants/goyave.jpg', '/plants/gingembre.jpg', '/plants/moringa.jpg']

function PlantRow({ plant, index }: { plant: PlantRow; index: number }) {
  const reversed = index % 2 === 1
  const grad = PLANT_GRADIENTS[index % PLANT_GRADIENTS.length]
  const imgSrc = PLANT_IMAGES[index] ?? '/plants/plante.jpg'

  const imageBlock = (
    <div style={{
      borderRadius: 24,
      overflow: 'hidden',
      height: 360,
      flexShrink: 0,
      flexBasis: '45%',
      /* CSS background fallback : image réelle si dispo, sinon gradient */
      background: `url(${imgSrc}) center/cover no-repeat, ${grad.bg}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Emoji centré visible uniquement si pas d'image (la background-image le cache) */}
      <div style={{ fontSize: 90, opacity: 0.35, userSelect: 'none', pointerEvents: 'none' }}>{plantEmoji(plant.name)}</div>
    </div>
  )

  const textBlock = (
    <div style={{ flex: 1, padding: '0 8px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.primaryLight, borderRadius: 999, padding: '4px 12px', marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.primaryDark, letterSpacing: 0.5 }}>PLANTE MÉDICINALE</span>
      </div>
      <h3 style={{ fontSize: 34, fontWeight: 800, color: '#111', fontFamily: "'Poppins', sans-serif", marginBottom: 6, letterSpacing: '-0.5px' }}>
        {plant.name}
      </h3>
      {plant.latin_name && (
        <p style={{ fontSize: 15, color: C.textSub, fontStyle: 'italic', marginBottom: 20 }}>{plant.latin_name}</p>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {(plant.properties ?? []).slice(0, 4).map(prop => (
          <span key={prop} style={{ height: 30, padding: '0 14px', background: C.primaryLight, borderRadius: 10, fontSize: 13, color: C.primaryDark, display: 'inline-flex', alignItems: 'center', fontWeight: 600 }}>{prop}</span>
        ))}
      </div>
      <div style={{ height: 1, background: C.border, marginBottom: 24 }} />
      <p style={{ fontSize: 15, color: C.textSub, lineHeight: '26px', marginBottom: 32 }}>
        Inscrivez-vous pour accéder à la fiche complète : usages, préparation, dosage recommandé, contre-indications et disponibilité au Cameroun.
      </p>
      <Link href="/auth/register" style={{
        height: 50, padding: '0 28px', borderRadius: 14, background: C.primaryDark,
        color: C.white, fontSize: 14, fontWeight: 700, display: 'inline-flex',
        alignItems: 'center', gap: 9, textDecoration: 'none',
        boxShadow: '0 8px 24px rgba(22,101,52,0.2)',
      }}>
        <Lock style={{ width: 14, height: 14 }} /> Voir la fiche complète
      </Link>
    </div>
  )

  return (
    <div style={{
      display: 'flex',
      flexDirection: reversed ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 60,
      background: C.white,
      borderRadius: 28,
      padding: '40px 48px',
      border: `1px solid ${C.border}`,
      boxShadow: '0 8px 40px rgba(0,0,0,0.05)',
    }}>
      {textBlock}
      {imageBlock}
    </div>
  )
}

function PlantsTeaser({ plants }: { plants: PlantRow[] }) {
  return (
    <section style={{ maxWidth: 1280, margin: '80px auto 0', padding: '0 24px' }}>
      {/* En-tête */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.primaryLight, borderRadius: 999, padding: '6px 16px', marginBottom: 16 }}>
          <Leaf style={{ width: 14, height: 14, color: C.primaryDark }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.primaryDark, letterSpacing: 0.5 }}>APERÇU DU CATALOGUE</span>
        </div>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#111', marginBottom: 14, fontFamily: "'Poppins', sans-serif", letterSpacing: '-1px' }}>
          Quelques plantes médicinales
        </h2>
        <p style={{ fontSize: 17, color: C.textSub, lineHeight: '28px', maxWidth: 560, margin: '0 auto' }}>
          Découvrez un aperçu de notre catalogue. <strong style={{ color: C.primaryDark }}>Inscrivez-vous gratuitement</strong> pour accéder à toutes les fiches détaillées.
        </p>
      </div>

      {/* Rows alternées */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {plants.map((plant, i) => <PlantRow key={plant.id} plant={plant} index={i} />)}
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginTop: 52 }}>
        <Link href="/auth/register" style={{ height: 52, padding: '0 32px', borderRadius: 16, background: C.primaryDark, color: C.white, fontSize: 15, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', boxShadow: '0 8px 24px rgba(22,101,52,0.2)' }}>
          Voir toutes les plantes du catalogue <ChevronRight style={{ width: 16, height: 16 }} />
        </Link>
        <p style={{ fontSize: 13, color: C.textSub, marginTop: 12 }}>Inscription gratuite · Aucune carte bancaire requise</p>
      </div>
    </section>
  )
}

/* ─── STATS ──────────────────────────────────── */
function Stats() {
  const items = [
    { value: '18+', label: 'Plantes répertoriées' },
    { value: '30+', label: 'Symptômes couverts' },
    { value: '8', label: 'Régions du Cameroun' },
    { value: 'Gratuit', label: 'Accès libre & gratuit' },
  ]
  return (
    <section style={{ margin: '60px 0 0', padding: '0 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', background: `linear-gradient(135deg, ${C.primaryDark}, #1a5c36, #22c55e)`, borderRadius: 28, padding: '36px 32px' }}>
        <div className="tb-stats-banner">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 8 }}>EN CHIFFRES</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.white, lineHeight: '30px', fontFamily: "'Poppins', sans-serif" }}>TerraBio en quelques chiffres</div>
          </div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {items.map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: C.white, lineHeight: '44px', fontFamily: "'Poppins', sans-serif" }}>{value}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── À PROPOS ───────────────────────────────── */
function APropos() {
  return (
    <section id="a-propos" style={{ maxWidth: 1280, margin: '80px auto 0', padding: '0 24px', scrollMarginTop: 80 }}>
      {/* Badge */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.primaryLight, borderRadius: 999, padding: '6px 16px', marginBottom: 16 }}>
          <Star style={{ width: 14, height: 14, color: C.primaryDark }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.primaryDark, letterSpacing: 0.5 }}>À PROPOS DE TERRABIO</span>
        </div>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#111', fontFamily: "'Poppins', sans-serif", letterSpacing: '-1px', marginBottom: 0 }}>
          La santé naturelle, accessible à tous
        </h2>
      </div>

      {/* Corps : texte + image */}
      <div className="tb-apropos">

        {/* Texte */}
        <div>
          <p style={{ fontSize: 18, lineHeight: '32px', color: '#333', marginBottom: 24, fontWeight: 500 }}>
            Au Cameroun, <strong style={{ color: C.primaryDark }}>plus de 80 % de la population rurale</strong> a recours aux plantes médicinales comme premier soin de santé. Pourtant, faute d'informations fiables et accessibles, ces pratiques ancestrales restent souvent mal documentées.
          </p>
          <p style={{ fontSize: 16, lineHeight: '28px', color: C.textSub, marginBottom: 28 }}>
            <strong>TerraBio</strong> est né de cette réalité. Développée par <strong>NOAH MEKONGO Barnabé Lionel</strong> à l'Institut Africain d'Informatique (IAI-Cameroun), cette plateforme numérique met à la portée de tous — familles, soignants et herboristes — un catalogue structuré de plantes médicinales locales, enrichi de fiches détaillées, de conseils d'utilisation et d'une carte interactive des ressources botaniques.
          </p>
          <p style={{ fontSize: 16, lineHeight: '28px', color: C.textSub, marginBottom: 36 }}>
            Notre mission : <em>démocratiser l'accès à la connaissance phytothérapeutique</em> tout en promouvant une utilisation sûre et responsable des plantes du terroir camerounais.
          </p>
          {/* Points forts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { emoji: '🌿', text: 'Fiches botaniques validées, issues de la pharmacopée camerounaise' },
              { emoji: '🔒', text: 'Contre-indications et précautions clairement indiquées' },
              { emoji: '📍', text: 'Carte interactive des ressources disponibles par région' },
              { emoji: '💬', text: 'Consultation personnalisée avec des herboristes certifiés' },
            ].map(({ emoji, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 40, height: 40, background: C.primaryLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{emoji}</div>
                <p style={{ fontSize: 15, color: '#333', lineHeight: '24px', margin: 0, paddingTop: 8 }}>{text}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 36 }}>
            <Link href="/auth/register" style={{ height: 52, padding: '0 28px', borderRadius: 16, background: C.primaryDark, color: C.white, fontSize: 15, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', boxShadow: '0 8px 24px rgba(22,101,52,0.25)' }}>
              <Leaf style={{ width: 16, height: 16 }} /> Rejoindre TerraBio
            </Link>
          </div>
        </div>

        {/* Image — CSS background : photo réelle si /enfant-herbe.jpg présent, sinon gradient vert */}
        <div
          className="tb-apropos-img"
          style={{
            background: 'url(/enfant-herbe.jpg) center/cover no-repeat, linear-gradient(160deg, #166534 0%, #22c55e 60%, #a3e635 100%)',
          }}
        />
      </div>
    </section>
  )
}

/* ─── CTA BANNER ─────────────────────────────── */
function CTABanner() {
  return (
    <section style={{ margin: '60px 0 0', padding: '0 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: C.beige, borderRadius: 28, padding: '48px 32px', border: `1px solid ${C.border}` }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.primaryLight, borderRadius: 999, padding: '8px 18px', marginBottom: 28 }}>
            <Leaf style={{ width: 16, height: 16, color: C.primaryDark }} />
            <span style={{ fontSize: 13, color: C.primaryDark, fontWeight: 600 }}>Plateforme web gratuite</span>
          </div>
          <h2 style={{ fontSize: 44, fontWeight: 800, color: '#111', lineHeight: '52px', letterSpacing: '-1px', marginBottom: 16, fontFamily: "'Poppins', sans-serif" }}>
            Utilisez TerraBio gratuitement
          </h2>
          <p style={{ fontSize: 18, color: C.textSub, lineHeight: '28px', marginBottom: 40, maxWidth: 540, margin: '0 auto 40px' }}>
            Accédez à la base de données des plantes médicinales du Cameroun, aux fiches détaillées et aux conseils de santé naturelle.
          </p>
          <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
            <Link href="/auth/register" style={{ height: 62, padding: '0 36px', borderRadius: 18, background: C.primaryDark, color: C.white, fontSize: 17, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', boxShadow: '0 12px 30px rgba(22,101,52,0.3)' }}>
              <Leaf style={{ width: 18, height: 18 }} /> Créer mon compte
            </Link>
            <Link href="/auth/login" style={{ height: 62, padding: '0 36px', borderRadius: 18, background: C.white, color: '#111', border: `1.5px solid ${C.border}`, fontSize: 17, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── FOOTER ─────────────────────────────────── */
function LandingFooter() {
  return (
    <footer className="tb-landing-footer">
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="tb-footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: C.primary, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf style={{ width: 22, height: 22, color: C.white }} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.white, fontFamily: "'Poppins', sans-serif" }}>TerraBio</div>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: '22px', maxWidth: 280 }}>
              Plateforme web d&apos;aide à l&apos;utilisation responsable des plantes médicinales du Cameroun.
            </p>
          </div>
          {[
            { title: 'Navigation', links: [{ label: 'Accueil', href: '/' }, { label: 'À propos', href: '#a-propos' }, { label: 'Connexion', href: '/auth/login' }, { label: 'Inscription', href: '/auth/register' }] },
            { title: 'Découvrir', links: [{ label: 'Plantes', href: '/auth/register' }, { label: 'Symptômes', href: '/auth/register' }, { label: 'Carte', href: '/auth/register' }, { label: 'Glossaire', href: '/auth/register' }] },
            { title: 'Légal', links: [{ label: 'Mentions légales', href: '#' }, { label: 'Confidentialité', href: '#' }, { label: 'CGU', href: '#' }, { label: 'Contact', href: '#' }] },
          ].map(({ title, links }) => (
            <div key={title}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 16 }}>{title.toUpperCase()}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(l => <a key={l.label} href={l.href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{l.label}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div className="tb-footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>© 2026 TerraBio — IAI-Cameroun. Tous droits réservés.</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Fait pour la santé naturelle du Cameroun</div>
        </div>
      </div>
    </footer>
  )
}

/* ─── DONNÉES STATIQUES (fallback si Supabase absent) ─── */
const STATIC_PLANTS: PlantRow[] = [
  { id: '1', name: 'Goyave',    latin_name: 'Psidium guajava',      properties: ['Anti-diarrhéique', 'Antioxydant', 'Antibactérien'] },
  { id: '2', name: 'Gingembre', latin_name: 'Zingiber officinale',  properties: ['Anti-inflammatoire', 'Digestif', 'Antiémétique'] },
  { id: '3', name: 'Moringa',   latin_name: 'Moringa oleifera',     properties: ['Nutritif', 'Antioxydant', 'Immunostimulant'] },
]

/* ─── MAIN PAGE ──────────────────────────────── */
export default async function LandingPage() {
  /* Récupérer 3 plantes pour le teaser */
  let teaserPlants: PlantRow[] = STATIC_PLANTS
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    if (supabaseUrl.startsWith('http') && !supabaseUrl.includes('placeholder')) {
      const supabase = await createClient()
      const { data } = await supabase
        .from('plants')
        .select('id, name, latin_name, properties')
        .eq('is_published', true)
        .limit(3)
      if (data && data.length > 0) teaserPlants = data
    }
  } catch { /* fallback statique si erreur */ }

  return (
    <div style={{ fontFamily: '"Inter", Arial, sans-serif', background: C.bg, overflowX: 'hidden' }}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <PlantsTeaser plants={teaserPlants} />
      <Stats />
      <CTABanner />
      <APropos />
      <LandingFooter />
    </div>
  )
}
