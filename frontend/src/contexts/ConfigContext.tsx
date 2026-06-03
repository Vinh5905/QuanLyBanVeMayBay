import React, { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { configApi } from '../api/config.api'
import { useAuth } from './AuthContext'

type ConfigMap = Record<string, string>

interface ConfigContextValue {
  config: ConfigMap
  getNum: (key: string, fallback?: number) => number
  isLoaded: boolean
}

const ConfigContext = createContext<ConfigContextValue>({
  config: {},
  getNum: (_k, f = 0) => f,
  isLoaded: false,
})

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  const { data: params = [] } = useQuery({
    queryKey: ['config'],
    queryFn: configApi.list,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })

  const config: ConfigMap = {}
  params.forEach((p) => { config[p.tenThamSo] = p.giaTri })

  const getNum = (key: string, fallback = 0) => {
    const val = config[key]
    if (!val) return fallback
    const n = parseFloat(val)
    return isNaN(n) ? fallback : n
  }

  return (
    <ConfigContext.Provider value={{ config, getNum, isLoaded: params.length > 0 }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  return useContext(ConfigContext)
}
