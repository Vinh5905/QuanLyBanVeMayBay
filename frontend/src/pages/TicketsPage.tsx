import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ticketsApi } from '../api/tickets.api'
import { formatCurrency, formatDateTime, TICKET_STATUS_LABEL, TICKET_STATUS_COLOR } from '../utils/format'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'
import TicketCard from '../components/TicketCard'
import { useAuth } from '../contexts/AuthContext'
import { X } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'HOP_LE', label: 'Hợp lệ' },
  { value: 'DANG_GIU_CHO', label: 'Đang giữ chỗ' },
  { value: 'DA_HUY', label: 'Đã hủy' },
  { value: 'DA_DOI', label: 'Đã đổi chuyến' },
]

// ─── KhachHang view ───────────────────────────────────────────────────────────

function CustomerTicketsView() {
  const navigate = useNavigate()
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: ticketsApi.myTickets,
  })

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (tickets.length === 0) return <EmptyState message="Bạn chưa có vé nào" />

  const pending = tickets.filter((t) => t.trangThaiVe === 'DANG_GIU_CHO')
  const active = tickets.filter((t) => t.trangThaiVe === 'HOP_LE')
  const other = tickets.filter((t) => t.trangThaiVe !== 'DANG_GIU_CHO' && t.trangThaiVe !== 'HOP_LE')

  return (
    <div className="space-y-5">
      {pending.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Chờ thanh toán ({pending.length})</p>
          {pending.map((t) => (
            <div key={t.maVe} className="card overflow-hidden">
              <TicketCard ticket={t} />
              <div className="px-5 py-3 bg-amber-50 border-t border-amber-200 flex gap-2">
                <button
                  onClick={() => navigate(`/payments?maVe=${t.maVe}`)}
                  className="btn-primary text-sm"
                >
                  Thanh toán ngay
                </button>
                <button
                  onClick={() => navigate(`/tickets/${t.maVe}`)}
                  className="btn-secondary text-sm"
                >
                  Chi tiết vé
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vé hợp lệ ({active.length})</p>
          {active.map((t) => (
            <div key={t.maVe} className="card overflow-hidden">
              <TicketCard ticket={t} />
              <div className="px-5 py-3 bg-gray-50 border-t flex gap-2">
                <button
                  onClick={() => navigate(`/tickets/${t.maVe}`)}
                  className="btn-primary text-sm"
                >
                  Chi tiết vé
                </button>
                <button
                  onClick={() => navigate(`/baggage?maVe=${t.maVe}`)}
                  className="btn-secondary text-sm"
                >
                  Hành lý
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {other.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vé khác ({other.length})</p>
          {other.map((t) => (
            <div key={t.maVe} className="card overflow-hidden">
              <TicketCard ticket={t} />
              <div className="px-5 py-3 bg-gray-50 border-t flex gap-2">
                <button
                  onClick={() => navigate(`/tickets/${t.maVe}`)}
                  className="btn-secondary text-sm"
                >
                  Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Staff view (original) ────────────────────────────────────────────────────

function StaffTicketsView() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(0)
  const [trangThai, setTrangThai] = useState('')
  const maKhachHangParam = searchParams.get('maKhachHang')
  const maKhachHang = maKhachHangParam ? Number(maKhachHangParam) : undefined

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', page, trangThai, maKhachHang],
    queryFn: () => ticketsApi.list({ maKhachHang, trangThaiVe: trangThai || undefined, page, size: 20 }),
  })

  const clearCustomerFilter = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('maKhachHang')
    setSearchParams(next)
    setPage(0)
  }

  return (
    <>
      <div className="card p-4 flex gap-3 flex-wrap">
        <select value={trangThai} onChange={(e) => { setTrangThai(e.target.value); setPage(0) }} className="input text-sm w-auto">
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {trangThai && (
          <button onClick={() => { setTrangThai(''); setPage(0) }} className="btn-secondary text-sm">
            <X size={14} /> Xóa lọc
          </button>
        )}
        {maKhachHang && (
          <button onClick={clearCustomerFilter} className="btn-secondary text-sm">
            <X size={14} /> Khách hàng #{maKhachHang}
          </button>
        )}
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
                    <th className="table-th">Mã vé</th>
                    <th className="table-th">Khách hàng</th>
                    <th className="table-th">Chuyến bay</th>
                    <th className="table-th">Tuyến bay</th>
                    <th className="table-th">Ngày bay</th>
                    <th className="table-th">Hạng vé</th>
                    <th className="table-th text-right">Giá vé</th>
                    <th className="table-th">Trạng thái</th>
                    <th className="table-th"></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((t) => (
                    <tr key={t.maVe} className="border-t hover:bg-gray-50">
                      <td className="table-td font-mono text-xs text-blue-600">{t.maVeCode}</td>
                      <td className="table-td font-medium">{t.khachHang.hoTen}</td>
                      <td className="table-td">{t.chuyenBay.maChuyenBayCode}</td>
                      <td className="table-td text-xs">{t.chuyenBay.sanBayDi}→{t.chuyenBay.sanBayDen}</td>
                      <td className="table-td text-xs">{formatDateTime(t.chuyenBay.ngayGioBay)}</td>
                      <td className="table-td">{t.hangVe.tenHangVe}</td>
                      <td className="table-td text-right">{formatCurrency(t.giaVe)}</td>
                      <td className="table-td">
                        <span className={`badge ${TICKET_STATUS_COLOR[t.trangThaiVe]}`}>
                          {TICKET_STATUS_LABEL[t.trangThaiVe]}
                        </span>
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => navigate(`/tickets/${t.maVe}`)}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data?.data.length === 0 && <EmptyState message="Không có vé nào" />}
            {data?.pagination && <Pagination {...data.pagination} onChange={setPage} />}
          </>
        )}
      </div>
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TicketsPage() {
  const { user } = useAuth()
  const isKhachHang = user?.vaiTro === 'KhachHang'

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Danh sách vé</h1>
      {isKhachHang ? <CustomerTicketsView /> : <StaffTicketsView />}
    </div>
  )
}
