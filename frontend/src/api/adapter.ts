export type ApiResponse<T> = {
  status: 'success' | 'error'
  code: number
  message?: string
  data?: T
  errors?: { field: string; message: string }[]
}

export type ApiSingleResponse<T> = {
  status: 'success' | 'error'
  code: number
  message: string
  data: T
}

export type ApiListResponse<T> = {
  status: 'success' | 'error'
  code: number
  message: string
  data: T[]
  pagination: PaginationInfo
}

export type PaginationInfo = {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export function adaptResponse<T>(res: any): T {
  if (res.status === 'success') {
    return res.data
  }
  throw new Error(res.message || 'API Error')
}

export function getErrorMessage(err: unknown, fallback?: string): string {
  if (typeof err === 'object' && err !== null) {
    const axiosErr = err as { response?: { data?: { message?: string } } }
    if (axiosErr.response?.data?.message) return axiosErr.response.data.message
  }
  if (err instanceof Error) return err.message
  return fallback || 'Đã xảy ra lỗi'
}