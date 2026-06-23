import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Stethoscope, Clock, CheckCircle, Eye, ArrowLeft } from 'lucide-react'

const C = { dark: '#166534', light: '#dcfce7', text: '#616161', border: '#E8EDE4', white: '#FFFFFF', bg: '#F8FAF5' }

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  en_attente: { label: 'En attente',  bg: '#FFF8E8', color: '#E65100' },
  en_cours:   { label: 'En cours',    bg: '#E3F2FD', color: '#1565C0' },
  traitee:    { label: 'Traitée',     bg: '#E8F5E9', color: '#1B5E20' },
  fermee:     { label: 'Fermée',      bg: '#F5F5F5', color: '#616161' },
}

export default async function AdminConsultationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: consultations } = await supabase
    .from('consultations')
    .select('*, profiles(display_name)')
    .order('created_at', { ascending: false })

  const stats = {
    total: consultations?.length ?? 0,
    en_attente: consultations?.filter(c => c.status === 'en_attente').length ?? 0,
    traitees: consultations?.filter(c => c.status === 'traitee').length ?? 0,
  }

  return (
    <div style={{ maxWidth: 1100, padding: '8px 0 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Link href="/admin/plantes" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.text, textDecoration: 'none', marginBottom: 10 }}>
              <ArrowLeft style={{ width: 14, height: 14 }} /> Admin plantes
            </Link>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111', fontFamily: "'Poppins', sans-serif", margin: 0 }}>Consultations</h1>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total', value: stats.total, Icon: Stethoscope, bg: C.light, color: C.dark },
            { label: 'En attente', value: stats.en_attente, Icon: Clock, bg: '#FFF8E8', color: '#E65100' },
            { label: 'Traitées', value: stats.traitees, Icon: CheckCircle, bg: '#E8F5E9', color: '#1B5E20' },
          ].map(({ label, value, Icon, bg, color }) => (
            <div key={label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 16px rgba(22,101,52,0.05)' }}>
              <div style={{ width: 48, height: 48, background: bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: 22, height: 22, color }} />
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#111', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 13, color: C.text, marginTop: 4 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: C.white, borderRadius: 24, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(22,101,52,0.05)' }}>
          {!consultations || consultations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: C.text }}>
              <Stethoscope style={{ width: 40, height: 40, color: '#D0D0D0', margin: '0 auto 12px' }} />
              <p>Aucune consultation reçue pour le moment.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#F9FBF9', borderBottom: `1px solid ${C.border}` }}>
                <tr>
                  {['Date', 'Utilisateur', 'Symptômes', 'Durée', 'Statut', 'Action'].map(h => (
                    <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {consultations.map((c, i) => {
                  const status = STATUS_LABELS[c.status] ?? STATUS_LABELS.en_attente
                  return (
                    <tr key={c.id} style={{ borderBottom: i < consultations.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: C.text, whiteSpace: 'nowrap' }}>
                        {new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: '#333' }}>
                        {(c.profiles as { display_name: string | null } | null)?.display_name ?? 'Utilisateur'}
                        {c.age ? <span style={{ color: C.text }}> · {c.age} ans</span> : ''}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: '#444', maxWidth: 280 }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {c.symptoms_description}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: 13, color: C.text }}>
                        {c.duration?.replace(/_/g, ' ') ?? '—'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ height: 26, padding: '0 10px', background: status.bg, borderRadius: 8, fontSize: 12, fontWeight: 600, color: status.color, display: 'inline-flex', alignItems: 'center' }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <Link href={`/admin/consultations/${c.id}`}
                          style={{ height: 34, padding: '0 14px', background: C.light, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.dark, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Eye style={{ width: 14, height: 14 }} /> Voir
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
    </div>
  )
}
