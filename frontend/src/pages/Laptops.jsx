import { useState, useEffect } from 'react'
import { products as productsApi } from '../services/api'
import ProductCard from '../components/ProductCard'

export default function Laptops() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsApi.getAll({ category: 'Mac' })
      .then(({ data }) => setProducts(data.products))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <section className="bg-gradient-to-r from-secondary/10 to-accent/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Laptops</h1>
          <p className="text-lg text-gray-600">Potencia y portabilidad. Workstations para profesionales exigentes.</p>
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
