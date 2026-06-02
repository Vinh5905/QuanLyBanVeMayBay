import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { YearlyReportRow } from '../../../types/report'

interface Props {
  data: YearlyReportRow[]
}

export function YearlyRevenueChart({ data }: Props) {
  const chartData = (data || []).map(r => ({
    name: `T${r.thang}`,
    doanhThu: r.doanhThu || 0,
    soVe: r.soVe || 0,
  }))

  return (
    <div className="dashboard-chart-container" style={{ marginBottom: 24 }}>
      <h3 className="dashboard-chart-title">Biểu đồ doanh thu theo tháng</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Line type="monotone" dataKey="doanhThu" name="Doanh thu" stroke="#1D4ED8" strokeWidth={3} activeDot={{ r: 8 }} />
            <CartesianGrid stroke="var(--border)" strokeDasharray="5 5" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
            <Tooltip
              formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0)}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
