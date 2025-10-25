// src/types/searchAnalytics.ts

export interface SearchAnalytic {
  id: string
  search_term: string
  search_type: 'category' | 'complex' | 'general'
  result_count: number
  searched_at: string
  created_at: string
}

export interface PopularSearch {
  id: string
  search_term: string
  search_type: 'category' | 'complex' | 'general'
  total_searches: number
  last_searched_at: string
  created_at: string
  updated_at: string
  icon?: string
}

export type SearchType = 'category' | 'complex' | 'general'
