import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@/types'
import {
  ensureSeedAdmin,
  getCurrentUser,
  login as doLogin,
  logout as doLogout,
  register as doRegister,
  updateConsent as doUpdateConsent,
  deleteAccount as doDeleteAccount,
} from '@/lib/auth/auth'
import type { RegisterInput } from '@/lib/auth/auth'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (input: RegisterInput) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  setConsent: (consent: boolean) => void
  deleteAccount: () => void
  refresh: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ensureSeedAdmin().finally(() => {
      if (!active) return
      setUser(getCurrentUser())
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const refresh = useCallback(() => setUser(getCurrentUser()), [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await doLogin(email, password)
    if (res.ok) setUser(res.user)
    return res.ok ? { ok: true } : { ok: false, error: res.error }
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const res = await doRegister(input)
    if (res.ok) setUser(res.user)
    return res.ok ? { ok: true } : { ok: false, error: res.error }
  }, [])

  const logout = useCallback(() => {
    doLogout()
    setUser(null)
  }, [])

  const setConsent = useCallback(
    (consent: boolean) => {
      if (!user) return
      const updated = doUpdateConsent(user.id, consent)
      if (updated) setUser(updated)
    },
    [user],
  )

  const deleteAccount = useCallback(() => {
    if (!user) return
    doDeleteAccount(user.id)
    setUser(null)
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout, setConsent, deleteAccount, refresh }),
    [user, loading, login, register, logout, setConsent, deleteAccount, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
