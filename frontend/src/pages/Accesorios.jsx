import { useState, useEffect } from 'react'
import { products as productsApi } from '../services/api'
import ProductCard from '../components/ProductCard'

const ACCESSORY_CATEGORIES = ['Accessories', 'Audio', 'Displays', 'iPad']

export default function Accesorios() {
  const [products, setProducts] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const fetchProducts = (filter) => {
    setLoading(true)
    const params = filter === 'all' ? {} : { category: filter }
    productsApi.getAll(params)
      .then(({ data }) => {
        if (filter === 'all') {
          setProducts(data.products.filter(p => ACCESSORY_CATEGORIES.includes(p.category)))
        } else {
          setProducts(data.products)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts(activeFilter)
  }, [activeFilter])

  const filters = [
    { value: 'all', label: 'Todos' },
    { value: 'Accessories', label: 'Accesorios' },
    { value: 'Audio', label: 'Audio' },
    { value: 'Displays', label: 'Pantallas' },
    { value: 'iPad', label: 'iPad' },
  ]

  return (
    <div>
      <section className="bg-gradient-to-r from-accent/10 to-secondary/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Accesorios</h1>
          <p className="text-lg text-gray-600">Complementa tu equipo. Audifonos, pantallas, teclados y mas.</p>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {filters.map(f => (
              <button key={f.value} onClick={() => setActiveFilter(f.value)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === f.value
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay productos disponibles en esta categoria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
