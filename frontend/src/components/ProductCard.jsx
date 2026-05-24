import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

const CATEGORY_STYLES = {
  iPhone: 'from-blue-500/20 to-blue-600/10 text-blue-600',
  Mac: 'from-gray-500/20 to-gray-600/10 text-gray-700',
  iPad: 'from-purple-500/20 to-purple-600/10 text-purple-600',
  Audio: 'from-green-500/20 to-green-600/10 text-green-600',
  Displays: 'from-cyan-500/20 to-cyan-600/10 text-cyan-600',
  Accessories: 'from-amber-500/20 to-amber-600/10 text-amber-600',
}

const CATEGORY_LABELS = {
  iPhone: 'Celulares',
  Mac: 'Laptops',
  iPad: 'Tablets',
  Audio: 'Audio',
  Displays: 'Pantallas',
  Accessories: 'Accesorios',
}

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { show } = useToast()
  const style = CATEGORY_STYLES[product.category] || CATEGORY_STYLES.Accessories

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    show(`${product.name} agregado al carrito`, 'success')
  }

  return (
    <div className="card group">
      <Link to={`/product/${product.slug}`} className="block relative">
        <div className={`bg-gradient-to-br ${style} p-6 flex items-center justify-center h-52 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
          <div className="w-28 h-28 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-2 transition-all duration-500">
            <span className="text-5xl font-black text-gray-700/30">{product.name.charAt(0)}</span>
          </div>
          {product.featured && (
            <span className="absolute top-3 left-3 badge bg-accent text-white text-[10px] uppercase tracking-wider font-bold">
              Destacado
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute top-3 right-3 badge bg-danger/90 text-white text-[10px]">
              Ultimas {product.stock}
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-3 right-3 badge bg-gray-900/80 text-white text-[10px]">
              Agotado
            </span>
          )}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-accent uppercase tracking-widest">
            {CATEGORY_LABELS[product.category] || product.category}
          </span>
          {product.compare_at_price && (
            <span className="badge bg-red-50 text-danger text-[10px] font-bold">
              -{Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)}%
            </span>
          )}
        </div>

        <Link to={`/product/${product.slug}`}>
          <h3 className="text-base font-bold text-gray-900 leading-snug mb-1 group-hover:text-accent transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-400 mb-4 line-clamp-1 leading-relaxed">{product.tagline}</p>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-xl font-black text-gray-900">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-xs text-gray-400 line-through ml-2">{formatPrice(product.compare_at_price)}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="bg-accent hover:bg-accent-dark disabled:bg-gray-200 text-white p-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/25 active:scale-95 disabled:cursor-not-allowed"
            aria-label="Agregar al carrito"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
