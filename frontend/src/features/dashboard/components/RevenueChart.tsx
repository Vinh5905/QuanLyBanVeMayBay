import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

interface RevenueDataPoint {
  name: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  title?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, title = 'Biểu đồ doanh thu' }) => {
  return (
    <div className="dashboard-chart-container">
      <h3 className="dashboard-chart-title">{title}</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Line type="monotone" dataKey="revenue" stroke="var(--ds-color-primary)" strokeWidth={3} activeDot={{ r: 8 }} />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--ds-color-text-secondary)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--ds-color-text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000000}M`} />
            <Tooltip 
              formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0)}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
