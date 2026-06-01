import React from 'react';
import { StatCard } from './StatCard';
import './Dashboard.css';

export const AgentDashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Đại lý bán vé</h1>
          <p className="dashboard-subtitle">Quản lý đặt chỗ và doanh số của bạn.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard 
          title="Doanh số tháng này" 
          value="12.500.000 ₫" 
          icon="💳" 
          trend={{ value: 4.2, isPositive: true }} 
        />
        <StatCard 
          title="Vé đã đặt" 
          value="45" 
          icon="🎫" 
          trend={{ value: 1.5, isPositive: true }} 
        />
        <StatCard 
          title="Vé chờ thanh toán" 
          value="3" 
          icon="⏳" 
        />
      </div>

      <div className="dashboard-grid-2">
        <div className="dashboard-chart-container">
          <h3 className="dashboard-chart-title">Vé đặt gần đây</h3>
          <ul className="dashboard-list">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="dashboard-list-item">
                <div>
                  <div className="list-item-title">PNR: {Math.random().toString(36).substring(2, 8).toUpperCase()}</div>
                  <div className="list-item-subtitle">SGN ✈ DAD | Ngày bay: 15/07/2026</div>
                </div>
                <div className="list-item-action">Chi tiết</div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="dashboard-chart-container">
          <h3 className="dashboard-chart-title">Hành động nhanh</h3>
          <ul className="dashboard-list">
            <li className="dashboard-list-item" style={{ cursor: 'pointer' }}>
              <div className="list-item-title" style={{ color: 'var(--ds-color-primary)' }}>+ Đặt vé mới</div>
            </li>
            <li className="dashboard-list-item" style={{ cursor: 'pointer' }}>
              <div className="list-item-title" style={{ color: 'var(--ds-color-primary)' }}>Tra cứu mã đặt chỗ</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
