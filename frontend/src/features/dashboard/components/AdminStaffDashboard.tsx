import { useState, useEffect } from 'react'
import { dashboardApi } from '../../../api/dashboardApi'
import { getErrorMessage } from '../../../api/adapter'
import { StatCard } from './StatCard'
import { RevenueChart } from './RevenueChart'
import { DonutChart } from './DonutChart'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import type { DashboardSummary, TicketClassChartData } from '../../../types/dashboard'

interface FlightRow {
  maChuyenBay: string
  sanBayDi: string
  sanBayDen: string
  ngayGio: string
  trangThai: string
}

interface TicketRow {
  maVe: string
  tenKhach: string
  hanhTrinh: string
  trangThai: string
}

export function AdminStaffDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number }[]>([])
  const [ticketClassData, setTicketClassData] = useState<TicketClassChartData[]>([])
  const [todayFlights, setTodayFlights] = useState<FlightRow[]>([])
  const [recentTickets, setRecentTickets] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const [sRes, rRes, tRes, fRes, recRes] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getRevenueChart().catch(() => ({ data: [] })),
          dashboardApi.getTicketChart().catch(() => ({ data: [] })),
          dashboardApi.getTodayFlights().catch(() => ({ data: [] })),
          dashboardApi.getRecentTickets().catch(() => ({ data: [] })),
        ])
        setSummary(sRes.data)
        const chartData = (rRes.data || []).map((d: any) => ({
          name: d.ngay ? new Date(d.ngay).toLocaleDateString('vi-VN') : '',
          revenue: d.doanhThu || 0,
        }))
        setRevenueData(chartData)
        setTicketClassData(tRes.data || [])
        setTodayFlights(fRes.data || [])
        setRecentTickets(recRes.data || [])
      } catch (err) {
        setError(getErrorMessage(err, 'Không thể tải dữ liệu dashboard'))
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <LoadingState text="Đang tải dữ liệu tổng quan..." />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  const statusBadge = (status: string) => {
    const cls = status === 'Đã khởi hành' ? 'badge badge-success' : status === 'Đã hủy' ? 'badge badge-error' : 'badge badge-info'
    return <span className={cls}>{status}</span>
  }

  const ticketStatusBadge = (status: string) => {
    const cls = status === 'Đã thanh toán' || status === 'Đã check-in' ? 'badge badge-success' : status === 'Đã hủy' ? 'badge badge-error' : 'badge badge-info'
    return <span className={cls}>{status}</span>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Tổng quan hệ thống</h1>
          <p className="dashboard-subtitle">Theo dõi tình hình kinh doanh hôm nay.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard
          title="Doanh thu hôm nay"
          value={((summary?.doanhThuHomNay ?? 0)).toLocaleString('vi-VN') + ' đ'}
          icon="💰"
        />
        <StatCard
          title="Vé đã bán"
          value={String(summary?.tongVeHomNay ?? 0)}
          icon="🎫"
        />
        <StatCard
          title="Chuyến bay trong ngày"
          value={String(summary?.soChuyenBayHomNay ?? 0)}
          icon=""
        />
        <StatCard
          title="Khách hàng mới"
          value={String(summary?.soKhachMoiThangNay ?? 0)}
          icon="👥"
        />
      </div>

      <div className="dashboard-grid-2">
        <RevenueChart data={revenueData} title="Biểu đồ doanh thu" />
        <DonutChart data={ticketClassData} title="Phân bổ hạng vé" />
      </div>

      <div className="dashboard-grid-2">
        <div className="dashboard-chart-container">
          <h3 className="dashboard-chart-title">Chuyến bay hôm nay</h3>
          {todayFlights.length === 0 ? (
            <EmptyState title="Không có chuyến bay" description="Hôm nay không có chuyến bay nào" />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Mã chuyến bay</th>
                    <th>Hành trình</th>
                    <th>Giờ</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {todayFlights.map((f, i) => (
                    <tr key={i}>
                      <td>{f.maChuyenBay}</td>
                      <td>{f.sanBayDi} ✈ {f.sanBayDen}</td>
                      <td>{new Date(f.ngayGio).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{statusBadge(f.trangThai)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-chart-container">
          <h3 className="dashboard-chart-title">Vé bán gần đây</h3>
          {recentTickets.length === 0 ? (
            <EmptyState title="Không có vé" description="Chưa có vé nào được bán" />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Mã vé</th>
                    <th>Khách hàng</th>
                    <th>Hành trình</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((t, i) => (
                    <tr key={i}>
                      <td>{t.maVe}</td>
                      <td>{t.tenKhach}</td>
                      <td>{t.hanhTrinh}</td>
                      <td>{ticketStatusBadge(t.trangThai)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
