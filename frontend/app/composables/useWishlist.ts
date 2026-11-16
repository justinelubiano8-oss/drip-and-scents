import type { Product } from '~/types'

export const useWishlist = () => {
  const wishlist = useState<Product[]>('wishlist', () => [])

  const isWished = (documentId: string) => wishlist.value.some((p) => p.documentId === documentId)

  // Add kung wala pa, remove kung nandoon na
  function toggleWishlist(product: Product): boolean {
    if (isWished(product.documentId)) {
      wishlist.value = wishlist.value.filter((p) => p.documentId !== product.documentId)
      return false
    }
    wishlist.value.push(product)
    return true
  }

  function removeFromWishlist(documentId: string) {
    wishlist.value = wishlist.value.filter((p) => p.documentId !== documentId)
  }

  return { wishlist, isWished, toggleWishlist, removeFromWishlist }
}
