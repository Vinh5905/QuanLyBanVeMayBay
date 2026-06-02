import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { flightApi } from '../../../api/flightApi';
import { Badge } from '../../../components/Badge/Badge';
import { Button } from '../../../components/Button/Button';
import { LoadingState } from '../../../components/LoadingState/LoadingState';
import { ErrorState } from '../../../components/ErrorState/ErrorState';
import type { FlightResponse } from '../../../types/flight';

const statusBadge: Record<string, { variant: 'success' | 'error' | 'info' | 'neutral'; label: string }> = {
  SCHEDULED: { variant: 'success', label: 'Đang hoạt động' },
  CANCELLED: { variant: 'error', label: 'Đã hủy' },
  COMPLETED: { variant: 'neutral', label: 'Hoàn thành' },
};

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export const FlightDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const canManage = role === 'Admin' || role === 'Staff';

  const [flight, setFlight] = useState<FlightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    flightApi.getFlightById(Number(id))
      .then(res => {
        if (res.data.status === 'success') setFlight(res.data.data);
        else setError(res.data.message || 'Không tìm thấy chuyến bay');
      })
      .catch(err => setError(err.response?.data?.message || err.message || 'Lỗi tải dữ liệu'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!flight || !window.confirm(`Xác nhận hủy chuyến bay ${flight.maChuyenBayCode}?`)) return;
    setIsCancelling(true);
    try {
      await flightApi.cancelFlight(flight.maChuyenBay);
      const res = await flightApi.getFlightById(flight.maChuyenBay);
      if (res.data.status === 'success') setFlight(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể hủy chuyến bay');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) return <LoadingState text="Đang tải thông tin chuyến bay..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!flight) return <ErrorState message="Không tìm thấy chuyến bay" />;

  const s = statusBadge[flight.trangThaiChuyenBay] || { variant: 'neutral' as const, label: flight.trangThaiChuyenBay };

  const rolePrefix = role?.toLowerCase();

  return (
    <div>
      <div style={{ marginBottom: 16, fontSize: 14, color: '#64748B' }}>
        <Link to={`/${rolePrefix}/flights`} style={{ color: '#64748B', textDecoration: 'none' }}>Chuyến bay</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: '#0F172A' }}>{flight.maChuyenBayCode}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0F172A' }}>{flight.maChuyenBayCode}</h2>
          <Badge variant={s.variant}>{s.label}</Badge>
        </div>
        {canManage && flight.trangThaiChuyenBay === 'SCHEDULED' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" onClick={() => navigate(`/${rolePrefix}/flights/${flight.maChuyenBay}/edit`)}>
              Chỉnh sửa
            </Button>
            <Button variant="danger" onClick={handleCancel} isLoading={isCancelling}>
              Hủy chuyến bay
            </Button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Thông tin chuyến bay
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', fontSize: 14 }}>
            <InfoRow label="Sân bay đi" value={`${flight.sanBayDi.tenSanBay} (${flight.sanBayDi.maSanBay})`} />
            <InfoRow label="Sân bay đến" value={`${flight.sanBayDen.tenSanBay} (${flight.sanBayDen.maSanBay})`} />
            <InfoRow label="Ngày giờ bay" value={formatDateTime(flight.ngayGioBay)} />
            <InfoRow label="Thời gian bay" value={`${flight.thoiGianBay} phút`} />
            <InfoRow label="Giá cơ bản" value={`${flight.giaCoBan.toLocaleString('vi-VN')} VNĐ`} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Thông tin ghế
          </h3>
          {flight.danhSachHangVe.map(h => {
            const pct = h.soLuong > 0 ? Math.round((h.soGheDaDat / h.soLuong) * 100) : 0;
            return (
              <div key={h.maHangVe} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>{h.tenHangVe}</span>
                  <span style={{ color: '#64748B' }}>{h.soGheDaDat}/{h.soLuong} đã đặt</span>
                </div>
                <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#DC2626' : pct >= 70 ? '#D97706' : '#16A34A', borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{h.soGheCon} ghế trống · {h.donGia.toLocaleString('vi-VN')} VNĐ/vé</div>
              </div>
            );
          })}
        </div>
      </div>

      {flight.danhSachTrungGian.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Sân bay trung gian
          </h3>
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div style={{ position: 'absolute', left: 10, top: 8, bottom: 8, width: 2, background: '#E2E8F0' }} />
            {flight.danhSachTrungGian.sort((a, b) => a.thuTu - b.thuTu).map((tg, idx) => (
              <div key={idx} style={{ position: 'relative', paddingBottom: 16 }}>
                <div style={{ position: 'absolute', left: -18, top: 4, width: 12, height: 12, borderRadius: '50%', background: '#1D4ED8', border: '2px solid #fff' }} />
                <div style={{ fontSize: 14 }}>
                  <span style={{ fontWeight: 500 }}>{tg.tenSanBay} ({tg.maSanBay})</span>
                  <span style={{ color: '#64748B', marginLeft: 8 }}>— {tg.thanhPho}</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Dừng {tg.thoiGianDung} phút{tg.ghiChu ? ` · ${tg.ghiChu}` : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 500, color: '#0F172A' }}>{value}</div>
    </div>
  );
}
