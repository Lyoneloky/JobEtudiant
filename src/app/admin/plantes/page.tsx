import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Plant } from '@/lib/types'
import DeletePlantButton from './DeletePlantButton'

export default async function AdminPlantesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: plants } = await supabase
    .from('plants')
    .select('*, categories(id, name, slug)')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des plantes</h1>
          <p className="text-gray-500 text-sm mt-1">{plants?.length ?? 0} plante(s) au total</p>
        </div>
        <Link
          href="/admin/plantes/nouveau"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" /> Nouvelle plante
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {plants && plants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plante</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Catégorie</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Propriétés</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(plants as Plant[]).map(plant => (
                  <tr key={plant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{plant.name}</p>
                        {plant.latin_name && <p className="text-xs text-gray-400 italic">{plant.latin_name}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {plant.categories?.name ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {plant.properties?.slice(0, 2).map((p, i) => (
                          <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                            {p}
                          </span>
                        ))}
                        {(plant.properties?.length ?? 0) > 2 && (
                          <span className="text-xs text-gray-400">+{plant.properties.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {plant.is_published ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <Eye className="w-3.5 h-3.5" /> Publié
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                          <EyeOff className="w-3.5 h-3.5" /> Brouillon
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/plantes/${plant.id}`}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/plantes/${plant.id}/modifier`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeletePlantButton plantId={plant.id} plantName={plant.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">Aucune plante dans le catalogue.</p>
            <Link
              href="/admin/plantes/nouveau"
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Ajouter la première plante
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
