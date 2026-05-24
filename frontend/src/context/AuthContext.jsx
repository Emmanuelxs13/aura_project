import { createContext, useContext, useState, useEffect } from 'react'
import { auth as authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('aura_token')
    const savedUser = localStorage.getItem('aura_user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      authApi.me().catch(() => {
        localStorage.removeItem('aura_token')
        localStorage.removeItem('aura_user')
        setUser(null)
      })
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('aura_token', data.token)
    localStorage.setItem('aura_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await authApi.register({ name, email, password })
    localStorage.setItem('aura_token', data.token)
    localStorage.setItem('aura_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('aura_token')
    localStorage.removeItem('aura_user')
    setUser(null)
  }

  const isAdmin = user && ['Administrator', 'Admin', 'Operador', 'Auditor'].includes(user.role)

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
