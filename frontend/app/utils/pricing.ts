// Presyo ayon sa size, at delivery fee.
// Ang presyo sa Strapi ang presyo ng pinakamaliit na size (50 ml / anumang shoe size).

// Gaano kamahal ang mas malaking size kumpara sa base price
const PRICE_MULTIPLIER: Record<string, number> = {
  '100 ml': 1.6 // 100 ml = 60% na mas mahal kaysa 50 ml
}

export const priceFor = (basePrice: number, variant?: string | null) => {
  const base = Number(basePrice) || 0
  const m = variant ? PRICE_MULTIPLIER[variant] ?? 1 : 1
  if (m === 1) return base
  return Math.round((base * m) / 50) * 50 // i-round sa pinakamalapit na ₱50
}

// true kung may size na iba ang presyo (hal. perfume)
export const hasPriceRange = (options: string[] = []) =>
  options.some((o) => (PRICE_MULTIPLIER[o] ?? 1) !== 1)

export const FREE_DELIVERY_MIN = 5000
export const DELIVERY_FEE = 150

export const deliveryFeeFor = (subtotal: number) =>
  subtotal <= 0 || subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE
