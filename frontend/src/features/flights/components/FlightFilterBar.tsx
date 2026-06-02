import React from 'react';
import { Button } from '../../../components/Button/Button';
import { AirportSelect } from './AirportSelect';

export interface FilterValues {
  sanBayDi: string;
  sanBayDen: string;
  ngayBay: string;
  trangThai: string;
  sort: string;
}

interface FlightFilterBarProps {
  values: FilterValues;
  onChange: (key: keyof FilterValues, value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

const trangThaiOptions = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Đang hoạt động', value: 'SCHEDULED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
  { label: 'Hoàn thành', value: 'COMPLETED' },
];

const sortOptions = [
  { label: 'Giờ bay (sớm → muộn)', value: 'ngayGioBay,asc' },
  { label: 'Giờ bay (muộn → sớm)', value: 'ngayGioBay,desc' },
  { label: 'Thời gian bay (ngắn → dài)', value: 'thoiGianBay,asc' },
  { label: 'Thời gian bay (dài → ngắn)', value: 'thoiGianBay,desc' },
];

export const FlightFilterBar: React.FC<FlightFilterBarProps> = ({ values, onChange, onSearch, onReset }) => {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end',
      padding: '16px 20px', background: '#fff', borderRadius: 12,
      border: '1px solid #E2E8F0', marginBottom: 16,
    }}>
      <div style={{ flex: '1 1 200px', minWidth: 160 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Sân bay đi</label>
        <AirportSelect value={values.sanBayDi} onChange={v => onChange('sanBayDi', v)} placeholder="Chọn sân bay đi" />
      </div>
      <div style={{ flex: '1 1 200px', minWidth: 160 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Sân bay đến</label>
        <AirportSelect value={values.sanBayDen} onChange={v => onChange('sanBayDen', v)} placeholder="Chọn sân bay đến" />
      </div>
      <div style={{ flex: '0 1 180px', minWidth: 140 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Ngày bay</label>
        <input
          className="ds-input"
          type="date"
          value={values.ngayBay}
          onChange={e => onChange('ngayBay', e.target.value)}
        />
      </div>
      <div style={{ flex: '0 1 160px', minWidth: 130 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Trạng thái</label>
        <select
          className="ds-input"
          value={values.trangThai}
          onChange={e => onChange('trangThai', e.target.value)}
        >
          {trangThaiOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div style={{ flex: '0 1 200px', minWidth: 160 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Sắp xếp</label>
        <select
          className="ds-input"
          value={values.sort}
          onChange={e => onChange('sort', e.target.value)}
        >
          {sortOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, paddingBottom: 1 }}>
        <Button variant="primary" onClick={onSearch}>Tìm kiếm</Button>
        <Button variant="ghost" onClick={onReset}>Đặt lại</Button>
      </div>
    </div>
  );
};
