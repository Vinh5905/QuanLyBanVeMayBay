import { useState, useCallback } from 'react'
import { ToastContainer } from './Toast'
import { setToastHandler } from './toastBus'
import type { ToastVariant } from './Toast'

interface ToastItem {
  id: string
  title: string
  variant: ToastVariant
}

let counter = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `toast-${++counter}`
    setToasts(prev => [...prev, { id, title: message, variant }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  setToastHandler(addToast)

  return (
    <>
      {children}
      <ToastContainer
        toasts={toasts.map(t => ({ id: t.id, title: t.title, variant: t.variant }))}
        onClose={removeToast}
      />
    </>
  )
}
