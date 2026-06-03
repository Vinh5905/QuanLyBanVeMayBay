import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard.api'
import { formatCurrency, formatDateTime, TICKET_STATUS_LABEL, TICKET_STATUS_COLOR } from '../utils/format'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Ticket, Plane, Users, DollarSign, TrendingUp } from 'lucide-react'
import Spinner from '../components/ui/Spinner'
import { format, parseISO } from 'date-fns'
import Badge from '../components/ui/Badge'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b']

export default function DashboardPage() {
  const { user } = useAuth()
  if (user?.vaiTro === 'KhachHang') return <Navigate to="/tickets/book" replace />
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.summary,
    staleTime: 60_000,
  })
  const { data: revenueChart = [] } = useQuery({
    queryKey: ['dashboard-revenue'],
    queryFn: dashboardApi.revenueChart,
    staleTime: 60_000,
  })
  const { data: ticketChart = [] } = useQuery({
    queryKey: ['dashboard-tickets'],
    queryFn: dashboardApi.ticketChart,
    staleTime: 60_000,
  })
  const { data: recentTickets = [] } = useQuery({
    queryKey: ['dashboard-recent-tickets'],
    queryFn: dashboardApi.recentTickets,
    staleTime: 60_000,
  })
  const { data: todayFlights = [] } = useQuery({
    queryKey: ['dashboard-today-flights'],
    queryFn: dashboardApi.todayFlights,
    staleTime: 60_000,
  })

  const kpis = [
    { label: 'Vé hôm nay', value: summary?.tongVeHomNay ?? 0, icon: <Ticket size={20} />, color: 'bg-blue-500' },
    { label: 'Doanh thu hôm nay', value: formatCurrency(summary?.doanhThuHomNay ?? 0), icon: <DollarSign size={20} />, color: 'bg-green-500' },
    { label: 'Chuyến bay hôm nay', value: summary?.soChuyenBayHomNay ?? 0, icon: <Plane size={20} />, color: 'bg-purple-500' },
    { label: 'Khách mới tháng này', value: summary?.soKhachMoiThangNay ?? 0, icon: <Users size={20} />, color: 'bg-amber-500' },
  ]

  if (loadingSummary) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-sm text-gray-500 mt-1">Hôm nay: {format(new Date(), 'dd/MM/yyyy')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card p-4 flex items-center gap-4">
            <div className={`${kpi.color} text-white p-2.5 rounded-lg`}>{kpi.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{kpi.label}</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="card p-4 lg:col-span-2">
          <h3 className="font-semibold text-sm text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp size={16} /> Doanh thu 30 ngày gần nhất
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="ngay"
                tickFormatter={(v) => { try { return format(parseISO(v), 'dd/MM') } catch { return v } }}
                tick={{ fontSize: 11 }}
              />
              <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Doanh thu']}
                labelFormatter={(v) => { try { return format(parseISO(v as string), 'dd/MM/yyyy') } catch { return v as string } }} />
              <Area type="monotone" dataKey="doanhThu" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Ticket class chart */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-gray-700 mb-4">Cơ cấu hạng vé</h3>
          {ticketChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={ticketChart} dataKey="soLuong" nameKey="hangVe" cx="50%" cy="50%" outerRadius={70} label={({ phanTram }) => `${phanTram.toFixed(1)}%`}>
                  {ticketChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip formatter={(v: number) => [v, 'Số vé']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Không có dữ liệu</div>
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent tickets */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm text-gray-700">Vé gần nhất</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-th">Mã vé</th>
                <th className="table-th">Khách hàng</th>
                <th className="table-th">Chuyến bay</th>
                <th className="table-th">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.map((t) => (
                <tr key={t.maVe} className="border-t hover:bg-gray-50">
                  <td className="table-td font-mono text-xs">{t.maVeCode}</td>
                  <td className="table-td">{t.khachHang.hoTen}</td>
                  <td className="table-td">{t.chuyenBay.maChuyenBayCode}</td>
                  <td className="table-td">
                    <span className={`badge ${TICKET_STATUS_COLOR[t.trangThaiVe]}`}>
                      {TICKET_STATUS_LABEL[t.trangThaiVe]}
                    </span>
                  </td>
                </tr>
              ))}
              {recentTickets.length === 0 && (
                <tr><td colSpan={4} className="table-td text-center text-gray-400">Không có vé</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Today's flights */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm text-gray-700">Chuyến bay hôm nay</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-th">Chuyến</th>
                <th className="table-th">Tuyến</th>
                <th className="table-th">Giờ bay</th>
                <th className="table-th">Ghế còn</th>
              </tr>
            </thead>
            <tbody>
              {todayFlights.map((f) => {
                const totalLeft = f.danhSachHangVe.reduce((s, h) => s + h.soGheCon, 0)
                return (
                  <tr key={f.maChuyenBay} className="border-t hover:bg-gray-50">
                    <td className="table-td font-medium">{f.maChuyenBayCode}</td>
                    <td className="table-td text-xs">{f.sanBayDi.maSanBay}→{f.sanBayDen.maSanBay}</td>
                    <td className="table-td">{formatDateTime(f.ngayGioBay)}</td>
                    <td className="table-td">
                      <Badge variant={totalLeft > 0 ? 'green' : 'red'}>{totalLeft}</Badge>
                    </td>
                  </tr>
                )
              })}
              {todayFlights.length === 0 && (
                <tr><td colSpan={4} className="table-td text-center text-gray-400">Không có chuyến bay</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
