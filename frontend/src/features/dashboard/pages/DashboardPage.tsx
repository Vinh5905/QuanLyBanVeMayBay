import React from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { AdminStaffDashboard } from '../components/AdminStaffDashboard';
import { AgentDashboard } from '../components/AgentDashboard';
import { UserPortalDashboard } from '../components/UserPortalDashboard';

export const DashboardPage: React.FC = () => {
  const { role } = useAuth();

  switch (role) {
    case 'Admin':
    case 'Staff':
      return <AdminStaffDashboard />;
    case 'Agent':
      return <AgentDashboard />;
    case 'User':
      return <UserPortalDashboard />;
    default:
      return <div>Role không xác định. Vui lòng đăng nhập lại.</div>;
  }
};
