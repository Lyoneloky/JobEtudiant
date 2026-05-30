export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Plant {
  id: string
  name: string
  latin_name: string | null
  description: string
  properties: string[]
  usage: string | null
  contraindications: string | null
  dosage: string | null
  image_url: string | null
  category_id: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  categories?: Category | null
}

export interface Favorite {
  id: string
  user_id: string
  plant_id: string
  created_at: string
  plants?: Plant
}

export interface PlantFormData {
  name: string
  latin_name: string
  description: string
  properties: string
  usage: string
  contraindications: string
  dosage: string
  image_url: string
  category_id: string
  is_published: boolean
}
