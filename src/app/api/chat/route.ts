import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type Plant = {
  name: string
  latin_name: string | null
  description: string
  properties: string[]
  preparation: string | null
  usage: string | null
  contraindications: string | null
  plant_symptoms: { symptoms: { name: string } | null }[]
}

type Tip = { title: string; content: string; plant_name: string | null; category: string | null; warning: string | null }
type GlossaryEntry = { term: string; definition: string }

function norm(text: string): string {
  return (text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
}

// Mots-clés symptômes courants en français
const SYMPTOM_KEYWORDS: Record<string, string[]> = {
  'fièvre':      ['fievre', 'temperature', 'chaud', 'chaleur', 'grippe', 'paludisme', 'malaria', 'palu', 'feverish'],
  'maux de tête':['tete', 'cephalee', 'migraine', 'mal de tete', 'mal a la tete', 'head'],
  'diarrhée':    ['diarrhee', 'ventre', 'intestin', 'selles', 'intestinal', 'digestion', 'stomach'],
  'insomnie':    ['sommeil', 'dormir', 'nuit', 'insomnie', 'reveille', 'sleep'],
  'peau':        ['peau', 'brulure', 'coupure', 'plaie', 'eczema', 'acne', 'bouton', 'cicatrice', 'dermato'],
  'toux':        ['toux', 'gorge', 'rhume', 'bronchite', 'respiration', 'poumon', 'mucus'],
  'douleur':     ['douleur', 'crampe', 'articulation', 'muscle', 'dos', 'rhumatisme'],
  'stress':      ['stress', 'anxiete', 'angoisse', 'nervosite', 'calme', 'detente', 'relaxation'],
  'nutrition':   ['nutrition', 'malnutrition', 'vitamine', 'energie', 'fatigue', 'immunite', 'immuniser'],
  'paludisme':   ['paludisme', 'malaria', 'palu', 'moustique', 'antiparasitaire'],
  'diabète':     ['diabete', 'sucre', 'glycemie', 'insuline'],
  'tension':     ['tension', 'hypertension', 'pression', 'cardiovasculaire', 'coeur'],
  'asthme':      ['asthme', 'bronche', 'souffle', 'respire'],
}

function detectSymptoms(msg: string): string[] {
  const m = norm(msg)
  return Object.entries(SYMPTOM_KEYWORDS)
    .filter(([, kws]) => kws.some(k => m.includes(k)))
    .map(([sym]) => sym)
}

function scorePlant(plant: Plant, msgNorm: string, symptoms: string[]): number {
  let s = 0
  if (msgNorm.includes(norm(plant.name))) s += 12
  if (plant.latin_name && msgNorm.includes(norm(plant.latin_name))) s += 8

  const plantSymptomNames = plant.plant_symptoms.map(ps => ps.symptoms?.name ?? '')

  for (const sym of symptoms) {
    for (const ps of plantSymptomNames) {
      if (norm(ps).includes(norm(sym)) || norm(sym).includes(norm(ps).substring(0, 5))) s += 4
    }
    if (norm(plant.description).includes(norm(sym))) s += 2
    if ((plant.properties ?? []).some(p => norm(p).includes(norm(sym)))) s += 2
    if (plant.usage && norm(plant.usage).includes(norm(sym))) s += 2
  }

  const words = msgNorm.split(/\s+/).filter(w => w.length > 4)
  for (const w of words) {
    if (norm(plant.description).includes(w)) s += 1
    if ((plant.properties ?? []).some(p => norm(p).includes(w))) s += 1
    if (plantSymptomNames.some(ps => norm(ps).includes(w))) s += 2
  }
  return s
}

function formatPlant(plant: Plant): string {
  const symptomNames = plant.plant_symptoms.map(ps => ps.symptoms?.name).filter(Boolean)
  let r = `**${plant.name}**`
  if (plant.latin_name) r += ` *(${plant.latin_name})*`
  r += `\n\n${plant.description}`
  if ((plant.properties ?? []).length > 0) {
    r += `\n\n🌿 **Propriétés :** ${plant.properties.join(', ')}`
  }
  if (symptomNames.length > 0) {
    r += `\n\n💊 **Indiqué pour :** ${symptomNames.join(', ')}`
  }
  if (plant.preparation) {
    r += `\n\n📋 **Préparation :** ${plant.preparation}`
  }
  if (plant.contraindications) {
    r += `\n\n⚠️ **Précautions :** ${plant.contraindications}`
  }
  return r
}

export async function POST(req: NextRequest) {
  try {
    const { message } = (await req.json()) as { message: string }
    if (!message?.trim()) {
      return NextResponse.json({ response: 'Veuillez écrire un message.' })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      return NextResponse.json({ response: 'Service temporairement indisponible.' })
    }

    const adminClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const [{ data: plantsRaw }, { data: tipsRaw }, { data: glossaryRaw }] = await Promise.all([
      adminClient
        .from('plants')
        .select('name, latin_name, description, properties, preparation, usage, contraindications, plant_symptoms(symptoms(name))')
        .eq('is_published', true),
      adminClient
        .from('tips')
        .select('title, content, plant_name, category, warning')
        .order('created_at', { ascending: false })
        .limit(30),
      adminClient.from('glossary').select('term, definition').limit(80),
    ])

    const plants  = (plantsRaw  ?? []) as unknown as Plant[]
    const tips    = (tipsRaw    ?? []) as Tip[]
    const glossary = (glossaryRaw ?? []) as GlossaryEntry[]

    const msgNorm  = norm(message)
    const symptoms = detectSymptoms(message)

    /* ── Salutation ── */
    if (/^(bonjour|salut|hello|bonsoir|hi|hey|coucou|salam|bonne journee)/.test(msgNorm)) {
      return NextResponse.json({
        response: `Bonjour ! Je suis **TerraBio Assistant** 🌿\n\nJe peux vous aider à :\n• Trouver une plante pour vos symptômes (ex: *"j'ai de la fièvre"*)\n• Obtenir des infos sur une plante (ex: *"parle-moi du neem"*)\n• Répondre à vos questions sur la phytothérapie\n\nQue puis-je faire pour vous ?`,
      })
    }

    /* ── Consultation ── */
    if (/consultation|herboriste|rendez.vous|rdv|prendre contact|voir un|docteur|medecin/.test(msgNorm)) {
      return NextResponse.json({
        response: `Pour une **consultation personnalisée** avec un herboriste certifié TerraBio :\n\n👉 Rendez-vous sur la page [Consultation](/consultation)\n\nVous décrirez vos symptômes et choisirez l'herboriste de votre choix. Une réponse personnalisée vous sera envoyée.`,
      })
    }

    /* ── Catalogue ── */
    if (/quelles? plantes?|liste|catalogue|plantes? disponibles?|voir les plantes|combien|nombre de plantes/.test(msgNorm)) {
      const names = plants.slice(0, 10).map(p => `• **${p.name}**`).join('\n')
      return NextResponse.json({
        response: `Notre catalogue contient **${plants.length} plantes médicinales** :\n\n${names}\n\n...et plus encore. Visitez notre [catalogue complet](/plantes) ou posez-moi une question sur un symptôme précis !`,
      })
    }

    /* ── Merci / au revoir ── */
    if (/merci|thank|aurevoir|a bientot|bye|super|parfait|excellent|genial/.test(msgNorm)) {
      return NextResponse.json({
        response: `Avec plaisir ! 🌿 N'hésitez pas à revenir si vous avez d'autres questions.\n\nPour un suivi personnalisé, pensez à consulter un de nos herboristes sur la page [Consultation](/consultation).`,
      })
    }

    /* ── Glossaire ── */
    if (/glossaire|definition|qu.?est.ce que|signifie|kesako|sens de|que veut dire/.test(msgNorm)) {
      const words = msgNorm.split(/\s+/).filter(w => w.length > 3)
      const match = glossary.find(g =>
        words.some(w => norm(g.term).includes(w) || w.includes(norm(g.term).substring(0, 5)))
      )
      if (match) {
        return NextResponse.json({ response: `**${match.term}**\n\n${match.definition}` })
      }
    }

    /* ── Plante nommée ── */
    const namedPlant = plants.find(
      p => msgNorm.includes(norm(p.name)) ||
           (p.latin_name && msgNorm.includes(norm(p.latin_name)))
    )
    if (namedPlant) {
      return NextResponse.json({ response: formatPlant(namedPlant) })
    }

    /* ── Symptômes détectés ── */
    if (symptoms.length > 0) {
      const scored = plants
        .map(p => ({ plant: p, score: scorePlant(p, msgNorm, symptoms) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

      if (scored.length > 0) {
        if (scored.length === 1 || scored[0].score >= 10) {
          return NextResponse.json({ response: formatPlant(scored[0].plant) })
        }
        let resp = `Pour **${symptoms.join(', ')}**, voici ${scored.length} plantes recommandées :\n\n`
        for (const { plant } of scored) {
          const syms = plant.plant_symptoms.map(ps => ps.symptoms?.name).filter(Boolean)
          resp += `🌱 **${plant.name}**\n${plant.description.substring(0, 120)}...\n`
          if (syms.length) resp += `*Indiqué pour : ${syms.slice(0, 3).join(', ')}*\n`
          resp += '\n'
        }
        resp += `Voulez-vous plus de détails sur l'une de ces plantes ?`
        return NextResponse.json({ response: resp })
      }
    }

    /* ── Recherche générale ── */
    const scored = plants
      .map(p => ({ plant: p, score: scorePlant(p, msgNorm, symptoms) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)

    if (scored.length > 0) {
      return NextResponse.json({ response: formatPlant(scored[0].plant) })
    }

    /* ── Conseils (tips) ── */
    const tipMatch = tips.find(t => {
      const txt = norm(`${t.title} ${t.content} ${t.plant_name ?? ''} ${t.category ?? ''}`)
      return msgNorm.split(/\s+/).filter(w => w.length > 4).some(w => txt.includes(w))
    })
    if (tipMatch) {
      let resp = `**${tipMatch.title}**\n\n${tipMatch.content}`
      if (tipMatch.plant_name) resp += `\n\n🌿 Plante : ${tipMatch.plant_name}`
      if (tipMatch.warning) resp += `\n\n⚠️ ${tipMatch.warning}`
      return NextResponse.json({ response: resp })
    }

    /* ── Fallback ── */
    return NextResponse.json({
      response: `Je n'ai pas trouvé d'information précise pour votre demande.\n\nEssayez :\n• Un symptôme : *"j'ai de la fièvre"*, *"mal au ventre"*, *"problème de sommeil"*\n• Une plante : *"parle-moi du moringa"*, *"propriétés du neem"*\n• Une consultation : *"je veux voir un herboriste"*`,
    })

  } catch (err) {
    console.error('[/api/chat]', err)
    return NextResponse.json({ response: 'Une erreur est survenue. Veuillez réessayer.' })
  }
}
