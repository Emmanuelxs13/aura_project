import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { products as productsApi } from '../services/api'
import ProductCard from '../components/ProductCard'

const heroImages = [
  {
    title: 'iPhone 16 Pro',
    subtitle: 'Titanio. Potencia. Pro.',
    desc: 'El iPhone mas avanzado con camara profesional, bateria de larga duracion y chip A18 Pro.',
    category: 'iPhone',
    bg: 'from-accent/20 to-secondary/20',
  },
  {
    title: 'MacBook Pro M4',
    subtitle: 'Potencia sin limites.',
    desc: 'Workstation en un formato compacto. Chip M4 Pro, pantalla Liquid Retina XDR y bateria para todo el dia.',
    category: 'Mac',
    bg: 'from-secondary/20 to-accent/10',
  },
  {
    title: 'iPad Pro M4',
    subtitle: 'Ultra-delgado. Ultra-capaz.',
    desc: 'El lienzo definitivo para creadores con chip M4, pantalla OLED y soporte para Apple Pencil.',
    category: 'iPad',
    bg: 'from-accent/10 to-secondary/30',
  },
]

const categories = [
  { name: 'Celulares', slug: '/celulares', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'bg-accent/10 text-accent' },
  { name: 'Laptops', slug: '/laptops', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'bg-secondary/10 text-secondary' },
  { name: 'Accesorios', slug: '/accesorios', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', color: 'bg-accent/10 text-accent' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [heroIndex, setHeroIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsApi.getFeatured()
      .then(({ data }) => setFeatured(data.products))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroImages.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const hero = heroImages[heroIndex]

  return (
    <div>
      <section className={`relative bg-gradient-to-br ${hero.bg} overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 bg-white/80 rounded-full text-sm font-medium text-accent mb-6">
              {hero.category}
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-4 leading-tight">
              {hero.title}
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-accent mb-6">
              {hero.subtitle}
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              {hero.desc}
            </p>
            <div className="flex space-x-4">
              <Link to={`/product/iphone-16-pro`} className="btn-primary text-lg px-8 py-4">
                Comprar ahora
              </Link>
              <Link to="/celulares" className="btn-outline text-lg px-8 py-4">
                Ver mas
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => setHeroIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === heroIndex ? 'bg-accent w-8' : 'bg-gray-400'}`}
            />
          ))}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map(cat => (
              <Link key={cat.name} to={cat.slug}
                className="flex items-center space-x-4 p-6 rounded-xl border-2 border-gray-100 hover:border-accent transition-all duration-300 group">
                <div className={`p-4 rounded-xl ${cat.color} group-hover:scale-110 transition-transform`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cat.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{cat.name}</h3>
                  <p className="text-sm text-gray-500">Ver coleccion &rarr;</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Productos Destacados</h2>
            <p className="section-subtitle">Lo mejor de la tecnologia premium en un solo lugar</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Productos Originales</h3>
              <p className="text-gray-500 text-sm">Garantia oficial y sellados de fabrica. Solo productos 100% originales.</p>
            </div>
            <div className="p-8">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Envio Relampago</h3>
              <p className="text-gray-500 text-sm">Entregas en 24-48 horas en ciudades principales. Seguimiento en tiempo real.</p>
            </div>
            <div className="p-8">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Soporte Premium</h3>
              <p className="text-gray-500 text-sm">Asesoria tecnica especializada. Soporte post-venta de primer nivel.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
