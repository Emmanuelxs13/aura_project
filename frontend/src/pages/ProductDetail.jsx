import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { products as productsApi } from '../services/api'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import ProductCard from '../components/ProductCard'

const CATEGORY_MAP = { iPhone: 'celulares', Mac: 'laptops', iPad: 'accesorios', Audio: 'accesorios', Displays: 'accesorios', Accessories: 'accesorios' }
const CATEGORY_LABEL = { iPhone: 'Celulares', Mac: 'Laptops', iPad: 'Tablets', Audio: 'Audio', Displays: 'Pantallas', Accessories: 'Accesorios' }

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const { show } = useToast()

  useEffect(() => {
    setLoading(true)
    productsApi.getBySlug(slug)
      .then(({ data }) => {
        setProduct(data.product)
        return productsApi.getAll({ category: data.product.category })
      })
      .then(({ data }) => {
        setRelated((data.products || []).filter(p => p.slug !== slug).slice(0, 4))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  const formatPrice = (p) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p)

  const handleAdd = () => {
    if (product) {
      addItem(product, quantity)
      show(`${product.name} agregado al carrito`, 'success')
    }
  }

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-accent border-t-transparent" />
    </div>
  )

  if (!product) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h2>
        <Link to="/" className="btn-primary">Volver a la tienda</Link>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-accent">Inicio</Link>
        <span>/</span>
        <Link to={`/${CATEGORY_MAP[product.category] || 'celulares'}`} className="hover:text-accent">{CATEGORY_LABEL[product.category]}</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 flex items-center justify-center min-h-[400px] lg:min-h-[500px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(250,129,47,0.05),transparent_50%)]" />
          <div className="w-56 h-56 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl">
            <span className="text-7xl font-black text-gray-200">{product.name.charAt(0)}</span>
          </div>
          {product.compare_at_price && (
            <span className="absolute top-6 left-6 bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
              -{Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)}%
            </span>
          )}
        </div>

        <div>
          <span className="inline-flex items-center px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase tracking-wider mb-4">
            {CATEGORY_LABEL[product.category] || product.category}
          </span>
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3 leading-tight">{product.name}</h1>
          <p className="text-lg text-gray-400 mb-8">{product.tagline}</p>

          <div className="flex items-baseline space-x-4 mb-8">
            <span className="text-4xl font-black text-gray-900">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-xl text-gray-300 line-through">{formatPrice(product.compare_at_price)}</span>
            )}
          </div>

          <div className="flex items-center space-x-4 mb-8">
            <div className="flex items-center border-2 border-gray-200 rounded-xl">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-5 py-3 hover:bg-gray-50 transition-colors text-gray-500 font-bold text-lg">-</button>
              <span className="px-5 py-3 font-bold text-gray-900 border-x-2 border-gray-200 min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}
                className="px-5 py-3 hover:bg-gray-50 transition-colors text-gray-500 font-bold text-lg">+</button>
            </div>
            <div className={`px-4 py-3 rounded-xl text-sm font-bold ${product.stock > 5 ? 'bg-green-50 text-green-600' : product.stock > 0 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
              {product.stock > 5 ? `${product.stock} en stock` : product.stock > 0 ? `Ultimas ${product.stock}` : 'Agotado'}
            </div>
          </div>

          <button onClick={handleAdd} disabled={product.stock === 0}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center space-x-3 mb-8">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span>{product.stock > 0 ? 'Agregar al carrito' : 'Agotado'}</span>
          </button>

          <div className="border-t border-gray-100 pt-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Descripcion</h3>
              <p className="text-gray-500 leading-relaxed">{product.description}</p>
            </div>
            {product.colorway && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-gray-500">Color:</span>
                <span className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-br" style={{ background: product.colorway === 'Midnight' ? '#1a1a2e' : product.colorway === 'Silver' || product.colorway === 'Plateado' ? '#e0e0e0' : product.colorway === 'Space Black' || product.colorway === 'Negro Espacial' ? '#2d2d2d' : product.colorway === 'White' || product.colorway === 'Blanco' ? '#f5f5f5' : product.colorway === 'Natural Titanium' || product.colorway === 'Titanio Natural' || product.colorway === 'Titanio' ? '#d4d0c8' : '#666' }} />
                  <span>{product.colorway}</span>
                </span>
              </div>
            )}
            {product.specifications && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Especificaciones</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{key}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 pt-12 border-t border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-8">Productos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
