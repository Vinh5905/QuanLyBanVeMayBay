import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../../api/axios';
import { Button } from '../../../components/Button/Button';
import { FormField, Input } from '../../../components/FormField/FormField';
import './LoginPage.css';

const AirlineIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-.9 1.1s.4 1 .9 1l7.1 1.2L7.5 12H4c-.5 0-1 .2-1.4.6l-2 2c-.3.3-.4.8-.2 1.2.2.4.6.7 1 .7l4 .5 1 4c.1.4.4.7.7 1 .4.2.9.1 1.2-.2l2-2c.4-.4.6-.9.6-1.4v-3.5l3.8-1.3 1.2 7.1c.1.5.5.9 1 .9s1-.4 1.1-.9z"/>
  </svg>
);

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await apiClient.post('/auth/register', {
        tenDangNhap: formData.username,
        email: formData.email,
        hoTen: formData.fullName,
        matKhau: formData.password
      });
      navigate('/login', { state: { message: 'Đăng ký thành công, vui lòng đăng nhập.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
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

          <h1 className="auth-tagline">Tham gia cùng hàng nghìn khách hàng</h1>
          <p className="auth-description">
            Tạo tài khoản để trải nghiệm đặt vé nhanh chóng, theo dõi hành trình và check-in trực tuyến dễ dàng.
          </p>

          <ul className="auth-features">
            <li className="auth-feature-item">
              <span className="auth-feature-dot" />
              Đặt vé nhanh chỉ với vài bước đơn giản
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-dot" />
              Theo dõi trạng thái chuyến bay theo thời gian thực
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-dot" />
              Check-in trực tuyến và lưu thẻ lên máy bay
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-dot" />
              Lịch sử đặt vé và hóa đơn điện tử
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

          <h1 className="auth-title">Đăng ký tài khoản</h1>
          <p className="auth-subtitle">Điền thông tin bên dưới để trở thành thành viên</p>

          {error && <div className="auth-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <FormField label="Họ và tên" required>
              <Input
                type="text"
                name="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Email" required>
              <Input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Tên đăng nhập" required>
              <Input
                type="text"
                name="username"
                placeholder="Tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Mật khẩu" required>
              <Input
                type="password"
                name="password"
                placeholder="Ít nhất 6 ký tự"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Xác nhận mật khẩu" required>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </FormField>

            <div style={{ marginTop: 'var(--space-2)' }}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
              >
                Tạo tài khoản
              </Button>
            </div>
          </form>

          <div className="auth-register-prompt" style={{ marginTop: 'var(--space-6)' }}>
            Đã có tài khoản?{' '}
            <Link to="/login" className="auth-link">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
