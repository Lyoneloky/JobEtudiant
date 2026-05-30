import { Leaf, Shield, Star, AlertTriangle, Search, BookOpen, MapPin, Activity } from 'lucide-react'

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

/* ─── NAVBAR ─────────────────────────────────── */
function LandingNavbar() {
  const links = [
    { label: 'Plantes', href: '/plantes' },
    { label: 'Symptômes', href: '/symptomes' },
    { label: 'Glossaire', href: '/glossaire' },
    { label: 'Conseils', href: '/conseils' },
  ]
  return (
    <nav style={{ background: C.white, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
          <div style={{ width: 48, height: 48, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf style={{ width: 26, height: 26, color: C.white }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, lineHeight: '26px', color: C.primaryDark, fontFamily: "'Poppins', sans-serif" }}>TerraBio</div>
            <div style={{ fontSize: 12, color: C.textSub, marginTop: 1 }}>Santé naturelle · Cameroun</div>
          </div>
        </a>

        {/* Links */}
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          {links.map(({ label, href }) => (
            <a key={label} href={href} style={{ fontSize: 15, fontWeight: 500, color: '#1F1F1F', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/auth/login" style={{ height: 44, padding: '0 20px', borderRadius: 12, border: `1.5px solid ${C.primaryDark}`, color: C.primaryDark, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', textDecoration: 'none', background: 'transparent' }}>
            Connexion
          </a>
          <a href="/auth/register" style={{ height: 44, padding: '0 20px', borderRadius: 12, background: C.primaryDark, color: C.white, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', textDecoration: 'none', border: 'none' }}>
            S&apos;inscrire
          </a>
        </div>
      </div>
    </nav>
  )
}

/* ─── HERO ───────────────────────────────────── */
function Hero() {
  return (
    <section style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px', overflow: 'hidden' }}>
      <div className="tb-hero">

        {/* LEFT */}
        <div style={{ maxWidth: 580 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: 44, padding: '0 20px', background: C.primaryLight, borderRadius: 999, marginBottom: 36 }}>
            <Leaf style={{ width: 18, height: 18, color: C.primaryDark, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: C.primaryDark, letterSpacing: 0.5 }}>
              APPLICATION WEB · CAMEROUN · PLANTES MÉDICINALES
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 68, fontWeight: 800, lineHeight: '76px', letterSpacing: '-2px', color: '#111', margin: 0, fontFamily: "'Poppins', sans-serif" }}>
            Les plantes médicinales<br />du Cameroun,<br />
            <span style={{ color: C.primary }}>accessibles à tous.</span>
          </h1>

          {/* Description */}
          <p style={{ fontSize: 20, lineHeight: '34px', color: C.textSub, marginTop: 28, maxWidth: 500 }}>
            TerraBio vous aide à identifier les plantes médicinales locales, comprendre leurs usages et les utiliser en toute sécurité, même en zone rurale.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 18, marginTop: 38 }}>
            <a href="/plantes" style={{ height: 60, padding: '0 32px', borderRadius: 16, background: C.primaryDark, color: C.white, border: 'none', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', boxShadow: '0 12px 30px rgba(22,101,52,0.3)' }}>
              <Search style={{ width: 18, height: 18 }} />
              Rechercher une plante
            </a>
            <a href="/symptomes" style={{ height: 60, padding: '0 32px', borderRadius: 16, background: C.white, color: C.primaryDark, border: `2px solid ${C.primaryDark}`, fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <Activity style={{ width: 18, height: 18 }} />
              Rechercher par symptôme
            </a>
          </div>

          {/* Mini stats */}
          <div style={{ display: 'flex', gap: 32, marginTop: 44, paddingTop: 32, borderTop: `1px solid ${C.border}` }}>
            {[
              { value: '500+', label: 'Plantes' },
              { value: '100+', label: 'Symptômes' },
              { value: '8', label: 'Régions' },
              { value: 'Gratuit', label: 'Accès libre' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.primaryDark, fontFamily: "'Poppins', sans-serif" }}>{value}</div>
                <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — visual illustration */}
        <div style={{ position: 'relative', height: 680, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Blob */}
          <div style={{ position: 'absolute', width: 520, height: 460, background: C.primaryLight, borderRadius: '48% 52% 61% 39% / 42% 44% 56% 58%', right: -40, top: 80, zIndex: 0 }} />

          {/* Central card */}
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
            <div style={{ height: 46, background: C.primaryDark, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Voir la fiche complète
            </div>
          </div>

          {/* Floating tags */}
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
    { n: '1', title: 'Décrivez', desc: 'Indiquez votre symptôme ou le nom de la plante que vous recherchez.', emoji: '💬' },
    { n: '2', title: 'Identifiez', desc: 'Découvrez les plantes correspondantes avec leurs propriétés détaillées.', emoji: '🔍' },
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

/* ─── STATS ──────────────────────────────────── */
function Stats() {
  const items = [
    { value: '500+', label: 'Plantes répertoriées' },
    { value: '100+', label: 'Symptômes couverts' },
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
            <a href="/auth/register" style={{ height: 62, padding: '0 36px', borderRadius: 18, background: C.primaryDark, color: C.white, border: 'none', fontSize: 17, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', boxShadow: '0 12px 30px rgba(22,101,52,0.3)' }}>
              <Leaf style={{ width: 18, height: 18 }} /> Créer mon compte
            </a>
            <a href="/plantes" style={{ height: 62, padding: '0 36px', borderRadius: 18, background: C.white, color: '#111', border: `1.5px solid ${C.border}`, fontSize: 17, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              Explorer les plantes
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── FOOTER ─────────────────────────────────── */
function LandingFooter() {
  return (
    <footer style={{ background: '#0f2318', marginTop: 80, padding: '60px 80px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
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
            { title: 'Navigation', links: [{ label: 'Accueil', href: '/' }, { label: 'Plantes', href: '/plantes' }, { label: 'Symptômes', href: '/symptomes' }, { label: 'Glossaire', href: '/glossaire' }] },
            { title: 'Découvrir', links: [{ label: 'Conseils', href: '/conseils' }, { label: 'Carte', href: '/carte' }, { label: 'Connexion', href: '/auth/login' }, { label: 'Inscription', href: '/auth/register' }] },
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
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>© 2026 TerraBio. Tous droits réservés.</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Fait pour la santé naturelle du Cameroun</div>
        </div>
      </div>
    </footer>
  )
}

/* ─── MAIN PAGE ──────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ fontFamily: '"Inter", Arial, sans-serif', background: C.bg, overflowX: 'hidden' }}>
      <LandingNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <CTABanner />
      <LandingFooter />
    </div>
  )
}
