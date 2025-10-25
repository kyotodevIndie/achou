// src/types/index.ts - Interfaces completas
export interface ProfessionalPhoto {
  id: string
  photo_url: string
  is_primary: boolean
  order_index?: number
}

export interface Professional {
  id: string
  name: string
  email: string
  phone: string
  category: string
  specialty?: string
  description?: string
  address: string
  complex_name?: string
  city: string
  neighborhood?: string // ← NOVO
  average_rating?: number
  state?: string
  zip_code?: string
  latitude?: number // ← NOVO
  longitude?: number // ← NOVO
  price_range: string
  response_time?: 'fast' | 'medium' | 'slow' // ← NOVO
  accepts_urgent?: boolean // ← NOVO
  verified?: boolean // ← NOVO
  is_active: boolean
  subscription_status?: string
  created_at?: string
  updated_at?: string
  photos?: ProfessionalPhoto[]
  distance?: number // ← Calculado dinamicamente
  rating?: number
  review_count?: number
}

export interface AdvancedSearchParams {
  query?: string
  categories: string[]
  specialties: string[]
  priceMin: number
  priceMax: number
  cities: string[]
  neighborhoods: string[]
  hasPhotos: boolean
  responseTime: ('fast' | 'medium' | 'slow')[]
  acceptsUrgent?: boolean
  verified?: boolean
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'distance' | 'newest'
  userLocation?: {
    latitude: number
    longitude: number
  }
  maxDistance?: number // em KM
}

// Para compatibilidade
export interface SearchParams {
  query?: string
  category?: string
  city?: string
  complex?: string
}

export interface User {
  id: string
  email: string
  name?: string
  created_at: string
}

export interface UserLocation {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: number
}

// Categorias expandidas
export const CATEGORIES = [
  { value: 'dentista', label: 'Dentista', icon: '🦷' },
  { value: 'medico', label: 'Médico', icon: '👨‍⚕️' },
  { value: 'psicologo', label: 'Psicólogo', icon: '🧠' },
  { value: 'nutricionista', label: 'Nutricionista', icon: '🥗' },
  { value: 'fisioterapeuta', label: 'Fisioterapeuta', icon: '💪' },

  { value: 'advogado', label: 'Advogado', icon: '⚖️' },
  { value: 'despachante', label: 'Despachante', icon: '📋' },

  { value: 'contador', label: 'Contador', icon: '💼' },
  { value: 'consultor-financeiro', label: 'Consultor Financeiro', icon: '💰' },

  { value: 'arquiteto', label: 'Arquiteto', icon: '🏗️' },
  { value: 'engenheiro', label: 'Engenheiro Civil', icon: '👷‍♂️' },
  { value: 'designer', label: 'Designer de Interiores', icon: '🎨' },

  { value: 'esteticista', label: 'Esteticista', icon: '💅' },
  { value: 'dermatologista', label: 'Dermatologista', icon: '👩‍⚕️' },

  { value: 'professor', label: 'Professor Particular', icon: '📚' },
  { value: 'psicopedagogo', label: 'Psicopedagogo', icon: '🎓' },

  { value: 'consultor-ti', label: 'Consultor TI', icon: '💻' },
  { value: 'desenvolvedor', label: 'Desenvolvedor', icon: '⌨️' },

  { value: 'coach', label: 'Coach', icon: '🎯' },
  { value: 'consultor-rh', label: 'Consultor RH', icon: '👥' },
] as const

export type CategoryValue = (typeof CATEGORIES)[number]['value']

// Bairros principais de Fortaleza
export const NEIGHBORHOODS_FORTALEZA = [
  'Aldeota',
  'Centro',
  'Meireles',
  'Cocó',
  'Papicu',
  'Iracema',
  'Dionísio Torres',
  'Joaquim Távora',
  'Varjota',
  'Mucuripe',
  'Benfica',
  'Fatima',
  'Montese',
  'Parangaba',
] as const

// Faixas de preço mais granulares
export const PRICE_RANGES = [
  { value: '0-50', label: 'Até R$ 50', min: 0, max: 50 },
  { value: '50-100', label: 'R$ 50 - R$ 100', min: 50, max: 100 },
  { value: '100-150', label: 'R$ 100 - R$ 150', min: 100, max: 150 },
  { value: '150-200', label: 'R$ 150 - R$ 200', min: 150, max: 200 },
  { value: '200-300', label: 'R$ 200 - R$ 300', min: 200, max: 300 },
  { value: '300-400', label: 'R$ 300 - R$ 400', min: 300, max: 400 },
  { value: '400-500', label: 'R$ 400 - R$ 500', min: 400, max: 500 },
  { value: '500+', label: 'Acima de R$ 500', min: 500, max: 999999 },
] as const
