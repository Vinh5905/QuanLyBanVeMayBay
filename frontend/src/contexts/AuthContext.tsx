import React, { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../api/auth.api'
import { tokenStore } from '../api/client'
import type { UserInfo } from '../types'

interface AuthContextValue {
  user: UserInfo | null
  isAuthenticated: boolean
  login: (tenDangNhap: string, matKhau: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: UserInfo | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem('userInfo')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserInfo | null>(loadUser)

  const setUser = useCallback((u: UserInfo | null) => {
    setUserState(u)
    if (u) localStorage.setItem('userInfo', JSON.stringify(u))
    else localStorage.removeItem('userInfo')
  }, [])

  const login = useCallback(async (tenDangNhap: string, matKhau: string) => {
    const tokens = await authApi.login(tenDangNhap, matKhau)
    tokenStore.set(tokens.accessToken, tokens.refreshToken)
    setUser(tokens.userInfo)
  }, [setUser])

  const logout = useCallback(async () => {
    try {
      await authApi.logout(tokenStore.getRefresh() ?? undefined)
    } finally {
      tokenStore.clear()
      setUser(null)
    }
  }, [setUser])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
