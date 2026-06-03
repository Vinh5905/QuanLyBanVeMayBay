import { apiClient, unwrap } from './client'
import type { MonthlyReportRow, YearlyReportRow } from '../types'

export const reportsApi = {
  monthly: async (year: number, month: number): Promise<MonthlyReportRow[]> => {
    const res = await apiClient.get('/reports/monthly', { params: { year, month } })
    return unwrap<MonthlyReportRow[]>(res)
  },

  yearly: async (year: number): Promise<YearlyReportRow[]> => {
    const res = await apiClient.get('/reports/yearly', { params: { year } })
    return unwrap<YearlyReportRow[]>(res)
  },

  exportExcel: async (year: number, month?: number): Promise<void> => {
    const params: Record<string, unknown> = { year, format: 'excel' }
    if (month !== undefined) params.month = month
    const res = await apiClient.get('/reports/export', {
      params,
      responseType: 'blob',
    })
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = month
      ? `bao-cao-thang-${month}-${year}.xlsx`
      : `bao-cao-nam-${year}.xlsx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },
}
