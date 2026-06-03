import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export function formatDate(iso: string): string {
  try { return format(parseISO(iso), 'dd/MM/yyyy', { locale: vi }) }
  catch { return iso }
}

export function formatDateTime(iso: string): string {
  try { return format(parseISO(iso), 'HH:mm dd/MM/yyyy', { locale: vi }) }
  catch { return iso }
}

export function formatTime(iso: string): string {
  try { return format(parseISO(iso), 'HH:mm', { locale: vi }) }
  catch { return iso }
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} phút`
  if (m === 0) return `${h} giờ`
  return `${h} giờ ${m} phút`
}

export const TICKET_STATUS_LABEL: Record<string, string> = {
  HOP_LE: 'Hợp lệ',
  DANG_GIU_CHO: 'Đang giữ chỗ',
  DA_HUY: 'Đã hủy',
  DA_DOI: 'Đã đổi chuyến',
}

export const TICKET_STATUS_COLOR: Record<string, string> = {
  HOP_LE: 'bg-green-100 text-green-800',
  DANG_GIU_CHO: 'bg-yellow-100 text-yellow-800',
  DA_HUY: 'bg-red-100 text-red-800',
  DA_DOI: 'bg-blue-100 text-blue-800',
}

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  CARD: 'Thẻ ngân hàng',
  MOMO: 'MoMo',
  ZALOPAY: 'ZaloPay',
  BANK_TRANSFER: 'Chuyển khoản',
}

export const FLIGHT_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Đã lên lịch',
  CANCELLED: 'Đã hủy',
}
