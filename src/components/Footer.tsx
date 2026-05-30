import { Leaf, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const links = [
    { label: 'Accueil', href: '/' },
    { label: 'Plantes', href: '/plantes' },
    { label: 'Symptômes', href: '/symptomes' },
    { label: 'Glossaire', href: '/glossaire' },
    { label: 'Conseils', href: '/conseils' },
    { label: 'Carte', href: '/carte' },
  ]

  return (
    <footer style={{ background: '#0f2318', marginTop: 64, fontFamily: '"Inter", Arial, sans-serif' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 40px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, background: '#22c55e', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'white', fontFamily: "'Poppins', sans-serif" }}>TerraBio</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: '20px', maxWidth: 260 }}>
              Plateforme d&apos;aide à l&apos;utilisation responsable des plantes médicinales du Cameroun.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 16 }}>NAVIGATION</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {links.map(({ label, href }) => (
                <Link key={label} href={href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div>
            <div style={{ background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: 14, padding: 18, display: 'flex', gap: 12 }}>
              <AlertTriangle style={{ width: 18, height: 18, color: '#FCD34D', marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#FCD34D', marginBottom: 6 }}>Avertissement médical</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: '18px' }}>
                  Les informations de cette plateforme sont à titre éducatif uniquement. Consultez toujours un professionnel de santé avant toute utilisation thérapeutique.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>© {new Date().getFullYear()} TerraBio — Santé naturelle du Cameroun</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Utilisation responsable des plantes médicinales</div>
        </div>
      </div>
    </footer>
  )
}
