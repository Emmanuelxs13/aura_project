import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { products as productsApi } from '../services/api'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

const categoryHeroes = [
  { slug: 'iphone-16-pro', category: 'iPhone', label: 'Celulares', gradient: 'from-blue-600 via-blue-500 to-accent' },
  { slug: 'macbook-pro-14-m4-pro', category: 'Mac', label: 'Laptops', gradient: 'from-gray-800 via-gray-700 to-gray-600' },
  { slug: 'ipad-pro-13-m4', category: 'iPad', label: 'Tablets', gradient: 'from-purple-600 via-purple-500 to-accent' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [heroIdx, setHeroIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { show } = useToast()

  useEffect(() => {
    Promise.all([
      productsApi.getFeatured(),
      productsApi.getCategories(),
    ]).then(([feat, cats]) => {
      setFeatured(feat.data.products)
      setCategories(cats.data.categories)
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % categoryHeroes.length), 5000)
    return () => clearInterval(t)
  }, [])

  const hero = categoryHeroes[heroIdx]

  const quickAdd = async (slug) => {
    try {
      const { data } = await productsApi.getBySlug(slug)
      addItem(data.product)
      show(`${data.product.name} agregado al carrito`, 'success')
    } catch { show('Error al agregar producto', 'error') }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br ${hero.gradient} overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white mb-6">
              {hero.label}
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-[1.1] tracking-tight">
              Tecnologia Premium
              <br />
              <span className="text-white/80">al mejor precio</span>
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-xl leading-relaxed">
              Productos originales, envio rapido y soporte especializado. La mejor experiencia de compra en tecnologia.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => quickAdd(hero.slug)} className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-all duration-200 hover:shadow-2xl text-lg">
                Comprar {hero.label === 'Celulares' ? 'iPhone' : hero.label === 'Laptops' ? 'MacBook' : 'iPad'}
              </button>
              <Link to={`/${hero.label.toLowerCase()}`} className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-semibold py-4 px-8 rounded-xl transition-all duration-200 border border-white/20 text-lg">
                Ver catalogo
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2.5">
          {categoryHeroes.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)}
              className={`h-2 rounded-full transition-all duration-500 ${i === heroIdx ? 'w-10 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/celulares" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-8 min-h-[180px] flex flex-col justify-end">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <h3 className="text-2xl font-bold text-white relative z-10">Celulares</h3>
              <p className="text-white/70 text-sm relative z-10 mt-1">iPhone 16 Pro y mas</p>
            </Link>
            <Link to="/laptops" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 p-8 min-h-[180px] flex flex-col justify-end">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <h3 className="text-2xl font-bold text-white relative z-10">Laptops</h3>
              <p className="text-white/70 text-sm relative z-10 mt-1">MacBook Pro & Air</p>
            </Link>
            <Link to="/accesorios" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-8 min-h-[180px] flex flex-col justify-end">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <h3 className="text-2xl font-bold text-white relative z-10">Accesorios</h3>
              <p className="text-white/70 text-sm relative z-10 mt-1">AirPods, Watch y mas</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Productos Destacados</h2>
              <p className="text-gray-400 mt-2">Lo mas vendido de la temporada</p>
            </div>
            <Link to="/celulares" className="hidden sm:inline-flex text-sm font-semibold text-accent hover:text-accent-dark transition-colors">
              Ver todo &rarr;
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-[380px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: categories.reduce((s, c) => s + c.count, 0) || '26+', label: 'Productos' },
              { value: '24-48', label: 'Horas de envio' },
              { value: '100%', label: 'Originales' },
              { value: '12', label: 'Meses de garantia' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-black text-accent">{s.value}</p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories with counts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Categorias</h2>
            <p className="text-gray-400 mt-2">Explora nuestra coleccion completa</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['iPhone', 'Mac', 'iPad', 'Audio', 'Displays', 'Accessories'].map(cat => {
              const c = categories.find(c => c.category === cat)
              const count = c?.count || 0
              return (
                <Link key={cat} to={`/${cat === 'iPhone' ? 'celulares' : cat === 'Mac' ? 'laptops' : 'accesorios'}`}
                  className="p-6 rounded-2xl border-2 border-gray-100 hover:border-accent hover:bg-accent/5 transition-all duration-200 text-center group">
                  <p className="text-2xl font-black text-gray-900 group-hover:text-accent transition-colors">{count}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {cat === 'iPhone' ? 'Celulares' : cat === 'Mac' ? 'Laptops' : cat}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">productos</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
