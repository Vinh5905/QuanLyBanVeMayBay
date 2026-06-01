import React from 'react';
import { StatCard } from './StatCard';
import { RevenueChart } from './RevenueChart';

const mockRevenueData = [
  { name: 'Tháng 1', revenue: 400000000 },
  { name: 'Tháng 2', revenue: 300000000 },
  { name: 'Tháng 3', revenue: 200000000 },
  { name: 'Tháng 4', revenue: 278000000 },
  { name: 'Tháng 5', revenue: 189000000 },
  { name: 'Tháng 6', revenue: 239000000 },
  { name: 'Tháng 7', revenue: 349000000 },
];

export const AdminStaffDashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Tổng quan hệ thống</h1>
          <p className="dashboard-subtitle">Xin chào, theo dõi tình hình kinh doanh hôm nay.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard 
          title="Doanh thu hôm nay" 
          value="45.200.000 ₫" 
          icon="💰" 
          trend={{ value: 12.5, isPositive: true }} 
        />
        <StatCard 
          title="Vé đã bán" 
          value="128" 
          icon="🎫" 
          trend={{ value: 5.2, isPositive: true }} 
        />
        <StatCard 
          title="Chuyến bay trong ngày" 
          value="42" 
          icon="" 
          trend={{ value: 2.1, isPositive: false }} 
        />
        <StatCard 
          title="Khách hàng mới" 
          value="89" 
          icon="👥" 
          trend={{ value: 8.4, isPositive: true }} 
        />
      </div>

      <div className="dashboard-grid-2">
        <RevenueChart data={mockRevenueData} title="Biểu đồ doanh thu 7 tháng gần nhất" />
        
        <div className="dashboard-chart-container">
          <h3 className="dashboard-chart-title">Chuyến bay sắp khởi hành</h3>
          <ul className="dashboard-list">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="dashboard-list-item">
                <div>
                  <div className="list-item-title">VN-{100 + i} | SGN ✈ HAN</div>
                  <div className="list-item-subtitle">Khởi hành: 14:30 | Cửa: 0{i}</div>
                </div>
                <div className="list-item-action">Xem</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
