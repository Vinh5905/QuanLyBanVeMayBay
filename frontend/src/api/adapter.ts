export type ApiResponse<T> = {
  status: 'success' | 'error'
  code: number
  message?: string
  data?: T
  errors?: { field: string; message: string }[]
}

export function adaptResponse<T>(res: any): T {
  if (res.status === 'success') {
    return res.data
  }

  throw new Error(res.message || 'API Error')
}