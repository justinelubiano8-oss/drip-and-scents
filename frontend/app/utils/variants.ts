// Mga pagpipilian (variants) ayon sa category ng product.
// Perfume -> 50 ml / 100 ml, Shoes -> EU size 40 hanggang 45, Clothes -> S / M / L / XL, Bag -> wala.
export interface VariantConfig {
  label: string
  options: string[]
}

export const variantConfig = (category?: string | null): VariantConfig | null => {
  const c = (category || '').toLowerCase()
  if (c.includes('perfume') || c.includes('fragrance')) {
    return { label: 'Size', options: ['50 ml', '100 ml'] }
  }
  if (c.includes('shoe') || c.includes('sneaker') || c.includes('footwear')) {
    return { label: 'Size (EU)', options: ['40', '41', '42', '43', '44', '45'] }
  }
  if (c.includes('cloth') || c.includes('apparel') || c.includes('shirt') || c.includes('hoodie')) {
    return { label: 'Size', options: ['S', 'M', 'L', 'XL'] }
  }
  // Bag at iba pa: walang size
  return null
}

// Natatanging key ng isang cart line: product + napiling variant
export const cartKey = (documentId: string, variant?: string | null) =>
  variant ? `${documentId}|${variant}` : documentId
