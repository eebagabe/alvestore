export type Category = 'Eletrônicos' | 'Casa' | 'Moda Praia' | 'Acessórios' | 'Beleza'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: Category
  image: string
}

// Mock até integrar com backend
export const products: Product[] = [
  {
    id: 'p1',
    name: 'Fone Bluetooth Pro',
    description: 'Cancelamento de ruído, 30h de bateria.',
    price: 189.9,
    stock: 24,
    category: 'Eletrônicos',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=70',
  },
  {
    id: 'p2',
    name: 'Smartwatch Fit',
    description: 'Monitor cardíaco, GPS e resistente à água.',
    price: 299.0,
    stock: 8,
    category: 'Eletrônicos',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=70',
  },
  {
    id: 'p3',
    name: 'Canga Pajuçara',
    description: 'Canga estampada, ideal para as praias de Maceió.',
    price: 49.9,
    stock: 52,
    category: 'Moda Praia',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=70',
  },
  {
    id: 'p4',
    name: 'Óculos de Sol UV400',
    description: 'Proteção UV total, armação leve.',
    price: 89.9,
    stock: 3,
    category: 'Acessórios',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=70',
  },
  {
    id: 'p5',
    name: 'Garrafa Térmica 1L',
    description: 'Mantém gelado por 24h. Perfeita pro calor alagoano.',
    price: 79.9,
    stock: 0,
    category: 'Casa',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=70',
  },
  {
    id: 'p6',
    name: 'Protetor Solar FPS 70',
    description: 'Resistente à água, toque seco.',
    price: 59.9,
    stock: 31,
    category: 'Beleza',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=70',
  },
  {
    id: 'p7',
    name: 'Mochila Urbana',
    description: 'Compartimento para notebook 15.6".',
    price: 159.9,
    stock: 12,
    category: 'Acessórios',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=70',
  },
  {
    id: 'p8',
    name: 'Caixa de Som Portátil',
    description: 'À prova d’água, som 360°.',
    price: 219.9,
    stock: 5,
    category: 'Eletrônicos',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=70',
  },
  {
    id: 'p9',
    name: 'Perfume Brisa do Mar 100ml',
    description: 'Fragrância fresca e cítrica, inspirada no litoral alagoano.',
    price: 139.9,
    stock: 15,
    category: 'Beleza',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=70',
  },
  {
    id: 'p10',
    name: 'Caneca de Cerâmica 350ml',
    description: 'Cerâmica artesanal, pode ir ao micro-ondas.',
    price: 39.9,
    stock: 2,
    category: 'Casa',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=70',
  },
]

export const getProduct = (id: string) => products.find((p) => p.id === id)

export const LOW_STOCK_THRESHOLD = 5

export interface PriceRange {
  label: string
  min: number
  max: number
}

export const PRICE_RANGES: PriceRange[] = [
  { label: 'Até R$ 50', min: 0, max: 50 },
  { label: 'R$ 50 a R$ 100', min: 50, max: 100 },
  { label: 'R$ 100 a R$ 200', min: 100, max: 200 },
  { label: 'Acima de R$ 200', min: 200, max: Infinity },
]
