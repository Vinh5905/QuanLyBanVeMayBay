import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { DataTable } from '../../../components/DataTable/DataTable';
import { Pagination } from '../../../components/Pagination/Pagination';
import { Badge } from '../../../components/Badge/Badge';
import { Button } from '../../../components/Button/Button';
import { LoadingState } from '../../../components/LoadingState/LoadingState';
import { ErrorState } from '../../../components/ErrorState/ErrorState';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { FlightFilterBar } from '../components/FlightFilterBar';
import type { FilterValues } from '../components/FlightFilterBar';
import { useFlights } from '../hooks/useFlights';
import { flightApi } from '../../../api/flightApi';
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

const defaultFilters: FilterValues = {
  sanBayDi: '',
  sanBayDen: '',
  ngayBay: '',
  trangThai: '',
  sort: 'ngayGioBay,asc',
};

export const FlightListPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const canManage = role === 'Admin' || role === 'Staff';

  const [filters, setFilters] = useState<FilterValues>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(defaultFilters);
  const [page, setPage] = useState(1);

  const apiPage = page - 1;
  const cleanedFilters: Record<string, any> = {};
  for (const [key, value] of Object.entries(appliedFilters)) {
    if (value !== '' && value !== undefined) cleanedFilters[key] = value;
  }
  cleanedFilters.page = apiPage;
  cleanedFilters.size = 10;
  const { flights, pagination, isLoading, error, refetch } = useFlights(cleanedFilters);

  const handleSearch = useCallback(() => {
    setAppliedFilters({ ...filters });
    setPage(1);
  }, [filters]);

  const handleReset = useCallback(() => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  }, []);

  const handleCancel = async (id: number, code: string) => {
    if (!window.confirm(`Xác nhận hủy chuyến bay ${code}?`)) return;
    try {
      await flightApi.cancelFlight(id);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể hủy chuyến bay');
    }
  };

  const columns = [
    { key: 'maChuyenBayCode', header: 'Mã CB' },
    {
      key: 'route',
      header: 'Sân bay',
      render: (f: FlightResponse) => `${f.sanBayDi.maSanBay} → ${f.sanBayDen.maSanBay}`,
    },
    {
      key: 'ngayGioBay',
      header: 'Ngày giờ',
      render: (f: FlightResponse) => formatDateTime(f.ngayGioBay),
    },
    {
      key: 'thoiGianBay',
      header: 'Thời gian bay',
      render: (f: FlightResponse) => `${f.thoiGianBay} phút`,
    },
    {
      key: 'soGhe',
      header: 'Ghế',
      render: (f: FlightResponse) => {
        const total = f.danhSachHangVe.reduce((s, h) => s + h.soLuong, 0);
        const sold = f.danhSachHangVe.reduce((s, h) => s + h.soGheDaDat, 0);
        return `${sold}/${total}`;
      },
    },
    {
      key: 'trangThaiChuyenBay',
      header: 'Trạng thái',
      render: (f: FlightResponse) => {
        const s = statusBadge[f.trangThaiChuyenBay] || { variant: 'neutral' as const, label: f.trangThaiChuyenBay };
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
    ...(canManage ? [{
      key: 'actions' as const,
      header: 'Hành động',
      render: (f: FlightResponse) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button size="sm" variant="outline" onClick={() => navigate(`/${role?.toLowerCase()}/flights/${f.maChuyenBay}`)}>
            Xem
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate(`/${role?.toLowerCase()}/flights/${f.maChuyenBay}/edit`)}>
            Sửa
          </Button>
          {f.trangThaiChuyenBay === 'SCHEDULED' && (
            <Button size="sm" variant="danger" onClick={() => handleCancel(f.maChuyenBay, f.maChuyenBayCode)}>
              Hủy
            </Button>
          )}
        </div>
      ),
    }] : []),
  ];

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#0F172A' }}>Quản lý chuyến bay</h2>
        {canManage && (
          <Button variant="primary" onClick={() => navigate(`/${role?.toLowerCase()}/flights/new`)}>
            + Thêm chuyến bay
          </Button>
        )}
      </div>

      <FlightFilterBar values={filters} onChange={(key, v) => setFilters(prev => ({ ...prev, [key]: v }))} onSearch={handleSearch} onReset={handleReset} />

      {isLoading ? (
        <LoadingState text="Đang tải danh sách chuyến bay..." />
      ) : flights.length === 0 ? (
        <EmptyState title="Không có chuyến bay" description="Không tìm thấy chuyến bay nào phù hợp." />
      ) : (
        <>
          <DataTable columns={columns} data={flights as any} />
          {pagination.totalPages > 1 && (
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
              <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
};
