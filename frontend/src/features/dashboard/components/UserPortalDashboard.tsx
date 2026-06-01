import React from 'react';
import './Dashboard.css';

export const UserPortalDashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Hành trình của tôi</h1>
          <p className="dashboard-subtitle">Quản lý các chuyến bay bạn đã đặt.</p>
        </div>
      </div>

      <div className="dashboard-grid-2" style={{ gridTemplateColumns: '1fr' }}>
        <div className="dashboard-chart-container">
          <h3 className="dashboard-chart-title">Chuyến bay sắp tới</h3>
          <ul className="dashboard-list">
            <li className="dashboard-list-item" style={{ background: 'rgba(2, 99, 255, 0.05)', border: '1px solid var(--ds-color-primary)' }}>
              <div>
                <div className="list-item-title">VN-204 | SGN ✈ HAN</div>
                <div className="list-item-subtitle">Khởi hành: 10:00 - 15/07/2026 | Tình trạng: Đã xác nhận</div>
              </div>
              <div className="list-item-action">Check-in Online</div>
            </li>
          </ul>
        </div>
        
        <div className="dashboard-chart-container">
          <h3 className="dashboard-chart-title">Lịch sử đặt vé</h3>
          <ul className="dashboard-list">
            {[1, 2].map((i) => (
              <li key={i} className="dashboard-list-item">
                <div>
                  <div className="list-item-title">VN-10{i} | HAN ✈ DAD</div>
                  <div className="list-item-subtitle">Hoàn thành: 0{i}/05/2026</div>
                </div>
                <div className="list-item-action" style={{ color: 'var(--ds-color-text-secondary)' }}>Đã bay</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
