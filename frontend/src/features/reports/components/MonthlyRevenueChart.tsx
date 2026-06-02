import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { MonthlyReportRow } from '../../../types/report'

interface Props {
  data: MonthlyReportRow[]
}

export function MonthlyRevenueChart({ data }: Props) {
  const chartData = (data || []).map(r => ({
    name: r.maChuyenBayCode,
    doanhThuVe: r.doanhThuVe || 0,
    doanhThuHanhLy: r.doanhThuHanhLy || 0,
  }))

  return (
    <div className="dashboard-chart-container" style={{ marginBottom: 24 }}>
      <h3 className="dashboard-chart-title">Biểu đồ doanh thu theo chuyến bay</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="5 5" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
            <Tooltip
              formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0)}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend />
            <Bar dataKey="doanhThuVe" name="DT vé" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="doanhThuHanhLy" name="DT hành lý" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
