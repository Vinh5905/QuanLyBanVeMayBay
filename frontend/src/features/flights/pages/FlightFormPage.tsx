import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { Button } from '../../../components/Button/Button';
import { FormField, Input } from '../../../components/FormField/FormField';
import { LoadingState } from '../../../components/LoadingState/LoadingState';
import { AirportSelect } from '../components/AirportSelect';
import { useFlightForm } from '../hooks/useFlightForm';

export const FlightFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const flightId = id ? Number(id) : undefined;
  const rolePrefix = role?.toLowerCase();

  const {
    formState, errors, isSubmitting, isLoading, serverError, isEditMode,
    setField, addHangVe, removeHangVe, updateHangVe,
    addTrungGian, removeTrungGian, updateTrungGian,
    submit,
  } = useFlightForm(flightId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submit();
    if (success) {
      navigate(`/${rolePrefix}/flights`);
    }
  };

  if (isLoading) return <LoadingState text="Đang tải thông tin chuyến bay..." />;

  return (
    <div>
      <div style={{ marginBottom: 16, fontSize: 14, color: '#64748B' }}>
        <Link to={`/${rolePrefix}/flights`} style={{ color: '#64748B', textDecoration: 'none' }}>Chuyến bay</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: '#0F172A' }}>{isEditMode ? 'Chỉnh sửa' : 'Thêm mới'}</span>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24 }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 600, color: '#0F172A' }}>
          {isEditMode ? 'Chỉnh sửa chuyến bay' : 'Thêm chuyến bay mới'}
        </h2>

        {serverError && (
          <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, color: '#DC2626', fontSize: 14, marginBottom: 20 }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isEditMode && (
            <FormField label="Mã chuyến bay">
              <Input type="text" value={formState.maChuyenBayCode} disabled />
            </FormField>
          )}

          {!isEditMode && (
            <FormField label="Mã chuyến bay" required error={errors.maChuyenBayCode}>
              <Input
                type="text"
                value={formState.maChuyenBayCode}
                onChange={e => setField('maChuyenBayCode', e.target.value)}
                placeholder="VD: VN123"
                hasError={!!errors.maChuyenBayCode}
              />
            </FormField>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField label="Sân bay đi" required error={errors.sanBayDi}>
              <AirportSelect value={formState.sanBayDi} onChange={v => setField('sanBayDi', v)} placeholder="Chọn sân bay đi" error={errors.sanBayDi} />
            </FormField>
            <FormField label="Sân bay đến" required error={errors.sanBayDen || (errors.sanBayDen ? '' : undefined)}>
              <AirportSelect value={formState.sanBayDen} onChange={v => setField('sanBayDen', v)} placeholder="Chọn sân bay đến" error={errors.sanBayDen} />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <FormField label="Ngày giờ bay" required error={errors.ngayGioBay}>
              <Input
                type="datetime-local"
                value={formState.ngayGioBay}
                onChange={e => setField('ngayGioBay', e.target.value)}
                hasError={!!errors.ngayGioBay}
              />
            </FormField>
            <FormField label="Thời gian bay (phút)" required error={errors.thoiGianBay}>
              <Input
                type="number"
                min={30}
                value={formState.thoiGianBay}
                onChange={e => setField('thoiGianBay', e.target.value)}
                hasError={!!errors.thoiGianBay}
              />
            </FormField>
            <FormField label="Giá cơ bản (VNĐ)" required error={errors.giaCoBan}>
              <Input
                type="number"
                min={0}
                value={formState.giaCoBan}
                onChange={e => setField('giaCoBan', e.target.value)}
                hasError={!!errors.giaCoBan}
              />
            </FormField>
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Hạng vé</h3>
              <Button type="button" variant="outline" size="sm" onClick={addHangVe}>+ Thêm hạng vé</Button>
            </div>
            {errors.danhSachHangVe && (
              <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 8 }}>{errors.danhSachHangVe}</div>
            )}
            {formState.danhSachHangVe.map((hv, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', padding: 12, background: '#F8FAFC', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 500, paddingBottom: 12 }}>Hạng {idx + 1}</div>
                <FormField label="Số ghế">
                  <Input type="number" min={0} value={hv.soLuong} onChange={e => updateHangVe(idx, 'soLuong', Number(e.target.value))} style={{ width: 100 }} />
                </FormField>
                <FormField label="Đơn giá (VNĐ)">
                  <Input type="number" min={0} value={hv.donGia} onChange={e => updateHangVe(idx, 'donGia', Number(e.target.value))} style={{ width: 140 }} />
                </FormField>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeHangVe(idx)} style={{ marginBottom: 12, color: '#DC2626' }}>Xóa</Button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Sân bay trung gian</h3>
              <Button type="button" variant="outline" size="sm" onClick={addTrungGian} disabled={formState.danhSachTrungGian.length >= 2}>
                + Thêm sân bay TG
              </Button>
            </div>
            {errors.danhSachTrungGian && (
              <div style={{ color: '#DC2626', fontSize: 13, marginBottom: 8 }}>{errors.danhSachTrungGian}</div>
            )}
            {formState.danhSachTrungGian.map((tg, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', padding: 12, background: '#F8FAFC', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ flex: 2 }}>
                  <FormField label="Sân bay" required>
                    <AirportSelect value={tg.maSanBay} onChange={v => updateTrungGian(idx, 'maSanBay', v)} />
                  </FormField>
                </div>
                <div style={{ flex: 1 }}>
                  <FormField label="Thời gian dừng (phút)">
                    <Input type="number" min={10} value={tg.thoiGianDung} onChange={e => updateTrungGian(idx, 'thoiGianDung', Number(e.target.value))} />
                  </FormField>
                </div>
                <div style={{ flex: 1 }}>
                  <FormField label="Ghi chú">
                    <Input value={tg.ghiChu || ''} onChange={e => updateTrungGian(idx, 'ghiChu', e.target.value)} />
                  </FormField>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeTrungGian(idx)} style={{ marginBottom: 12, color: '#DC2626' }}>Xóa</Button>
              </div>
            ))}
            {formState.danhSachTrungGian.length === 0 && (
              <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>Chưa có sân bay trung gian. Chuyến bay sẽ bay thẳng.</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 32, paddingTop: 20, borderTop: '1px solid #E2E8F0' }}>
            <Button type="button" variant="ghost" onClick={() => navigate(`/${rolePrefix}/flights`)}>Hủy</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {isEditMode ? 'Lưu thay đổi' : 'Tạo chuyến bay'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
