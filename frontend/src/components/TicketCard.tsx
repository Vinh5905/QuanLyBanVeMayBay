import { Plane } from 'lucide-react'
import { formatCurrency, formatDateTime, TICKET_STATUS_LABEL, TICKET_STATUS_COLOR } from '../utils/format'
import type { Ticket, BaggagePackage } from '../types'

interface Props {
  ticket: Ticket
  baggage?: BaggagePackage[]
  showTotal?: boolean
}

export default function TicketCard({ ticket, baggage = [], showTotal = false }: Props) {
  const totalBaggage = baggage.reduce((s, b) => s + b.tongPhi, 0)
  const total = ticket.giaVe + totalBaggage

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header strip */}
      <div className="bg-blue-600 px-5 py-3 flex items-center justify-between">
        <span className="font-mono font-bold text-white tracking-wider text-lg">{ticket.maVeCode}</span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${TICKET_STATUS_COLOR[ticket.trangThaiVe]} bg-white/20 text-white border border-white/30`}>
          {TICKET_STATUS_LABEL[ticket.trangThaiVe]}
        </span>
      </div>

      {/* Route */}
      <div className="px-5 py-4 border-b border-dashed border-gray-200">
        <div className="flex items-center gap-3">
          <div className="text-center flex-1">
            <p className="text-2xl font-bold text-gray-900">{ticket.chuyenBay.sanBayDi}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{ticket.chuyenBay.tenSanBayDi}</p>
          </div>
          <div className="text-center shrink-0 px-2">
            <Plane size={18} className="text-blue-400 mx-auto" />
            <p className="text-xs text-gray-400 mt-0.5">{ticket.chuyenBay.maChuyenBayCode}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-2xl font-bold text-gray-900">{ticket.chuyenBay.sanBayDen}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{ticket.chuyenBay.tenSanBayDen}</p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">{formatDateTime(ticket.chuyenBay.ngayGioBay)}</p>
      </div>

      {/* Passenger info */}
      <div className="px-5 py-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-b border-dashed border-gray-200">
        <div>
          <p className="text-xs text-gray-400">Hành khách</p>
          <p className="font-semibold">{ticket.khachHang.hoTen}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Hạng vé</p>
          <p className="font-semibold">{ticket.hangVe.tenHangVe}</p>
        </div>
        {ticket.khachHang.cccd && (
          <div>
            <p className="text-xs text-gray-400">CCCD</p>
            <p className="font-mono text-xs">{ticket.khachHang.cccd}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-400">Giá vé</p>
          <p className="font-semibold text-blue-600">{formatCurrency(ticket.giaVe)}</p>
        </div>
      </div>

      {/* Baggage summary */}
      {baggage.length > 0 && (
        <div className="px-5 py-3 border-b border-dashed border-gray-200 space-y-1.5">
          <p className="text-xs text-gray-400 font-medium">Hành lý ký gửi</p>
          {baggage.map((b) => (
            <div key={b.maGoiHanhLy} className="flex justify-between text-sm">
              <span className="text-gray-600">{b.bangGia.tenGoi} · {b.tongTrongLuong} kg</span>
              <span className="font-medium">{formatCurrency(b.tongPhi)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      {showTotal && (
        <div className="px-5 py-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Tổng thanh toán</span>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(total)}</span>
          </div>
          {baggage.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5 text-right">
              Vé: {formatCurrency(ticket.giaVe)} + Hành lý: {formatCurrency(totalBaggage)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
