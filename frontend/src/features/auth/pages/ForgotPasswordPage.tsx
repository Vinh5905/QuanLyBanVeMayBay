import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/axios';
import { Button } from '../../../components/Button/Button';
import { FormField, Input } from '../../../components/FormField/FormField';
import './LoginPage.css';

const AirlineIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-.9 1.1s.4 1 .9 1l7.1 1.2L7.5 12H4c-.5 0-1 .2-1.4.6l-2 2c-.3.3-.4.8-.2 1.2.2.4.6.7 1 .7l4 .5 1 4c.1.4.4.7.7 1 .4.2.9.1 1.2-.2l2-2c.4-.4.6-.9.6-1.4v-3.5l3.8-1.3 1.2 7.1c.1.5.5.9 1 .9s1-.4 1.1-.9z"/>
  </svg>
);

interface VerifyOtpResponse {
  status: string;
  data: {
    resetToken: string;
    expiresInSeconds: number;
  };
}

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setOtpSent(true);
      setMessage('Mã OTP đã được gửi tới email của bạn.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await apiClient.post<VerifyOtpResponse>('/auth/verify-reset-otp', {
        email,
        otp,
      });
      const resetToken = response.data.data.resetToken;
      sessionStorage.setItem('passwordResetToken', resetToken);
      navigate('/reset-password', { state: { resetToken } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ.');
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
          <h1 className="auth-tagline">Khôi phục tài khoản</h1>
          <p className="auth-description">
            Nhập email tài khoản để nhận mã OTP đặt lại mật khẩu.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <div className="auth-form-logo"><AirlineIcon /></div>
            <span className="auth-form-brand">QAirline</span>
          </div>

          <h1 className="auth-title">Quên mật khẩu?</h1>
          <p className="auth-subtitle">
            {otpSent ? 'Nhập mã OTP 6 số trong email của bạn' : 'Chúng tôi sẽ gửi mã OTP tới email của bạn'}
          </p>

          {error && <div className="auth-error-banner">{error}</div>}
          {message && <div className="auth-error-banner" style={{ background: '#ECFDF5', color: '#047857', borderColor: '#A7F3D0' }}>{message}</div>}

          {!otpSent ? (
            <form onSubmit={sendOtp} className="auth-form">
              <FormField label="Email" required>
                <Input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormField>

              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
                Gửi mã OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="auth-form">
              <FormField label="Email" required>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </FormField>

              <FormField label="Mã OTP" required>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Nhập 6 chữ số"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </FormField>

              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
                Xác thực OTP
              </Button>

              <Button type="button" variant="ghost" size="md" fullWidth onClick={() => setOtpSent(false)}>
                Đổi email
              </Button>
            </form>
          )}

          <div className="auth-register-prompt" style={{ marginTop: 'var(--space-6)' }}>
            <Link to="/login" className="auth-link">Quay lại đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
