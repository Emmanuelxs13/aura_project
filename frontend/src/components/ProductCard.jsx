import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)
  }

  return (
    <div className="card group">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="bg-gradient-to-br from-primary to-primary-dark p-8 flex items-center justify-center h-56">
          <div className="w-32 h-32 bg-white/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <span className="text-4xl font-bold text-accent/30">{product.name.charAt(0)}</span>
          </div>
        </div>
      </Link>
      <div className="p-5">
        <span className="text-xs font-medium text-accent uppercase tracking-wider">{product.category}</span>
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-lg font-semibold text-gray-800 mt-1 mb-1 group-hover:text-accent transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.tagline}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-800">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-sm text-gray-400 line-through ml-2">{formatPrice(product.compare_at_price)}</span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            className="bg-accent hover:bg-accent-dark text-white p-2.5 rounded-lg transition-colors duration-200"
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
