import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../../../api/axios';
import { Button } from '../../../components/Button/Button';
import { FormField, Input } from '../../../components/FormField/FormField';
import type { AuthResponse } from '../../../types/auth';
import './LoginPage.css';

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
      const response = await apiClient.post<AuthResponse>('/auth/login', { username, password });
      const { accessToken, refreshToken, userInfo } = response.data.data;
      
      login(accessToken, refreshToken, userInfo);
      
      // Route based on role or 'from' location
      if (from) {
        navigate(from, { replace: true });
      } else {
        const rolePathMap: Record<string, string> = {
          Admin: '/admin',
          Staff: '/staff',
          Agent: '/agent',
          User: '/',
        };
        navigate(rolePathMap[userInfo.role] || '/', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Thông tin đăng nhập không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">✈️</div>
          <h1 className="auth-tagline">Hệ thống Quản lý Bán Vé Máy Bay</h1>
          <p className="auth-description">
            Giải pháp toàn diện cho việc quản lý, phân phối và đặt giữ chỗ vé máy bay, 
            dành cho đại lý và nhân viên hàng không.
          </p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <span className="auth-form-logo-icon">✈️</span>
            <h2>QAirline</h2>
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
            Chưa có tài khoản khách hàng? <Link to="/register" className="auth-link">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
