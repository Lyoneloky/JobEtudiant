'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import type { Category, Plant } from '@/lib/types'

interface PlantFormProps {
  categories: Category[]
  plant?: Plant
}

export default function PlantForm({ categories, plant }: PlantFormProps) {
  const isEdit = !!plant
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: plant?.name ?? '',
    latin_name: plant?.latin_name ?? '',
    description: plant?.description ?? '',
    properties: plant?.properties?.join(', ') ?? '',
    usage: plant?.usage ?? '',
    contraindications: plant?.contraindications ?? '',
    dosage: plant?.dosage ?? '',
    image_url: plant?.image_url ?? '',
    category_id: plant?.category_id ?? '',
    is_published: plant?.is_published ?? true,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      name: form.name.trim(),
      latin_name: form.latin_name.trim() || null,
      description: form.description.trim(),
      properties: form.properties ? form.properties.split(',').map(p => p.trim()).filter(Boolean) : [],
      usage: form.usage.trim() || null,
      contraindications: form.contraindications.trim() || null,
      dosage: form.dosage.trim() || null,
      image_url: form.image_url.trim() || null,
      category_id: form.category_id || null,
      is_published: form.is_published,
      updated_at: new Date().toISOString(),
    }

    if (isEdit) {
      const { error } = await supabase.from('plants').update(payload).eq('id', plant.id)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase.from('plants').insert(payload)
      if (error) { setError(error.message); setLoading(false); return }
    }

    router.push('/admin/plantes')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Link href="/admin/plantes" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-700 text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour à la liste
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-gray-700 border-b border-gray-100 pb-3">Informations générales</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom commun <span className="text-red-500">*</span></label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="ex. Camomille"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom latin</label>
            <input
              name="latin_name"
              value={form.latin_name}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="ex. Matricaria chamomilla"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Aucune catégorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Description générale de la plante..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Propriétés thérapeutiques
            <span className="text-gray-400 font-normal ml-1">(séparées par des virgules)</span>
          </label>
          <input
            name="properties"
            value={form.properties}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="ex. Anti-inflammatoire, Digestif, Calmant"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL de l&apos;image</label>
          <input
            name="image_url"
            type="url"
            value={form.image_url}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-gray-700 border-b border-gray-100 pb-3">Usages et précautions</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usages et préparations</label>
          <textarea
            name="usage"
            value={form.usage}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Infusion, décoction, teinture mère..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dosage recommandé</label>
          <textarea
            name="dosage"
            value={form.dosage}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="ex. 1 à 3 tasses par jour, cure de 3 semaines maximum..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-amber-700">
            ⚠️ Contre-indications et précautions
          </label>
          <textarea
            name="contraindications"
            value={form.contraindications}
            onChange={handleChange}
            rows={4}
            className="w-full border border-amber-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            placeholder="Grossesse, allaitement, interactions médicamenteuses..."
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_published"
            checked={form.is_published}
            onChange={handleChange}
            className="w-4 h-4 accent-green-600"
          />
          <span className="text-sm font-medium text-gray-700">Publier sur le catalogue</span>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer la plante'}
        </button>
        <Link
          href="/admin/plantes"
          className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium text-center"
        >
          Annuler
        </Link>
      </div>
    </form>
  )
}
