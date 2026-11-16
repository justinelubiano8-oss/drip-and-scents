export interface StrapiImage {
  id: number
  documentId?: string
  url: string
  alternativeText?: string | null
}

// Strapi 5: flat ang response (wala nang "attributes"), at gumagamit ng documentId
export interface Product {
  id: number
  documentId: string
  name: string
  description?: string | null
  price: number
  stock: number
  category: string
  isActive: boolean
  image?: StrapiImage | null
}

export interface ProductInput {
  name: string
  description: string
  price: number
  stock: number
  category: string
  isActive: boolean
  image?: number | null // media id galing sa /api/upload
}

export interface StrapiList<T> {
  data: T[]
  meta: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } }
}

export interface StrapiSingle<T> {
  data: T
}

export interface CartItem {
  key: string           // documentId + variant (hal. "abc123|100 ml")
  documentId: string
  name: string
  category: string
  variant: string | null // "50 ml", "100 ml", "42" ... o null kung walang variant
  price: number
  imageUrl: string
  stock: number         // huling alam na stock ng PRODUCT galing Strapi
  quantity: number
}
