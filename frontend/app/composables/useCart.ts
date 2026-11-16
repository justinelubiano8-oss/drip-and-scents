// Shopping cart state (shared sa buong app gamit ang useState)
// Bawat cart line = isang product + isang variant (size). Iisa ang stock ng product
// para sa lahat ng variant nito, kaya ang kabuuang quantity ay hindi pwedeng lumampas sa stock.
import type { CartItem, Product } from '~/types'

export const useCart = () => {
  const items = useState<CartItem[]>('cart-items', () => [])
  const drawer = useState<boolean>('cart-drawer', () => false)
  const { mediaUrl } = useStrapi()

  const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const totalAmount = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const lineSubtotal = (item: CartItem) => item.price * item.quantity

  // Kabuuang quantity ng isang PRODUCT sa cart (lahat ng variant)
  const quantityOf = (documentId: string) =>
    items.value.filter((i) => i.documentId === documentId).reduce((sum, i) => sum + i.quantity, 0)

  function addToCart(product: Product, qty = 1, variant: string | null = null): { ok: boolean; message: string } {
    if (!product.isActive) return { ok: false, message: `${product.name} is not available.` }
    if (product.stock <= 0) return { ok: false, message: `${product.name} is out of stock.` }

    const config = variantConfig(product.category)
    if (config && !variant) return { ok: false, message: 'Please choose a size first.' }

    if (quantityOf(product.documentId) + qty > product.stock) {
      return { ok: false, message: `Only ${product.stock} ${product.name} in stock.` }
    }

    const key = cartKey(product.documentId, variant)
    const existing = items.value.find((i) => i.key === key)
    const label = variant ? `${product.name} (${variant})` : product.name

    if (existing) {
      existing.quantity += qty
      existing.stock = product.stock
      existing.price = priceFor(product.price, variant)
    } else {
      items.value.push({
        key,
        documentId: product.documentId,
        name: product.name,
        category: product.category,
        variant,
        price: priceFor(product.price, variant),
        imageUrl: mediaUrl(product.image),
        stock: product.stock,
        quantity: qty
      })
    }
    return { ok: true, message: `${label} added to cart.` }
  }

  // Ilan pa ang pwedeng idagdag sa isang line, isinasaalang-alang ang ibang variant
  const maxFor = (item: CartItem) => item.stock - (quantityOf(item.documentId) - item.quantity)

  function updateQuantity(key: string, qty: number): { ok: boolean; message: string } {
    const item = items.value.find((i) => i.key === key)
    if (!item) return { ok: false, message: 'Item not found.' }
    if (qty < 1) return { ok: false, message: 'Minimum quantity is 1.' }
    if (qty > maxFor(item)) return { ok: false, message: `Only ${item.stock} in stock for all sizes combined.` }
    item.quantity = qty
    return { ok: true, message: '' }
  }

  function removeItem(key: string) {
    items.value = items.value.filter((i) => i.key !== key)
  }

  function clearCart() {
    items.value = []
  }

  // I-update ang stock/price ng cart items gamit ang pinakabagong data galing Strapi
  function syncStock(products: Product[]) {
    for (const item of items.value) {
      const p = products.find((x) => x.documentId === item.documentId)
      if (p) {
        item.stock = p.isActive ? p.stock : 0
        item.price = priceFor(p.price, item.variant)
      }
    }
  }

  return {
    items, drawer, totalItems, totalAmount, lineSubtotal, quantityOf, maxFor,
    addToCart, updateQuantity, removeItem, clearCart, syncStock
  }
}
