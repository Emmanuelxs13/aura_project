import { useState, useEffect } from 'react'
import { products as productsApi } from '../services/api'
import ProductCard from '../components/ProductCard'

const FILTERS = [
  { value: 'all', label: 'Todos', color: 'bg-accent text-white' },
  { value: 'Accessories', label: 'Accesorios', color: 'bg-amber-100 text-amber-700' },
  { value: 'Audio', label: 'Audio', color: 'bg-green-100 text-green-700' },
  { value: 'Displays', label: 'Pantallas', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'iPad', label: 'iPad', color: 'bg-purple-100 text-purple-700' },
]
const ACCESSORY_CATEGORIES = ['Accessories', 'Audio', 'Displays', 'iPad']

export default function Accesorios() {
  const [products, setProducts] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = activeFilter === 'all' ? {} : { category: activeFilter }
    productsApi.getAll(params)
      .then(({ data }) => {
        if (activeFilter === 'all') {
          setProducts((data.products || []).filter(p => ACCESSORY_CATEGORIES.includes(p.category)))
        } else {
          setProducts(data.products || [])
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [activeFilter])

  return (
    <div>
      <section className="bg-gradient-to-br from-amber-500 to-amber-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Accesorios</h1>
          <p className="text-amber-100 text-lg max-w-xl">Complementa tu equipo. Audifonos, pantallas, teclados y mas.</p>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button key={f.value} onClick={() => setActiveFilter(f.value)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeFilter === f.value ? f.color : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-[380px]" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No hay productos en esta categoria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
