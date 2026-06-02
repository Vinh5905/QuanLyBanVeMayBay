import { useState, useEffect } from 'react'
import { dashboardApi } from '../../../api/dashboardApi'
import { getErrorMessage } from '../../../api/adapter'
import { StatCard } from './StatCard'
import { RevenueChart } from './RevenueChart'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import type { DashboardSummary } from '../../../types/dashboard'

export function AdminStaffDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const [sRes, rRes] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getRevenueChart().catch(() => ({ data: [] })),
        ])
        setSummary(sRes.data)
        const chartData = (rRes.data || []).map((d: any) => ({
          name: d.ngay ? new Date(d.ngay).toLocaleDateString('vi-VN') : '',
          revenue: d.doanhThu || 0,
        }))
        setRevenueData(chartData)
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
        <div className="dashboard-chart-container">
          <h3 className="dashboard-chart-title">Chuyến bay sắp khởi hành</h3>
          <ul className="dashboard-list">
            {[1, 2, 3, 4, 5].map(i => (
              <li key={i} className="dashboard-list-item">
                <div>
                  <div className="list-item-title">Chuyến bay #{i}</div>
                  <div className="list-item-subtitle">SGN ✈ HAN</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
