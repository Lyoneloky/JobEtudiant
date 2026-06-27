'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Leaf } from 'lucide-react'

const C = {
  dark:    '#166534',
  light:   '#dcfce7',
  primary: '#22c55e',
  bg:      '#F8FAF5',
  border:  '#E8EDE4',
  text:    '#616161',
}

type Msg = { role: 'user' | 'bot'; text: string }

const WELCOME: Msg = {
  role: 'bot',
  text: 'Bonjour ! Je suis **TerraBio Assistant** 🌿\n\nPosez-moi une question sur :\n• Vos symptômes (*"j\'ai de la fièvre"*)\n• Une plante (*"parle-moi du neem"*)\n• Nos conseils santé\n\nComment puis-je vous aider ?',
}

function renderText(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>
      }
      // Inline links [label](url)
      const segments: React.ReactNode[] = []
      const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g
      let last = 0
      let m: RegExpExecArray | null
      while ((m = linkRe.exec(part)) !== null) {
        if (m.index > last) segments.push(part.slice(last, m.index))
        segments.push(
          <a key={`${j}-${m.index}`} href={m[2]}
            style={{ color: C.dark, textDecoration: 'underline' }}>
            {m[1]}
          </a>
        )
        last = m.index + m[0].length
      }
      if (last < part.length) segments.push(part.slice(last))
      return segments.length > 0 ? <span key={j}>{segments}</span> : <span key={j}>{part}</span>
    })
    return (
      <div key={i} style={{ minHeight: line === '' ? 6 : undefined }}>
        {rendered}
      </div>
    )
  })
}

export default function ChatBot() {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState<Msg[]>([WELCOME])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text }])
    setLoading(true)
    try {
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json() as { response: string }
      setMessages(m => [...m, { role: 'bot', text: data.response ?? 'Désolé, une erreur est survenue.' }])
    } catch {
      setMessages(m => [...m, { role: 'bot', text: 'Impossible de joindre le serveur. Veuillez réessayer.' }])
    } finally {
      setLoading(false)
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send() }
  }

  return (
    <>
      <style>{`
        @keyframes tb-dot {
          0%,80%,100% { transform:translateY(0); opacity:.4; }
          40%          { transform:translateY(-5px); opacity:1; }
        }
        @keyframes tb-panel-in {
          from { opacity:0; transform:translateY(16px) scale(.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .tb-chat-btn:hover { transform:scale(1.07) !important; box-shadow:0 6px 28px rgba(22,101,52,.45) !important; }
        .tb-send-btn:not(:disabled):hover { background:${C.primary} !important; }
      `}</style>

      {/* ── Floating button ── */}
      <button
        className="tb-chat-btn"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Fermer le chatbot' : 'Ouvrir le chatbot'}
        title="TerraBio Assistant"
        style={{
          position:'fixed', bottom:28, right:28, zIndex:1000,
          width:58, height:58, borderRadius:'50%',
          background:C.dark, border:'none', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 22px rgba(22,101,52,.35)',
          transition:'transform .15s, box-shadow .15s',
        }}
      >
        {open
          ? <X           style={{ width:24, height:24, color:'#fff' }} />
          : <MessageSquare style={{ width:24, height:24, color:'#fff' }} />
        }
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div style={{
          position:'fixed', bottom:100, right:28, zIndex:999,
          width:360, height:530,
          maxWidth:'calc(100vw - 40px)',
          maxHeight:'calc(100vh - 120px)',
          background:'#fff', borderRadius:22,
          boxShadow:'0 8px 48px rgba(0,0,0,.16)',
          display:'flex', flexDirection:'column', overflow:'hidden',
          animation:'tb-panel-in .2s ease',
        }}>

          {/* Header */}
          <div style={{ background:`linear-gradient(135deg, ${C.dark}, #1a7a40)`, padding:'14px 18px', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Leaf style={{ width:18, height:18, color:'#fff' }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#fff', fontFamily:"'Poppins',sans-serif" }}>
                TerraBio Assistant
              </div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.7)' }}>
                Plantes médicinales du Cameroun
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80' }} />
              <span style={{ fontSize:11, color:'rgba(255,255,255,.7)' }}>En ligne</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'14px 12px 8px', display:'flex', flexDirection:'column', gap:10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display:'flex', justifyContent:msg.role==='user' ? 'flex-end' : 'flex-start', alignItems:'flex-start', gap:8 }}>

                {msg.role === 'bot' && (
                  <div style={{ width:28, height:28, borderRadius:'50%', background:C.light, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                    <Leaf style={{ width:13, height:13, color:C.dark }} />
                  </div>
                )}

                <div style={{
                  maxWidth:'80%',
                  padding:'10px 13px',
                  borderRadius: msg.role==='user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role==='user' ? C.dark : C.bg,
                  color:       msg.role==='user' ? '#fff' : '#222',
                  fontSize:13, lineHeight:'20px',
                  border: msg.role==='bot' ? `1px solid ${C.border}` : 'none',
                }}>
                  {renderText(msg.text)}
                </div>

              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:C.light, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Leaf style={{ width:13, height:13, color:C.dark }} />
                </div>
                <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:'18px 18px 18px 4px', padding:'12px 16px', display:'flex', gap:5, alignItems:'center' }}>
                  {[0, 1, 2].map(n => (
                    <div key={n} style={{
                      width:7, height:7, borderRadius:'50%', background:C.dark,
                      animation:`tb-dot 1.2s ease-in-out ${n * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding:'10px 12px 12px', borderTop:`1px solid ${C.border}`, display:'flex', gap:8, alignItems:'flex-end', flexShrink:0 }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Décrivez vos symptômes… (Entrée pour envoyer)"
              rows={1}
              style={{
                flex:1, resize:'none',
                border:`1.5px solid ${C.border}`, borderRadius:12,
                padding:'10px 12px', fontSize:13,
                fontFamily:'"Inter",Arial,sans-serif',
                outline:'none', background:C.bg, color:'#222',
                lineHeight:'18px', maxHeight:80, overflowY:'auto',
                transition:'border-color .15s',
              }}
              onFocus={e => { e.target.style.borderColor = C.primary }}
              onBlur={e  => { e.target.style.borderColor = C.border  }}
            />
            <button
              className="tb-send-btn"
              onClick={() => void send()}
              disabled={!input.trim() || loading}
              title="Envoyer"
              style={{
                width:40, height:40, borderRadius:12, border:'none', flexShrink:0,
                background: (!input.trim() || loading) ? '#E0E0E0' : C.dark,
                cursor:     (!input.trim() || loading) ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'background .15s',
              }}
            >
              <Send style={{ width:16, height:16, color: (!input.trim() || loading) ? '#9E9E9E' : '#fff' }} />
            </button>
          </div>

        </div>
      )}
    </>
  )
}
