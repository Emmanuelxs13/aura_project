import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { orders as ordersApi } from '../services/api'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const { show } = useToast()
  const navigate = useNavigate()

  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState({
    shipping_name: user?.name || '',
    shipping_email: user?.email || '',
    shipping_address: '',
  })
  const [placing, setPlacing] = useState(false)

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)

  const handleCheckout = async () => {
    if (!user) {
      setIsOpen(false)
      navigate('/login')
      return
    }

    if (!checkingOut) {
      setCheckingOut(true)
      return
    }

    if (!checkoutForm.shipping_address.trim()) {
      show('La direccion de envio es requerida', 'error')
      return
    }

    setPlacing(true)
    try {
      const orderItems = items.map(i => ({
        product_id: i.id,
        quantity: i.quantity,
      }))

      await ordersApi.create({
        ...checkoutForm,
        items: orderItems,
      })

      clearCart()
      setCheckingOut(false)
      setIsOpen(false)
      show('Pedido realizado con exito!', 'success', 5000)
      navigate('/account')
    } catch (err) {
      show(err.response?.data?.error || 'Error al procesar el pedido', 'error')
    } finally {
      setPlacing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setCheckingOut(false); setIsOpen(false) }} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Carrito</h2>
            <p className="text-sm text-gray-400">{items.length} producto{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => { setCheckingOut(false); setIsOpen(false) }} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tu carrito esta vacio</h3>
            <p className="text-sm text-gray-400 mb-6">Agrega productos para empezar a comprar</p>
            <button onClick={() => setIsOpen(false)} className="btn-primary text-sm">
              Explorar productos
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50/80 rounded-2xl">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-xl font-bold text-gray-300">{item.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm font-bold text-accent">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors">
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors">
                      +
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-300 hover:text-danger transition-colors rounded-lg hover:bg-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {checkingOut && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Datos de envio</h3>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={checkoutForm.shipping_name}
                  onChange={e => setCheckoutForm(f => ({ ...f, shipping_name: e.target.value }))}
                  className="input-field text-sm"
                />
                <input
                  type="email"
                  placeholder="Correo electronico"
                  value={checkoutForm.shipping_email}
                  onChange={e => setCheckoutForm(f => ({ ...f, shipping_email: e.target.value }))}
                  className="input-field text-sm"
                />
                <textarea
                  placeholder="Direccion de envio (ciudad, direccion, codigo postal)"
                  value={checkoutForm.shipping_address}
                  onChange={e => setCheckoutForm(f => ({ ...f, shipping_address: e.target.value }))}
                  className="input-field text-sm resize-none"
                  rows={2}
                />
              </div>
            )}

            <div className="border-t border-gray-100 px-6 py-5 space-y-4 bg-white">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">{formatPrice(totalPrice)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={placing || items.length === 0}
                className="w-full btn-primary text-center py-3.5 text-sm flex items-center justify-center space-x-2"
              >
                {placing ? (
                  <span>Procesando...</span>
                ) : checkingOut ? (
                  <span>Confirmar pedido - {formatPrice(totalPrice)}</span>
                ) : (
                  <span>Proceder al pago</span>
                )}
              </button>
              {checkingOut && (
                <button onClick={() => setCheckingOut(false)} className="w-full text-sm text-gray-400 hover:text-gray-600 text-center py-2 transition-colors">
                  Volver al carrito
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
