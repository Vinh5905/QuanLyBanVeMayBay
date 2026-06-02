import { useState, useEffect, useCallback } from 'react'
import { paymentApi } from '../../../api/paymentApi'
import { getErrorMessage } from '../../../api/adapter'
import { Button } from '../../../components/Button/Button'
import { DataTable } from '../../../components/DataTable/DataTable'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { Pagination } from '../../../components/Pagination/Pagination'
import { Badge } from '../../../components/Badge/Badge'
import { Modal } from '../../../components/Modal/Modal'
import type { PaymentResponse } from '../../../types/payment'

const trangThaiColors: Record<string, string> = {
  DA_THANH_TOAN: 'success',
  CHO_THANH_TOAN: 'warning',
  QUA_HAN: 'error',
}

export function PaymentListPage() {
  const [payments, setPayments] = useState<PaymentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentResponse | null>(null)
  const size = 10

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await paymentApi.getPayments({ page, size })
      setPayments(res.data || [])
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages)
        setTotalElements(res.pagination.totalElements)
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải danh sách hóa đơn'))
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const columns = [
    { key: 'maThanhToan', header: 'Mã HD' },
    {
      key: 'maVe',
      header: 'Mã vé',
      render: (r: PaymentResponse) => r.maVe ?? r.maPhieuDatCho ?? 'N/A',
    },
    {
      key: 'soTien',
      header: 'Tổng tiền',
      render: (r: PaymentResponse) =>
        `${((r.soTien || 0) + (r.thueVAT || 0)).toLocaleString('vi-VN')}đ`,
    },
    { key: 'phuongThuc', header: 'Hình thức' },
    {
      key: 'trangThaiThanhToan',
      header: 'Trạng thái',
      render: (r: PaymentResponse) => (
        <Badge
          variant={(trangThaiColors[r.trangThaiThanhToan] || 'neutral') as any}
        >
          {r.trangThaiThanhToan}
        </Badge>
      ),
    },
    {
      key: 'thoiGianThanhToan',
      header: 'Ngày TT',
      render: (r: PaymentResponse) =>
        r.thoiGianThanhToan
          ? new Date(r.thoiGianThanhToan).toLocaleDateString('vi-VN')
          : '',
    },
    {
      key: 'actions',
      header: '',
      render: (r: PaymentResponse) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(r)}>
          Chi tiết
        </Button>
      ),
    },
  ]

  return (
    <div className="payment-list-page">
      <h1>Danh sách hóa đơn</h1>

      {loading && <LoadingState text="Đang tải..." />}
      {error && <ErrorState message={error} onRetry={fetchPayments} />}
      {!loading && !error && payments.length === 0 && (
        <EmptyState
          title="Không có hóa đơn"
          description="Chưa có hóa đơn nào"
        />
      )}
      {!loading && !error && payments.length > 0 && (
        <>
          <DataTable columns={columns} data={payments} />
          <div className="table-footer">
            <span className="total-count">Tổng: {totalElements} hóa đơn</span>
            {totalPages > 1 && (
              <Pagination
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p - 1)}
              />
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title="Chi tiết hóa đơn"
      >
        {selectedPayment && (
          <div className="payment-detail">
            <p>
              <strong>Mã hóa đơn:</strong> {selectedPayment.maThanhToan}
            </p>
            <p>
              <strong>Mã vé:</strong> {selectedPayment.maVe ?? 'N/A'}
            </p>
            <p>
              <strong>Số tiền:</strong>{' '}
              {(selectedPayment.soTien || 0).toLocaleString('vi-VN')}đ
            </p>
            <p>
              <strong>Thuế VAT:</strong>{' '}
              {(selectedPayment.thueVAT || 0).toLocaleString('vi-VN')}đ
            </p>
            <p>
              <strong>Tổng thanh toán:</strong>{' '}
              <strong>
                {(
                  (selectedPayment.soTien || 0) + (selectedPayment.thueVAT || 0)
                ).toLocaleString('vi-VN')}
                đ
              </strong>
            </p>
            <p>
              <strong>Phương thức:</strong> {selectedPayment.phuongThuc}
            </p>
            <p>
              <strong>Trạng thái:</strong> {selectedPayment.trangThaiThanhToan}
            </p>
            <p>
              <strong>Ngày thanh toán:</strong>{' '}
              {selectedPayment.thoiGianThanhToan
                ? new Date(selectedPayment.thoiGianThanhToan).toLocaleString(
                    'vi-VN',
                  )
                : ''}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
