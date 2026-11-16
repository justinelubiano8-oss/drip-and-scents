// Lahat ng tawag sa Strapi REST API ay nandito para iisang lugar lang.
import type { Product, ProductInput, StrapiImage, StrapiList, StrapiSingle } from '~/types'

export const useStrapi = () => {
  const config = useRuntimeConfig()
  const baseURL = String(config.public.strapiUrl).replace(/\/$/, '')

  // $fetch instance na laging naka-prefix ang /api
  const api = $fetch.create({ baseURL: `${baseURL}/api` })

  // Relative ang image url ng Strapi (/uploads/...), kaya dinadagdagan ng base URL
  const mediaUrl = (image?: StrapiImage | null) => {
    if (!image?.url) return ''
    return image.url.startsWith('http') ? image.url : `${baseURL}${image.url}`
  }

  // GET /api/products?populate=image&filters[isActive][$eq]=true
  const getActiveProducts = () =>
    api<StrapiList<Product>>('/products', {
      query: {
        populate: 'image',
        'filters[isActive][$eq]': 'true',
        'pagination[pageSize]': 100,
        sort: 'name:asc'
      }
    })

  // Para sa Product Management: lahat (active at inactive)
  const getAllProducts = () =>
    api<StrapiList<Product>>('/products', {
      query: { populate: 'image', 'pagination[pageSize]': 100, sort: 'updatedAt:desc' }
    })

  const getProduct = (documentId: string) =>
    api<StrapiSingle<Product>>(`/products/${documentId}`, { query: { populate: 'image' } })

  // ---- PAGBABAGO SA DATA: dumadaan sa server ng Nuxt (/api/admin/...) ----
  // Doon lang nakatago ang secret na Strapi API token, at kailangang naka-login ang admin.
  const createProduct = (data: ProductInput) =>
    $fetch<StrapiSingle<Product>>('/api/admin/products', { method: 'POST', body: { data } })

  const updateProduct = (documentId: string, data: Partial<ProductInput>) =>
    $fetch<StrapiSingle<Product>>(`/api/admin/products/${documentId}`, { method: 'PUT', body: { data } })

  const deleteProduct = (documentId: string) =>
    $fetch(`/api/admin/products/${documentId}`, { method: 'DELETE' })

  // Image upload -> /api/admin/upload -> Strapi /api/upload
  const uploadImage = async (file: File) => {
    const form = new FormData()
    form.append('files', file)
    const res = await $fetch<StrapiImage[]>('/api/admin/upload', { method: 'POST', body: form })
    return res[0]?.id ?? null
  }

  // Ginagawang malinaw na mensahe ang error galing Strapi o sa server ng Nuxt
  const errorMessage = (err: any) =>
    err?.data?.error?.message ||
    err?.data?.statusMessage ||
    err?.statusMessage ||
    err?.message ||
    'Hindi ma-reach ang server. Siguraduhing tumatakbo ang Strapi.'

  return {
    baseURL, api, mediaUrl, errorMessage,
    getActiveProducts, getAllProducts, getProduct,
    createProduct, updateProduct, deleteProduct, uploadImage
  }
}
