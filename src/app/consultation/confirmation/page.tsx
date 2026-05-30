import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CheckCircle, Clock, Home, Search } from 'lucide-react'

const C = { dark: '#166534', light: '#dcfce7', text: '#616161', border: '#E8EDE4', white: '#FFFFFF', bg: '#F8FAF5' }

export default function ConfirmationPage() {
  return (
    <div style={{ fontFamily: '"Inter", Arial, sans-serif', background: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <div style={{ width: 96, height: 96, background: C.light, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle style={{ width: 48, height: 48, color: C.dark }} />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111', fontFamily: "'Poppins', sans-serif", marginBottom: 12 }}>
          Demande envoyée !
        </h1>
        <p style={{ fontSize: 17, color: C.text, lineHeight: '28px', marginBottom: 32 }}>
          Votre demande de consultation a bien été enregistrée. Notre équipe l'examinera et vous apportera une réponse personnalisée dans les meilleurs délais.
        </p>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Clock style={{ width: 20, height: 20, color: C.dark }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: '#222' }}>Délai de réponse estimé</span>
          </div>
          <p style={{ fontSize: 14, color: C.text, margin: 0, lineHeight: '22px' }}>
            24 à 48 heures ouvrables. Vous retrouverez la réponse dans votre tableau de bord sous l'onglet <strong>Demandes</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard"
            style={{ height: 48, padding: '0 24px', background: C.dark, color: C.white, borderRadius: 14, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Home style={{ width: 16, height: 16 }} /> Tableau de bord
          </Link>
          <Link href="/symptomes"
            style={{ height: 48, padding: '0 24px', background: C.white, color: C.dark, border: `1.5px solid ${C.dark}`, borderRadius: 14, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Search style={{ width: 16, height: 16 }} /> Nouvelle recherche
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
