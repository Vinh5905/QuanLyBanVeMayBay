import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/axios';
import { Button } from '../../../components/Button/Button';
import { FormField, Input } from '../../../components/FormField/FormField';
import './LoginPage.css';

const AirlineIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-.9 1.1s.4 1 .9 1l7.1 1.2L7.5 12H4c-.5 0-1 .2-1.4.6l-2 2c-.3.3-.4.8-.2 1.2.2.4.6.7 1 .7l4 .5 1 4c.1.4.4.7.7 1 .4.2.9.1 1.2-.2l2-2c.4-.4.6-.9.6-1.4v-3.5l3.8-1.3 1.2 7.1c.1.5.5.9 1 .9s1-.4 1.1-.9z"/>
  </svg>
);

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = (location.state as any)?.resetToken || sessionStorage.getItem('passwordResetToken');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resetToken) {
      setError('Phiên đặt lại mật khẩu không hợp lệ. Vui lòng xác thực OTP lại.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        resetToken,
        matKhauMoi: password,
      });
      sessionStorage.removeItem('passwordResetToken');
      navigate('/login', { state: { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="auth-brand-icon"><AirlineIcon /></div>
            <span className="auth-brand-name">QAirline</span>
          </div>
          <h1 className="auth-tagline">Tạo mật khẩu mới</h1>
          <p className="auth-description">
            Mật khẩu mới sẽ được mã hóa và thay thế mật khẩu cũ của tài khoản.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <div className="auth-form-logo"><AirlineIcon /></div>
            <span className="auth-form-brand">QAirline</span>
          </div>

          <h1 className="auth-title">Đặt lại mật khẩu</h1>
          <p className="auth-subtitle">Nhập mật khẩu mới cho tài khoản của bạn</p>

          {error && <div className="auth-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <FormField label="Mật khẩu mới" required>
              <Input
                type="password"
                placeholder="Ít nhất 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Xác nhận mật khẩu" required>
              <Input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </FormField>

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
              Cập nhật mật khẩu
            </Button>
          </form>

          <div className="auth-register-prompt" style={{ marginTop: 'var(--space-6)' }}>
            <Link to="/login" className="auth-link">Quay lại đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
