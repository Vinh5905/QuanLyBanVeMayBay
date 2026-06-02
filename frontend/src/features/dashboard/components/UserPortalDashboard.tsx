import { useState, useEffect } from 'react'
import { bookingApi } from '../../../api/bookingApi'
import { ticketApi } from '../../../api/ticketApi'
import { getErrorMessage } from '../../../api/adapter'
import { StatCard } from './StatCard'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import { DataTable } from '../../../components/DataTable/DataTable'
import { Button } from '../../../components/Button/Button'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { Badge } from '../../../components/Badge/Badge'

export function UserPortalDashboard() {
  const [bookings, setBookings] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [bRes, tRes] = await Promise.all([
          bookingApi.getMyBookings().catch(() => ({ data: [] })),
          ticketApi.getMyTickets().catch(() => ({ data: [] })),
        ])
        setBookings(bRes.data || [])
        setTickets(tRes.data || [])
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <LoadingState text="Đang tải..." />
  if (error) return <ErrorState message={error} />

  const upcomingBookings = bookings.filter((b: any) => b.trangThaiDatCho === 'DANG_GIU_CHO')
  const activeTickets = tickets.filter((t: any) => t.trangThaiVe === 'HOP_LE')

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Trang cá nhân</h1>
        <p className="dashboard-subtitle">Quản lý đặt chỗ và vé của bạn.</p>
      </div>

      <div className="stat-grid">
        <StatCard title="Đặt chờ thanh toán" value={String(upcomingBookings.length)} icon="📋" />
        <StatCard title="Vé hợp lệ" value={String(activeTickets.length)} icon="🎫" />
      </div>

      <div className="dashboard-chart-container">
        <h3>Đặt chỗ đang chờ thanh toán</h3>
        {upcomingBookings.length === 0 ? (
          <EmptyState title="Không có đặt chỗ" description="Bạn chưa có đặt chỗ nào đang chờ" action={<Button onClick={() => window.location.href = '/bookings'}>Đặt vé ngay</Button>} />
        ) : (
          <DataTable
            columns={[
              { key: 'maPhieuDatCho', label: 'Mã phiếu' },
              { key: 'tongTien', label: 'Tổng tiền', render: (r: any) => `${(r.tongTien || 0).toLocaleString('vi-VN')}đ` },
              { key: 'hanThanhToan', label: 'Hạn TT', render: (r: any) => r.hanThanhToan ? new Date(r.hanThanhToan).toLocaleString('vi-VN') : '' },
            ]}
            data={upcomingBookings}
          />
        )}
      </div>
    </div>
  )
}
