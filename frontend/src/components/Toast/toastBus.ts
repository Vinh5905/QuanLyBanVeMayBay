import type { ToastVariant } from './Toast'

type ToastHandler = (message: string, variant?: ToastVariant) => void

let emitToast: ToastHandler | null = null

export function setToastHandler(handler: ToastHandler) {
  emitToast = handler
}

function show(message: string, variant: ToastVariant = 'info') {
  if (emitToast) {
    emitToast(message, variant)
  }
}

export const toast = {
  success: (message: string) => show(message, 'success'),
  error: (message: string) => show(message, 'error'),
  warning: (message: string) => show(message, 'warning'),
  info: (message: string) => show(message, 'info'),
}
