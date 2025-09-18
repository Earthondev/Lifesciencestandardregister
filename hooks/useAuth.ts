import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGoogleSheets } from '@/lib/googleSheets'

interface User {
  email: string
  name?: string
  role?: string
  permissions?: string
  phone?: string
  created_at?: string
  is_active?: boolean
  provider?: 'email' | 'google'
}

export const useAuth = () => {
  const router = useRouter()
  const { authenticateUser, getUserByEmail } = useGoogleSheets()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = localStorage.getItem('isLoggedIn')
        const userEmail = localStorage.getItem('userEmail')
        const authProvider = localStorage.getItem('authProvider')

        if (isLoggedIn === 'true' && userEmail) {
          // Try to get fresh user data from Google Sheets
          try {
            const userData = await getUserByEmail(userEmail)
            if (userData && userData.is_active) {
              setUser({
                email: userData.email,
                name: userData.name,
                role: userData.role,
                permissions: userData.permissions,
                phone: userData.phone,
                created_at: userData.created_at,
                is_active: userData.is_active,
                provider: (authProvider as 'email' | 'google') || 'email'
              })
            } else {
              // User not found or inactive, clear auth
              localStorage.removeItem('isLoggedIn')
              localStorage.removeItem('userEmail')
              localStorage.removeItem('authProvider')
              setUser(null)
            }
          } catch (error) {
            // If Google Sheets is not available, use cached data
            console.warn('Could not fetch user data from Google Sheets, using cached data')
            setUser({
              email: userEmail,
              name: userEmail.split('@')[0],
              provider: (authProvider as 'email' | 'google') || 'email'
            })
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password?: string, provider: 'email' | 'google' = 'email') => {
    try {
      if (provider === 'email' && password) {
        // Authenticate with Google Sheets
        const authResult = await authenticateUser(email, password)
        
        if (authResult.success) {
          const userData = authResult.user
          
          // Store auth data in localStorage
          localStorage.setItem('isLoggedIn', 'true')
          localStorage.setItem('userEmail', email)
          localStorage.setItem('authProvider', provider)
          localStorage.setItem('userData', JSON.stringify(userData))
          
          setUser({
            email: userData.email,
            name: userData.name,
            role: userData.role,
            permissions: userData.permissions,
            phone: userData.phone,
            created_at: userData.created_at,
            is_active: userData.is_active,
            provider
          })
          
          return { success: true, user: userData }
        } else {
          return { success: false, error: authResult.message || 'Authentication failed' }
        }
      } else {
        // Google OAuth or demo mode (fallback to old behavior)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userEmail', email)
        localStorage.setItem('authProvider', provider)
        
        setUser({
          email,
          name: email.split('@')[0],
          provider
        })
        
        return { success: true }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('authProvider')
    localStorage.removeItem('userData')
    localStorage.removeItem('rememberMe')
    
    setUser(null)
    router.push('/')
  }

  const requireAuth = () => {
    if (!user && !isLoading) {
      router.push('/')
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false
    return user.permissions.split(',').includes(permission)
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin' || hasPermission('admin')
  }

  const canRead = (): boolean => {
    return hasPermission('read') || isAdmin()
  }

  const canWrite = (): boolean => {
    return hasPermission('write') || isAdmin()
  }

  const canDelete = (): boolean => {
    return hasPermission('delete') || isAdmin()
  }

  return {
    user,
    isLoading,
    login,
    logout,
    requireAuth,
    isAuthenticated: !!user,
    hasPermission,
    isAdmin,
    canRead,
    canWrite,
    canDelete
  }
}