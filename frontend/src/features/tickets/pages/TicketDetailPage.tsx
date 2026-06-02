import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ticketApi } from '../../../api/ticketApi'
import { flightApi } from '../../../api/flightApi'
import { getErrorMessage } from '../../../api/adapter'
import { Button } from '../../../components/Button/Button'
import { Modal } from '../../../components/Modal/Modal'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import { Badge } from '../../../components/Badge/Badge'
import { toast } from '../../../components/Toast/Toast'
import type { TicketResponse } from '../../../types/ticket'
import type { FlightResponse } from '../../../types/flight'

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<TicketResponse | null>(null)
  const [flights, setFlights] = useState<FlightResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showChange, setShowChange] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null)
  const [selectedHangVe, setSelectedHangVe] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchTicket = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await ticketApi.getTicketById(Number(id))
      setTicket(res.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải thông tin vé'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTicket()
  }, [id])

  const loadFlights = async () => {
    try {
      const res = await flightApi.getFlights({ trangThai: 'ACTIVE', size: 50 })
      setFlights(res.data.data || [])
    } catch {
      /* ignore */
    }
  }

  const handleChangeFlight = async () => {
    if (!ticket || !selectedFlightId) return
    setActionLoading(true)
    try {
      await ticketApi.changeFlight(ticket.maVe, {
        maChuyenBayMoi: selectedFlightId,
      })
      toast.success('Đổi chuyến bay thành công')
      setShowChange(false)
      fetchTicket()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Đổi chuyến thất bại'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpgrade = async () => {
    if (!ticket || !selectedHangVe) return
    setActionLoading(true)
    try {
      await ticketApi.upgrade(ticket.maVe, { maHangVeMoi: selectedHangVe })
      toast.success('Nâng hạng thành công')
      setShowUpgrade(false)
      fetchTicket()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Nâng hạng thất bại'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!ticket) return
    setActionLoading(true)
    try {
      await ticketApi.cancelTicket(ticket.maVe)
      toast.success('Hủy vé thành công')
      setShowCancel(false)
      fetchTicket()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Hủy vé thất bại'))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <LoadingState text="Đang tải thông tin vé..." />
  if (error) return <ErrorState message={error} onRetry={fetchTicket} />
  if (!ticket) return <ErrorState message="Không tìm thấy vé" />

  const isHopLe = ticket.trangThaiVe === 'HOP_LE'

  return (
    <div className="ticket-detail-page">
      <div className="page-header">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>
        <h1>Vé {ticket.maVeCode}</h1>
      </div>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-section">
            <h3>Thông tin chuyến bay</h3>
            <p>
              <strong>Tuyến:</strong> {ticket.chuyenBay.sanBayDi} →{' '}
              {ticket.chuyenBay.sanBayDen}
            </p>
            <p>
              <strong>Giờ bay:</strong>{' '}
              {new Date(ticket.chuyenBay.ngayGioBay).toLocaleString('vi-VN')}
            </p>
            <p>
              <strong>Thời gian bay:</strong> {ticket.chuyenBay.thoiGianBay}{' '}
              phút
            </p>
          </div>
          <div className="detail-section">
            <h3>Thông tin khách hàng</h3>
            <p>
              <strong>Họ tên:</strong> {ticket.khachHang.hoTen}
            </p>
            <p>
              <strong>CCCD:</strong> {ticket.khachHang.cccd}
            </p>
            <p>
              <strong>Email:</strong> {ticket.khachHang.email}
            </p>
            <p>
              <strong>SĐT:</strong> {ticket.khachHang.soDienThoai}
            </p>
          </div>
          <div className="detail-section">
            <h3>Thông tin vé</h3>
            <p>
              <strong>Hạng vé:</strong> {ticket.hangVe.tenHangVe}
            </p>
            <p>
              <strong>Giá vé:</strong>{' '}
              {(ticket.giaVe || 0).toLocaleString('vi-VN')}đ
            </p>
            <p>
              <strong>Trạng thái:</strong>{' '}
              <Badge
                variant={
                  ticket.trangThaiVe === 'HOP_LE'
                    ? 'success'
                    : ticket.trangThaiVe === 'DA_HUY'
                      ? 'error'
                      : 'warning'
                }
              >
                {ticket.trangThaiVe}
              </Badge>
            </p>
          </div>
        </div>
      </div>

      {isHopLe && (
        <div className="action-bar">
          <Button
            onClick={() => {
              setShowChange(true)
              loadFlights()
            }}
          >
            Đổi chuyến
          </Button>
          <Button
            onClick={() => {
              setShowUpgrade(true)
              loadFlights()
            }}
          >
            Nâng hạng
          </Button>
          <Button variant="danger" onClick={() => setShowCancel(true)}>
            Hủy vé
          </Button>
        </div>
      )}

      <Modal
        isOpen={showChange}
        onClose={() => setShowChange(false)}
        title="Đổi chuyến bay"
      >
        <p>Chọn chuyến bay mới (cùng tuyến):</p>
        <select
          className="form-select"
          value={selectedFlightId ?? ''}
          onChange={(e) => setSelectedFlightId(Number(e.target.value))}
        >
          <option value="">-- Chọn chuyến bay --</option>
          {flights
            .filter(
              (f) =>
                f.sanBayDi.maSanBay === ticket.chuyenBay.sanBayDi &&
                f.sanBayDen.maSanBay === ticket.chuyenBay.sanBayDen,
            )
            .map((f) => (
              <option key={f.maChuyenBay} value={f.maChuyenBay}>
                {f.maChuyenBayCode} -{' '}
                {new Date(f.ngayGioBay).toLocaleString('vi-VN')}
              </option>
            ))}
        </select>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setShowChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleChangeFlight} isLoading={actionLoading}>
            Xác nhận đổi
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="Nâng hạng ghế"
      >
        <p>Chọn hạng vé mới:</p>
        <select
          className="form-select"
          value={selectedHangVe ?? ''}
          onChange={(e) => setSelectedHangVe(Number(e.target.value))}
        >
          <option value="">-- Chọn hạng --</option>
          <option value="1">Hạng 1</option>
          <option value="2">Hạng 2</option>
        </select>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setShowUpgrade(false)}>
            Hủy
          </Button>
          <Button onClick={handleUpgrade} isLoading={actionLoading}>
            Xác nhận nâng hạng
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        title="Xác nhận hủy vé"
      >
        <p>
          Bạn có chắc chắn muốn hủy vé <strong>{ticket.maVeCode}</strong>?
        </p>
        <p>Hành động này không thể hoàn tác.</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setShowCancel(false)}>
            Không
          </Button>
          <Button
            variant="danger"
            onClick={handleCancel}
            isLoading={actionLoading}
          >
            Xác nhận hủy
          </Button>
        </div>
      </Modal>
    </div>
  )
}
