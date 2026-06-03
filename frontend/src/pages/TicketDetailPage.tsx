import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi } from '../api/tickets.api'
import { flightsApi } from '../api/flights.api'
import { baggageApi } from '../api/baggage.api'
import { formatCurrency, formatDateTime, formatDuration, TICKET_STATUS_LABEL, TICKET_STATUS_COLOR, PAYMENT_METHOD_LABEL } from '../utils/format'
import { ArrowLeft, TrendingUp, RefreshCw, XCircle, Briefcase, LogIn, CreditCard } from 'lucide-react'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import { useConfig } from '../contexts/ConfigContext'
import { differenceInHours, differenceInMinutes, parseISO } from 'date-fns'
import { paymentsApi } from '../api/payments.api'
import type { PaymentMethod } from '../types'

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()
  const { getNum } = useConfig()

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.get(Number(id)),
  })

  const { data: baggage = [] } = useQuery({
    queryKey: ['baggage', id],
    queryFn: () => baggageApi.byTicket(Number(id)),
    enabled: !!id,
  })

  // Cancel modal
  const [showCancel, setShowCancel] = useState(false)
  const cancelMutation = useMutation({
    mutationFn: () => ticketsApi.cancel(Number(id)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ticket', id] }); toast.success('Hủy vé thành công'); setShowCancel(false) },
    onError: (e: Error) => toast.error(e.message),
  })

  // Upgrade modal
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [newClass, setNewClass] = useState<number | null>(null)
  const upgradeMutation = useMutation({
    mutationFn: () => ticketsApi.upgrade(Number(id), newClass!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ticket', id] }); toast.success('Nâng hạng thành công'); setShowUpgrade(false) },
    onError: (e: Error) => toast.error(e.message),
  })

  // Change flight modal
  const [showChange, setShowChange] = useState(false)
  const [newFlightId, setNewFlightId] = useState<number | null>(null)
  const { data: flightOptions = [] } = useQuery({
    queryKey: ['flights-same-route', ticket?.chuyenBay.sanBayDi, ticket?.chuyenBay.sanBayDen],
    queryFn: () => flightsApi.search({ sanBayDi: ticket!.chuyenBay.sanBayDi, sanBayDen: ticket!.chuyenBay.sanBayDen }),
    enabled: showChange && !!ticket,
  })
  const changeMutation = useMutation({
    mutationFn: () => ticketsApi.changeFlight(Number(id), newFlightId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ticket', id] }); toast.success('Đổi chuyến thành công'); setShowChange(false) },
    onError: (e: Error) => toast.error(e.message),
  })

  // Payment modal — sp_ThanhToan_Create expects @SoTienThanhToan >= VE.GiaVe * (1 + VAT)
  const [showPayment, setShowPayment] = useState(false)
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH')
  const vatRate = getNum('ThueVAT', 10) / 100
  const payMutation = useMutation({
    mutationFn: () => {
      const amountWithVAT = Math.round(ticket!.giaVe * (1 + vatRate))
      return paymentsApi.create({ maVe: Number(id), hinhThucThanhToan: payMethod, soTienThanhToan: amountWithVAT })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ticket', id] }); toast.success('Thanh toán thành công'); setShowPayment(false) },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!ticket) return <div className="text-center py-20 text-gray-500">Không tìm thấy vé</div>

  const dep = parseISO(ticket.chuyenBay.ngayGioBay)
  const now = new Date()
  const hoursUntilDep = differenceInHours(dep, now)
  const minutesUntilDep = differenceInMinutes(dep, now)

  const canCancel = ticket.trangThaiVe === 'HOP_LE' || ticket.trangThaiVe === 'DANG_GIU_CHO'
  const canUpgrade = ticket.trangThaiVe === 'HOP_LE'
  const canChange = ticket.trangThaiVe === 'HOP_LE' && hoursUntilDep >= getNum('ThoiGianChoPhepDoiVe', 24)
  const canCheckin = ticket.trangThaiVe === 'HOP_LE' && hoursUntilDep <= getNum('ThoiGianMoCheckInOnline', 24) && minutesUntilDep >= getNum('ThoiGianDongCheckInOnline', 60)
  const canPayment = ticket.trangThaiVe === 'DANG_GIU_CHO'

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={16} /> Quay lại
      </button>

      {/* Header */}
      <div className="card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500">Mã vé</p>
            <p className="font-mono font-bold text-blue-600 text-lg mt-0.5">{ticket.maVeCode}</p>
          </div>
          <span className={`badge text-sm px-3 py-1 ${TICKET_STATUS_COLOR[ticket.trangThaiVe]}`}>
            {TICKET_STATUS_LABEL[ticket.trangThaiVe]}
          </span>
        </div>

        {/* Flight info */}
        <div className="mt-4 flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{ticket.chuyenBay.sanBayDi}</p>
            <p className="text-xs text-gray-500">{ticket.chuyenBay.tenSanBayDi}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-400 mb-1">{ticket.chuyenBay.maChuyenBayCode}</p>
            <div className="border-t border-dashed border-gray-300 relative">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 text-gray-400 text-xs">✈</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{ticket.chuyenBay.sanBayDen}</p>
            <p className="text-xs text-gray-500">{ticket.chuyenBay.tenSanBayDen}</p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 mt-2">{formatDateTime(ticket.chuyenBay.ngayGioBay)}</p>

        {/* Passenger */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div><p className="text-xs text-gray-400">Hành khách</p><p className="font-medium">{ticket.khachHang.hoTen}</p></div>
          <div><p className="text-xs text-gray-400">Hạng vé</p><p className="font-medium">{ticket.hangVe.tenHangVe}</p></div>
          <div><p className="text-xs text-gray-400">Giá vé</p><p className="font-medium">{formatCurrency(ticket.giaVe)}</p></div>
          <div><p className="text-xs text-gray-400">CCCD</p><p className="font-medium font-mono text-xs">{ticket.khachHang.cccd ?? '—'}</p></div>
        </div>
      </div>

      {/* Baggage summary */}
      {baggage.length > 0 && (
        <div className="card p-4">
          <p className="font-semibold text-sm text-gray-700 mb-3">Hành lý ký gửi</p>
          <div className="space-y-2">
            {baggage.map((pkg) => (
              <div key={pkg.maGoiHanhLy} className="flex justify-between text-sm bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="font-medium">{pkg.bangGia.tenGoi}</p>
                  <p className="text-xs text-gray-500">{pkg.danhSachKien.length} kiện — {pkg.tongTrongLuong} kg</p>
                </div>
                <p className="font-bold text-gray-900">{formatCurrency(pkg.tongPhi)}</p>
              </div>
            ))}
          </div>
          <button onClick={() => navigate(`/baggage?maVe=${id}`)} className="mt-3 text-sm text-blue-600 hover:underline">
            Quản lý hành lý →
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {canPayment && (
          <button onClick={() => setShowPayment(true)} className="btn-primary">
            <CreditCard size={16} /> Thanh toán vé
          </button>
        )}
        {canUpgrade && (
          <button onClick={() => setShowUpgrade(true)} className="btn-secondary">
            <TrendingUp size={16} /> Nâng hạng
          </button>
        )}
        {canChange && (
          <button onClick={() => setShowChange(true)} className="btn-secondary">
            <RefreshCw size={16} /> Đổi chuyến
          </button>
        )}
        {canCheckin && (
          <button onClick={() => navigate(`/checkin?maVe=${id}`)} className="btn-secondary">
            <LogIn size={16} /> Check-in online
          </button>
        )}
        <button onClick={() => navigate(`/baggage?maVe=${id}`)} className="btn-secondary">
          <Briefcase size={16} /> Hành lý ký gửi
        </button>
        {canCancel && (
          <button onClick={() => setShowCancel(true)} className="btn-danger">
            <XCircle size={16} /> Hủy vé
          </button>
        )}
      </div>

      {/* Cancel modal */}
      <Modal open={showCancel} onClose={() => setShowCancel(false)} title="Xác nhận hủy vé"
        footer={
          <>
            <button onClick={() => setShowCancel(false)} className="btn-secondary">Hủy bỏ</button>
            <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending} className="btn-danger">
              {cancelMutation.isPending ? <Spinner size="sm" /> : 'Xác nhận hủy vé'}
            </button>
          </>
        }>
        <div className="space-y-3 text-sm">
          <p className="text-gray-700">Bạn sắp hủy vé <strong>{ticket.maVeCode}</strong> cho hành khách <strong>{ticket.khachHang.hoTen}</strong>.</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">
            Sau khi hủy, ghế sẽ được trả về chuyến bay và hành động này không thể hoàn tác.
          </div>
        </div>
      </Modal>

      {/* Upgrade modal */}
      <Modal open={showUpgrade} onClose={() => setShowUpgrade(false)} title="Nâng hạng ghế"
        footer={
          <>
            <button onClick={() => setShowUpgrade(false)} className="btn-secondary">Hủy</button>
            <button onClick={() => upgradeMutation.mutate()} disabled={!newClass || upgradeMutation.isPending} className="btn-primary">
              {upgradeMutation.isPending ? <Spinner size="sm" /> : 'Xác nhận nâng hạng'}
            </button>
          </>
        }>
        <div className="space-y-3 text-sm">
          <p className="text-gray-600">Hạng hiện tại: <strong>{ticket.hangVe.tenHangVe}</strong> — {formatCurrency(ticket.hangVe.donGia)}</p>
          <p className="label">Chọn hạng mới:</p>
          <div className="space-y-2">
            {[{ maHangVe: 2, tenHangVe: 'Thương gia' }, { maHangVe: 3, tenHangVe: 'Hạng nhất' }]
              .filter((h) => h.maHangVe > ticket.hangVe.maHangVe)
              .map((h) => (
                <label key={h.maHangVe} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${newClass === h.maHangVe ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" value={h.maHangVe} checked={newClass === h.maHangVe} onChange={() => setNewClass(h.maHangVe)} />
                  <span>{h.tenHangVe}</span>
                </label>
              ))}
          </div>
        </div>
      </Modal>

      {/* Change flight modal */}
      <Modal open={showChange} onClose={() => setShowChange(false)} title="Đổi chuyến bay" size="lg"
        footer={
          <>
            <button onClick={() => setShowChange(false)} className="btn-secondary">Hủy</button>
            <button onClick={() => changeMutation.mutate()} disabled={!newFlightId || changeMutation.isPending} className="btn-primary">
              {changeMutation.isPending ? <Spinner size="sm" /> : 'Xác nhận đổi chuyến'}
            </button>
          </>
        }>
        <div className="space-y-3 text-sm">
          <p className="text-gray-600">Chuyến hiện tại: <strong>{ticket.chuyenBay.maChuyenBayCode}</strong> — {formatDateTime(ticket.chuyenBay.ngayGioBay)}</p>
          <p className="label">Chọn chuyến mới (cùng tuyến {ticket.chuyenBay.sanBayDi}→{ticket.chuyenBay.sanBayDen}):</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {flightOptions.filter((f) => f.maChuyenBay !== ticket.chuyenBay.maChuyenBay).map((f) => {
              const left = f.danhSachHangVe.find((h) => h.maHangVe === ticket.hangVe.maHangVe)?.soGheCon ?? 0
              return (
                <label key={f.maChuyenBay} className={`flex items-center gap-3 p-3 border rounded-lg ${left === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'} ${newFlightId === f.maChuyenBay ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <input type="radio" value={f.maChuyenBay} checked={newFlightId === f.maChuyenBay} disabled={left === 0} onChange={() => setNewFlightId(f.maChuyenBay)} />
                  <div className="flex-1">
                    <p className="font-medium">{f.maChuyenBayCode}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(f.ngayGioBay)}</p>
                  </div>
                  <Badge variant={left > 0 ? 'green' : 'red'}>{left} ghế còn</Badge>
                </label>
              )
            })}
            {flightOptions.length === 0 && <p className="text-gray-400 text-center py-4">Không có chuyến bay phù hợp</p>}
          </div>
        </div>
      </Modal>

      {/* Payment modal */}
      <Modal open={showPayment} onClose={() => setShowPayment(false)} title="Thanh toán vé"
        footer={
          <>
            <button onClick={() => setShowPayment(false)} className="btn-secondary">Hủy</button>
            <button onClick={() => payMutation.mutate()} disabled={payMutation.isPending} className="btn-primary">
              {payMutation.isPending ? <Spinner size="sm" /> : 'Xác nhận thanh toán'}
            </button>
          </>
        }>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span>Giá vé ({ticket.hangVe.tenHangVe})</span>
            <span className="font-bold">{formatCurrency(ticket.giaVe)}</span>
          </div>
          <div>
            <label className="label">Hình thức thanh toán</label>
            <select value={payMethod} onChange={(e) => setPayMethod(e.target.value as PaymentMethod)} className="input">
              {Object.entries(PAYMENT_METHOD_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
