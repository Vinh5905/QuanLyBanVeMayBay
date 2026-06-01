import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../../api/axios';
import { Button } from '../../../components/Button/Button';
import { FormField, Input } from '../../../components/FormField/FormField';
import './LoginPage.css'; // Reuse layout styles

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
      
      // Success, redirect to login
      navigate('/login', { state: { message: 'Đăng ký thành công, vui lòng đăng nhập.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
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
            Tạo tài khoản khách hàng để trải nghiệm đặt vé nhanh chóng và tiện lợi.
          </p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <span className="auth-form-logo-icon">✈️</span>
            <h2>QAirline</h2>
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
            
            <div style={{ marginTop: '16px' }}>
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                fullWidth 
                isLoading={loading}
              >
                Đăng ký
              </Button>
            </div>
          </form>
          
          <div className="auth-register-prompt" style={{ marginTop: '24px' }}>
            Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
