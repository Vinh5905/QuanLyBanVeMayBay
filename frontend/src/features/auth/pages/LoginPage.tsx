import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../../../api/axios';
import { Button } from '../../../components/Button/Button';
import { FormField, Input } from '../../../components/FormField/FormField';
import type { AuthResponse, Role } from '../../../types/auth';
import './LoginPage.css';

const AirlineIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-.9 1.1s.4 1 .9 1l7.1 1.2L7.5 12H4c-.5 0-1 .2-1.4.6l-2 2c-.3.3-.4.8-.2 1.2.2.4.6.7 1 .7l4 .5 1 4c.1.4.4.7.7 1 .4.2.9.1 1.2-.2l2-2c.4-.4.6-.9.6-1.4v-3.5l3.8-1.3 1.2 7.1c.1.5.5.9 1 .9s1-.4 1.1-.9z"/>
  </svg>
);

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', { tenDangNhap: username, matKhau: password });
      const { accessToken, refreshToken, userInfo } = response.data.data;

      const roleMap: Record<string, Role> = {
        Admin: 'Admin',
        QuanTriVien: 'Admin',
        NhanVien: 'Staff',
        DaiLy: 'Agent',
        KhachHang: 'User',
      }
      const mappedUser = {
        id: String(userInfo.maTaiKhoan),
        username: userInfo.tenDangNhap,
        email: userInfo.email,
        role: roleMap[userInfo.vaiTro] || 'User',
        fullName: userInfo.tenDangNhap,
      };

      login(accessToken, refreshToken, mappedUser);

      if (from) {
        navigate(from, { replace: true });
      } else {
        const rolePathMap: Record<string, string> = {
          Admin: '/admin',
          Staff: '/staff',
          Agent: '/agent',
          User: '/',
        };
        navigate(rolePathMap[mappedUser.role] || '/', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Thông tin đăng nhập không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Branding Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <AirlineIcon />
            </div>
            <span className="auth-brand-name">QAirline</span>
          </div>

          <h1 className="auth-tagline">Quản lý vé máy bay thông minh</h1>
          <p className="auth-description">
            Nền tảng quản lý, phân phối và đặt giữ chỗ vé máy bay dành cho đại lý và nhân viên hàng không.
          </p>

          <ul className="auth-features">
            <li className="auth-feature-item">
              <span className="auth-feature-dot" />
              Đặt vé và quản lý đặt chỗ theo thời gian thực
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-dot" />
              Check-in trực tuyến và phát hành thẻ lên máy bay
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-dot" />
              Báo cáo doanh thu và thống kê toàn diện
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-dot" />
              Phân quyền đa cấp: Admin, Nhân viên, Đại lý
            </li>
          </ul>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <div className="auth-form-logo">
              <AirlineIcon />
            </div>
            <span className="auth-form-brand">QAirline</span>
          </div>

          <h1 className="auth-title">Đăng nhập</h1>
          <p className="auth-subtitle">Nhập thông tin tài khoản để tiếp tục</p>

          {error && <div className="auth-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <FormField label="Tên đăng nhập" required>
              <Input
                type="text"
                placeholder="Nhập tên đăng nhập hoặc email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormField>

            <FormField label="Mật khẩu" required>
              <Input
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>

            <div className="auth-form-actions">
              <label className="auth-checkbox">
                <input type="checkbox" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forgot-password" className="auth-link">Quên mật khẩu?</Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
            >
              Đăng nhập
            </Button>
          </form>

          <div className="auth-divider">
            <span>HOẶC</span>
          </div>

          <div className="auth-register-prompt">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="auth-link">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
