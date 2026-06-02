import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketApi } from '../../../api/ticketApi'
import { getErrorMessage } from '../../../api/adapter'
import { Button } from '../../../components/Button/Button'
import { Input, Select, FormField } from '../../../components/FormField/FormField'
import { DataTable } from '../../../components/DataTable/DataTable'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { Pagination } from '../../../components/Pagination/Pagination'
import { Badge } from '../../../components/Badge/Badge'
import type { TicketResponse } from '../../../types/ticket'

const trangThaiColors: Record<string, string> = {
  HOP_LE: 'success',
  DA_HUY: 'error',
  DA_DOI: 'warning',
}

const trangThaiLabels: Record<string, string> = {
  HOP_LE: 'Hợp lệ',
  DA_HUY: 'Đã hủy',
  DA_DOI: 'Đã đổi',
}

export function TicketListPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<TicketResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [searchMaVeCode, setSearchMaVeCode] = useState('')
  const [filterTrangThai, setFilterTrangThai] = useState('')
  const size = 10

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await ticketApi.getTickets({
        maVeCode: searchMaVeCode || undefined,
        trangThaiVe: filterTrangThai || undefined,
        page, size,
      })
      setTickets(res.data || [])
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages)
        setTotalElements(res.pagination.totalElements)
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải danh sách vé'))
    } finally {
      setLoading(false)
    }
  }, [page, filterTrangThai, searchMaVeCode])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const handleCancel = async (id: number) => {
    if (!window.confirm('Xác nhận hủy vé này?')) return
    try {
      await ticketApi.cancelTicket(id)
      fetchTickets()
    } catch (err) {
      alert(getErrorMessage(err, 'Hủy vé thất bại'))
    }
  }

  const columns = [
    { key: 'maVeCode', header: 'Mã vé' },
    {
      key: 'chuyenBay',
      label: 'Chuyến bay',
      render: (row: TicketResponse) => `${row.chuyenBay.sanBayDi} → ${row.chuyenBay.sanBayDen}`,
    },
    {
      key: 'khachHang',
      label: 'Khách hàng',
      render: (row: TicketResponse) => row.khachHang?.hoTen || 'N/A',
    },
    {
      key: 'hangVe',
      label: 'Hạng',
      render: (row: TicketResponse) => row.hangVe?.tenHangVe || '',
    },
    {
      key: 'giaVe',
      label: 'Giá vé',
      render: (row: TicketResponse) => `${(row.giaVe || 0).toLocaleString('vi-VN')}đ`,
    },
    {
      key: 'trangThaiVe',
      label: 'Trạng thái',
      render: (row: TicketResponse) => (
        <Badge variant={(trangThaiColors[row.trangThaiVe] || 'neutral') as any}>
          {trangThaiLabels[row.trangThaiVe] || row.trangThaiVe}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày bán',
      render: (row: TicketResponse) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : '',
    },
    {
      key: 'actions',
      label: '',
      render: (row: TicketResponse) => (
        <div className="action-buttons">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/staff/tickets/${row.maVe}`)}>
            Xem
          </Button>
          {row.trangThaiVe === 'HOP_LE' && (
            <Button variant="ghost" size="sm" onClick={() => handleCancel(row.maVe)}>
              Hủy
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="ticket-list-page">
      <div className="page-header">
        <h1>Danh sách vé</h1>
        <Button onClick={() => navigate('/staff/pos')}>Bán vé mới</Button>
      </div>

      <div className="filter-row">
        <FormField label="Mã vé">
          <Input
            placeholder="Tìm theo mã vé"
            value={searchMaVeCode}
            onChange={e => setSearchMaVeCode(e.target.value)}
          />
        </FormField>
        <FormField label="Trạng thái">
          <Select
            value={filterTrangThai}
            onChange={e => { setFilterTrangThai(e.target.value); setPage(0) }}
            options={[
              { value: '', label: 'Tất cả' },
              { value: 'HOP_LE', label: 'Hợp lệ' },
              { value: 'DA_HUY', label: 'Đã hủy' },
              { value: 'DA_DOI', label: 'Đã đổi' },
            ]}
          />
        </FormField>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Button variant="secondary" onClick={() => { setPage(0); fetchTickets() }}>Tìm kiếm</Button>
        </div>
      </div>

      {loading && <LoadingState text="Đang tải danh sách vé..." />}
      {error && <ErrorState message={error} onRetry={fetchTickets} />}
      {!loading && !error && tickets.length === 0 && <EmptyState title="Không có vé" description="Chưa có vé nào được bán" />}
      {!loading && !error && tickets.length > 0 && (
        <>
          <DataTable columns={columns} data={tickets} />
          <div className="table-footer">
            <span className="total-count">Tổng: {totalElements} vé</span>
            {totalPages > 1 && (
              <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={p => setPage(p - 1)} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
