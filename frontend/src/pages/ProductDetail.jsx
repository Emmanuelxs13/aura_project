import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { products as productsApi } from '../services/api'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    setLoading(true)
    productsApi.getBySlug(slug)
      .then(({ data }) => setProduct(data.product))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)
  }

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h2>
          <Link to="/" className="btn-primary">Volver a la tienda</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex mb-8 text-sm text-gray-500">
        <Link to="/" className="hover:text-accent">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to={`/${product.category.toLowerCase() === 'iphone' ? 'celulares' : product.category.toLowerCase() === 'mac' ? 'laptops' : 'accesorios'}`}
          className="hover:text-accent">
          {product.category === 'iPhone' ? 'Celulares' : product.category === 'Mac' ? 'Laptops' : product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-12 flex items-center justify-center h-96 md:h-auto">
          <div className="w-48 h-48 bg-white/50 rounded-full flex items-center justify-center">
            <span className="text-6xl font-bold text-accent/30">{product.name.charAt(0)}</span>
          </div>
        </div>

        <div>
          <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm font-medium rounded-full mb-4">
            {product.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
          <p className="text-lg text-gray-500 mb-6">{product.tagline}</p>

          <div className="flex items-baseline space-x-4 mb-6">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-xl text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
            )}
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center border-2 border-gray-200 rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2.5 hover:bg-gray-50 transition-colors text-gray-600 font-medium">
                -
              </button>
              <span className="px-4 py-2.5 font-medium text-gray-800 border-x-2 border-gray-200">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2.5 hover:bg-gray-50 transition-colors text-gray-600 font-medium">
                +
              </button>
            </div>
            <span className="text-sm text-gray-500">
              {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
            </span>
          </div>

          <button onClick={handleAddToCart} disabled={product.stock === 0}
            className={`w-full py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
              added ? 'bg-green-500 text-white' : product.stock > 0 ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}>
            {added ? 'Agregado!' : product.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
          </button>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Descripcion</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {product.colorway && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Color</h3>
              <span className="inline-block px-4 py-2 bg-gray-100 rounded-lg text-gray-700">{product.colorway}</span>
            </div>
          )}

          {product.specifications && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Especificaciones</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500 uppercase">{key}</span>
                    <p className="font-medium text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
