// src/types/index.ts
export interface Professional {
  id: string
  name: string
  email: string
  phone: string
  category: string
  description?: string
  address: string
  city: string
  state?: string
  zip_code?: string
  price_range: string
  is_active: boolean
  created_at?: string
  photos?: ProfessionalPhoto[]
}

export interface ProfessionalPhoto {
  id: string
  professional_id?: string // ✅ CORRIGIDO: Agora é opcional
  photo_url: string
  is_primary: boolean
  order_index?: number
}

export interface SearchParams {
  query?: string
  category?: string
  city?: string
  priceRange?: string
}

export interface ProfileView {
  id: string
  professional_id: string
  viewer_ip?: string
  viewed_at: string
}

export interface WhatsAppClick {
  id: string
  professional_id: string
  clicked_at: string
}
