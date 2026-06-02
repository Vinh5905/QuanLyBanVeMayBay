import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import './Dashboard.css'
import type { TicketClassChartData } from '../../../types/dashboard'

const COLORS = ['#1D4ED8', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899']

interface DonutChartProps {
  data: TicketClassChartData[]
  title?: string
}

export function DonutChart({ data, title = 'Phân bổ hạng vé' }: DonutChartProps) {
  const chartData = (data || []).map(d => ({
    name: d.hangVe,
    value: d.soLuong,
    phanTram: d.phanTram,
  }))

  return (
    <div className="dashboard-chart-container">
      <h3 className="dashboard-chart-title">{title}</h3>
      {chartData.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Chưa có dữ liệu</p>
      ) : (
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [`${value} vé`, name]}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend
                formatter={(value: string) => <span style={{ color: 'var(--text-main)', fontSize: 13 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
