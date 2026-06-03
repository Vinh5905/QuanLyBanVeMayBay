import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from '../api/payments.api'
import { ticketsApi } from '../api/tickets.api'
import { formatCurrency, formatDateTime, PAYMENT_METHOD_LABEL, TICKET_STATUS_LABEL, TICKET_STATUS_COLOR } from '../utils/format'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useConfig } from '../contexts/ConfigContext'
import { CreditCard, ChevronDown, ChevronUp } from 'lucide-react'
import TicketCard from '../components/TicketCard'
import type { Ticket, PaymentMethod } from '../types'

// ─── Customer panel ─────────────────────────────────────────────────────────

function TicketPayPanel({ ticket }: { ticket: Ticket }) {
  const qc = useQueryClient()
  const toast = useToast()
  const { getNum } = useConfig()
  const [showModal, setShowModal] = useState(false)
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH')

  const isPendingPayment = ticket.trangThaiVe === 'DANG_GIU_CHO'

  // Stored procedure sp_ThanhToan_Create validates:
  //   @SoTienThanhToan >= @GiaGoc * (1 + @ThuVAT)
  // where @GiaGoc = VE.GiaVe (or PHIEUDATCHO.TongTien) and @ThuVAT from THAM_SO (default 10%).
  // So we must send the VAT-inclusive amount.
  const vatRate = getNum('ThueVAT', 10) / 100
  const ticketAmountWithVAT = Math.round(ticket.giaVe * (1 + vatRate))
  const ticketVat = ticketAmountWithVAT - ticket.giaVe

  const payMutation = useMutation({
    mutationFn: async () => {
      // Pay ticket (via booking ID if available, else via ticket ID).
      // The stored procedure only handles ticket payment, not baggage.
      // Baggage is registered via POST /api/baggage with its fee recorded separately.
      const ticketPayload = ticket.maPhieuDatCho
        ? {
            maPhieuDatCho: ticket.maPhieuDatCho,
            hinhThucThanhToan: payMethod,
            soTienThanhToan: ticketAmountWithVAT,
          }
        : {
            maVe: ticket.maVe,
            hinhThucThanhToan: payMethod,
            soTienThanhToan: ticketAmountWithVAT,
          }
      await paymentsApi.create(ticketPayload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-tickets'] })
      toast.success('Thanh toán thành công!')
      setShowModal(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="px-4 pb-4 pt-2 border-t bg-gray-50 space-y-4">
      <TicketCard ticket={ticket} />

      {isPendingPayment ? (
        <button onClick={() => setShowModal(true)} className="btn-primary w-full justify-center">
          <CreditCard size={16} /> Thanh toán {formatCurrency(ticketAmountWithVAT)}
        </button>
      ) : (
        <div className="text-center text-sm text-gray-500 py-2">
          {ticket.trangThaiVe === 'HOP_LE' ? 'Vé đã được thanh toán' : 'Vé không thể thanh toán'}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Xác nhận thanh toán"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
            <button onClick={() => payMutation.mutate()} disabled={payMutation.isPending} className="btn-primary">
              {payMutation.isPending ? <Spinner size="sm" /> : `Thanh toán ${formatCurrency(ticketAmountWithVAT)}`}
            </button>
          </>
        }
      >
        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Giá vé ({ticket.hangVe.tenHangVe})</span>
              <span className="font-medium">{formatCurrency(ticket.giaVe)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VAT ({getNum('ThueVAT', 10)}%)</span>
              <span className="font-medium">{formatCurrency(ticketVat)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Tổng thanh toán vé</span>
              <span className="text-blue-600">{formatCurrency(ticketAmountWithVAT)}</span>
            </div>
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

function CustomerTicketRow({ ticket }: { ticket: Ticket }) {
  const [open, setOpen] = useState(ticket.trangThaiVe === 'DANG_GIU_CHO')
  const isPending = ticket.trangThaiVe === 'DANG_GIU_CHO'

  return (
    <div className={`card overflow-hidden ${isPending ? 'border-amber-200' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <CreditCard size={16} className={`shrink-0 ${isPending ? 'text-amber-500' : 'text-gray-400'}`} />
        <div className="flex-1 min-w-0">
          <p className="font-mono font-bold text-blue-600 text-sm">{ticket.maVeCode}</p>
          <p className="text-xs text-gray-500 truncate">
            {ticket.chuyenBay.sanBayDi}→{ticket.chuyenBay.sanBayDen} · {formatDateTime(ticket.chuyenBay.ngayGioBay)} · {ticket.hangVe.tenHangVe}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold">{formatCurrency(ticket.giaVe)}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${TICKET_STATUS_COLOR[ticket.trangThaiVe]}`}>
            {TICKET_STATUS_LABEL[ticket.trangThaiVe]}
          </span>
        </div>
        {open ? <ChevronUp size={16} className="shrink-0 text-gray-400" /> : <ChevronDown size={16} className="shrink-0 text-gray-400" />}
      </button>
      {open && <TicketPayPanel ticket={ticket} />}
    </div>
  )
}

function CustomerPaymentsView() {
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: ticketsApi.myTickets,
  })

  const pending = tickets.filter((t) => t.trangThaiVe === 'DANG_GIU_CHO')
  const paid = tickets.filter((t) => t.trangThaiVe !== 'DANG_GIU_CHO')

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (tickets.length === 0) return <div className="card p-8 text-center text-gray-400">Bạn chưa có vé nào</div>

  return (
    <div className="space-y-5">
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Chờ thanh toán ({pending.length})</p>
          {pending.map((t) => <CustomerTicketRow key={t.maVe} ticket={t} />)}
        </div>
      )}
      {paid.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Đã thanh toán / Khác</p>
          {paid.map((t) => <CustomerTicketRow key={t.maVe} ticket={t} />)}
        </div>
      )}
    </div>
  )
}

// ─── Staff view ──────────────────────────────────────────────────────────────

function StaffPaymentsView() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [trangThai, setTrangThai] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, trangThai],
    queryFn: () => paymentsApi.list({ trangThai: trangThai || undefined, page, size: 20 }),
  })

  return (
    <>
      <div className="card p-4 flex gap-3">
        <select value={trangThai} onChange={(e) => { setTrangThai(e.target.value); setPage(0) }} className="input text-sm w-auto">
          <option value="">Tất cả trạng thái</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="PENDING">Chờ xử lý</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th">Mã thanh toán</th>
                    <th className="table-th">Mã vé</th>
                    <th className="table-th text-right">Số tiền</th>
                    <th className="table-th text-right">Thuế VAT</th>
                    <th className="table-th">Phương thức</th>
                    <th className="table-th">Trạng thái</th>
                    <th className="table-th">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((p) => (
                    <tr key={p.maThanhToan} className="border-t hover:bg-gray-50">
                      <td className="table-td font-mono text-xs text-blue-600">#{p.maThanhToan}</td>
                      <td className="table-td">
                        {p.maVe && (
                          <button onClick={() => navigate(`/tickets/${p.maVe}`)} className="text-blue-600 hover:underline text-xs">
                            Vé #{p.maVe}
                          </button>
                        )}
                        {p.maPhieuDatCho && <span className="text-xs text-gray-500"> / Đặt #{p.maPhieuDatCho}</span>}
                      </td>
                      <td className="table-td text-right font-medium">{formatCurrency(p.soTien)}</td>
                      <td className="table-td text-right text-gray-500">{formatCurrency(p.thueVAT)}</td>
                      <td className="table-td">{PAYMENT_METHOD_LABEL[p.phuongThuc] || p.phuongThuc}</td>
                      <td className="table-td">
                        <Badge variant={p.trangThaiThanhToan === 'COMPLETED' ? 'green' : 'yellow'}>
                          {p.trangThaiThanhToan === 'COMPLETED' ? 'Hoàn thành' : 'Chờ xử lý'}
                        </Badge>
                      </td>
                      <td className="table-td text-xs">{formatDateTime(p.thoiGianThanhToan)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data?.data.length === 0 && <EmptyState message="Không có thanh toán nào" />}
            {data?.pagination && <Pagination {...data.pagination} onChange={setPage} />}
          </>
        )}
      </div>
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const { user } = useAuth()
  const isKhachHang = user?.vaiTro === 'KhachHang'

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Thanh toán</h1>
      {isKhachHang ? <CustomerPaymentsView /> : <StaffPaymentsView />}
    </div>
  )
}
