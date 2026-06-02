import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { Button } from '../../../components/Button/Button';
import { DataTable } from '../../../components/DataTable/DataTable';
import { Pagination } from '../../../components/Pagination/Pagination';
import { Badge } from '../../../components/Badge/Badge';
import { LoadingState } from '../../../components/LoadingState/LoadingState';
import { ErrorState } from '../../../components/ErrorState/ErrorState';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { AirportSelect } from '../components/AirportSelect';
import { flightApi } from '../../../api/flightApi';
import type { FlightResponse, PaginationInfo } from '../../../types/flight';

const statusBadge: Record<string, { variant: 'success' | 'error' | 'info' | 'neutral'; label: string }> = {
  SCHEDULED: { variant: 'success', label: 'Đang hoạt động' },
  CANCELLED: { variant: 'error', label: 'Đã hủy' },
  COMPLETED: { variant: 'neutral', label: 'Hoàn thành' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export const FlightSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const [sanBayDi, setSanBayDi] = useState('');
  const [sanBayDen, setSanBayDen] = useState('');
  const [ngayBay, setNgayBay] = useState('');
  const [page, setPage] = useState(1);

  const [results, setResults] = useState<FlightResponse[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const res = await flightApi.searchFlights({
        sanBayDi: sanBayDi || undefined,
        sanBayDen: sanBayDen || undefined,
        ngayBay: ngayBay || undefined,
        page: page - 1,
        size: 20,
      });
      if (res.data.status === 'success') {
        setResults(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setError(res.data.message || 'Lỗi tìm kiếm');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể kết nối đến máy chủ');
    } finally {
      setIsLoading(false);
    }
  }, [sanBayDi, sanBayDen, ngayBay, page]);

  const handleReset = () => {
    setSanBayDi('');
    setSanBayDen('');
    setNgayBay('');
    setPage(1);
    setResults([]);
    setPagination(null);
    setHasSearched(false);
    setError(null);
  };

  const columns = [
    { key: 'maChuyenBayCode', header: 'Mã CB' },
    {
      key: 'route',
      header: 'Hành trình',
      render: (f: FlightResponse) => `${f.sanBayDi.tenSanBay} → ${f.sanBayDen.tenSanBay}`,
    },
    {
      key: 'ngayGioBay',
      header: 'Ngày giờ',
      render: (f: FlightResponse) => formatDate(f.ngayGioBay),
    },
    {
      key: 'thoiGianBay',
      header: 'Thời gian',
      render: (f: FlightResponse) => `${f.thoiGianBay} phút`,
    },
    {
      key: 'giaCoBan',
      header: 'Giá từ',
      render: (f: FlightResponse) => `${f.giaCoBan.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      key: 'trangThaiChuyenBay',
      header: 'Trạng thái',
      render: (f: FlightResponse) => {
        const s = statusBadge[f.trangThaiChuyenBay] || { variant: 'neutral' as const, label: f.trangThaiChuyenBay };
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
  ];

  return (
    <div>
      <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 600, color: '#0F172A' }}>Tra cứu chuyến bay</h2>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end',
        padding: '16px 20px', background: '#fff', borderRadius: 12,
        border: '1px solid #E2E8F0', marginBottom: 16,
      }}>
        <div style={{ flex: '1 1 200px', minWidth: 160 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Sân bay đi</label>
          <AirportSelect value={sanBayDi} onChange={setSanBayDi} placeholder="Chọn sân bay đi" />
        </div>
        <div style={{ flex: '1 1 200px', minWidth: 160 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Sân bay đến</label>
          <AirportSelect value={sanBayDen} onChange={setSanBayDen} placeholder="Chọn sân bay đến" />
        </div>
        <div style={{ flex: '0 1 180px', minWidth: 140 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Ngày bay</label>
          <input className="ds-input" type="date" value={ngayBay} onChange={e => setNgayBay(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, paddingBottom: 1 }}>
          <Button variant="primary" onClick={handleSearch} isLoading={isLoading}>Tìm kiếm</Button>
          <Button variant="ghost" onClick={handleReset}>Đặt lại</Button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={handleSearch} />}

      {isLoading && <LoadingState text="Đang tìm kiếm..." />}

      {!isLoading && hasSearched && results.length === 0 && !error && (
        <EmptyState title="Không tìm thấy chuyến bay" description="Thử thay đổi điều kiện tìm kiếm." />
      )}

      {!isLoading && results.length > 0 && (
        <>
          <DataTable columns={columns} data={results as any} />
          {pagination && pagination.totalPages > 1 && (
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
              <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
};
