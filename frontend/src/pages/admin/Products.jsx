import { useState, useEffect } from 'react'
import { admin as adminApi } from '../../services/api'

const CATEGORIES = ['Mac', 'iPad', 'iPhone', 'Audio', 'Displays', 'Accessories']
const EMPTY_PRODUCT = { name: '', slug: '', category: 'iPhone', tagline: '', description: '', price: '', compare_at_price: '', stock: '0', featured: false, colorway: 'Midnight' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [error, setError] = useState('')

  const fetchProducts = () => {
    setLoading(true)
    adminApi.listProducts()
      .then(({ data }) => setProducts(data.products))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const openCreate = () => {
    setForm(EMPTY_PRODUCT)
    setEditing(null)
    setShowForm(true)
    setError('')
  }

  const openEdit = async (id) => {
    setError('')
    try {
      const { data } = await adminApi.getProduct(id)
      setForm({
        name: data.product.name,
        slug: data.product.slug,
        category: data.product.category,
        tagline: data.product.tagline,
        description: data.product.description,
        price: data.product.price.toString(),
        compare_at_price: data.product.compare_at_price ? data.product.compare_at_price.toString() : '',
        stock: data.product.stock.toString(),
        featured: data.product.featured,
        colorway: data.product.colorway,
      })
      setEditing(id)
      setShowForm(true)
    } catch {
      setError('Error al cargar producto')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10) }
    if (form.compare_at_price) payload.compare_at_price = parseFloat(form.compare_at_price)

    try {
      if (editing) {
        await adminApi.updateProduct(editing, payload)
      } else {
        await adminApi.createProduct(payload)
      }
      setShowForm(false)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar producto')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto permanentemente?')) return
    try {
      await adminApi.deleteProduct(id)
      fetchProducts()
    } catch {
      setError('Error al eliminar producto')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">Gestiona el catalogo de productos</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + Nuevo producto
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-danger text-sm p-4 rounded-lg mb-6">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">&times;</button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input name="slug" value={form.slug} onChange={handleChange} className="input-field" placeholder="Auto-generado" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                  <select name="category" value={form.category} onChange={handleChange} required className="input-field">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                  <input name="tagline" value={form.tagline} onChange={handleChange} className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                  <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio comparativo</label>
                  <input name="compare_at_price" type="number" step="0.01" min="0" value={form.compare_at_price} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input name="colorway" value={form.colorway} onChange={handleChange} className="input-field" />
                </div>
                <div className="md:col-span-2 flex items-center space-x-3">
                  <input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} id="featured" className="w-5 h-5 accent-accent" />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">Producto destacado</label>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">{editing ? 'Actualizar' : 'Crear producto'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Destacado</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Cargando...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No hay productos</td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">ID: {p.id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">{p.category}</td>
                    <td className="px-6 py-4 text-sm font-medium">{formatPrice(p.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.featured ? <span className="text-accent font-medium">Si</span> : <span className="text-gray-400">No</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button onClick={() => openEdit(p.id)} className="text-accent hover:text-accent-dark text-sm font-medium">Editar</button>
                        <button onClick={() => handleDelete(p.id)} className="text-danger hover:text-red-700 text-sm font-medium">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
