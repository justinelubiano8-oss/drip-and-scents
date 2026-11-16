// Ise-save ang cart at wishlist sa localStorage para hindi mawala pag nag-refresh.
// .client.ts = tumatakbo lang sa browser, hindi sa server.
import type { CartItem, Product } from '~/types'

const CART_KEY = 'shop-cart-v2' // v2: may variant na ang bawat item
const WISHLIST_KEY = 'shop-wishlist'

export default defineNuxtPlugin(() => {
  const cart = useState<CartItem[]>('cart-items', () => [])
  const wishlist = useState<Product[]>('wishlist', () => [])

  try {
    localStorage.removeItem('shop-cart') // lumang format, hindi na gagamitin
    const savedCart = localStorage.getItem(CART_KEY)
    const savedWishlist = localStorage.getItem(WISHLIST_KEY)
    if (savedCart) cart.value = JSON.parse(savedCart)
    if (savedWishlist) wishlist.value = JSON.parse(savedWishlist)
  } catch {
    // sirang data sa storage — balewalain
  }

  watch(cart, (v) => localStorage.setItem(CART_KEY, JSON.stringify(v)), { deep: true })
  watch(wishlist, (v) => localStorage.setItem(WISHLIST_KEY, JSON.stringify(v)), { deep: true })
})
