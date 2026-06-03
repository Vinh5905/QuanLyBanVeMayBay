import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { baggageApi } from '../api/baggage.api'
import { ticketsApi } from '../api/tickets.api'
import { formatCurrency, formatDateTime, TICKET_STATUS_LABEL, TICKET_STATUS_COLOR } from '../utils/format'
import { useSearchParams } from 'react-router-dom'
import Spinner from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import { Plus, Trash2, AlertCircle, ChevronDown, ChevronUp, Briefcase } from 'lucide-react'
import { useConfig } from '../contexts/ConfigContext'
import { useAuth } from '../contexts/AuthContext'
import { differenceInHours, parseISO } from 'date-fns'
import type { Ticket } from '../types'

function TicketBaggagePanel({ ticket }: { ticket: Ticket }) {
  const qc = useQueryClient()
  const toast = useToast()
  const { getNum } = useConfig()

  const thoiGianUuDai = getNum('ThoiGianMuaHanhLyUuDai', 3)
  const trongLuongMax = getNum('TrongLuongToiDaMotKien', 32)
  const soKienMax = getNum('SoKienToiDa', 15)

  const isEarlyPurchase = differenceInHours(parseISO(ticket.chuyenBay.ngayGioBay), new Date()) >= thoiGianUuDai

  const { data: baggage = [], isLoading } = useQuery({
    queryKey: ['baggage', ticket.maVe],
    queryFn: () => baggageApi.byTicket(ticket.maVe),
  })

  const { data: pricing = [] } = useQuery({
    queryKey: ['baggage-pricing'],
    queryFn: baggageApi.pricing,
    staleTime: Infinity,
  })

  const [showAdd, setShowAdd] = useState(false)
  const [selectedPricing, setSelectedPricing] = useState<number | null>(null)
  const [items, setItems] = useState<{ trongLuong: number; ghiChu: string }[]>([{ trongLuong: 20, ghiChu: '' }])

  const totalItems = baggage.reduce((s, b) => s + b.danhSachKien.length, 0)
  const addItemValid = items.every((item) => item.trongLuong > 0 && item.trongLuong <= trongLuongMax)

  const registerMutation = useMutation({
    mutationFn: () => baggageApi.register({ maVe: ticket.maVe, maBangGia: selectedPricing!, danhSachKien: items }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['baggage', ticket.maVe] })
      toast.success('Đăng ký hành lý thành công')
      setShowAdd(false)
      setSelectedPricing(null)
      setItems([{ trongLuong: 20, ghiChu: '' }])
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => baggageApi.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['baggage', ticket.maVe] }); toast.success('Đã hủy gói hành lý') },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="px-4 pb-4 pt-2 border-t bg-gray-50 space-y-3">
      {/* Ticket info strip */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TICKET_STATUS_COLOR[ticket.trangThaiVe]}`}>
            {TICKET_STATUS_LABEL[ticket.trangThaiVe]}
          </span>
          <span className="ml-2 text-gray-500">{ticket.chuyenBay.sanBayDi}→{ticket.chuyenBay.sanBayDen} · {formatDateTime(ticket.chuyenBay.ngayGioBay)}</span>
        </div>
        <span className={`text-xs font-medium ${isEarlyPurchase ? 'text-green-600' : 'text-amber-600'}`}>
          {isEarlyPurchase ? `Giá ưu đãi (trước ${thoiGianUuDai}h)` : 'Giá tại sân bay'}
        </span>
      </div>

      {/* Baggage list */}
      {isLoading ? (
        <div className="flex justify-center py-4"><Spinner /></div>
      ) : baggage.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Chưa có hành lý nào</p>
      ) : (
        <div className="space-y-2">
          {baggage.map((pkg) => (
            <div key={pkg.maGoiHanhLy} className="bg-white rounded-lg p-3 border text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{pkg.bangGia.tenGoi}</p>
                  <p className="text-xs text-gray-500">{pkg.danhSachKien.length} kiện · {pkg.tongTrongLuong} kg</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(pkg.tongPhi)}</p>
                  <button onClick={() => cancelMutation.mutate(pkg.maGoiHanhLy)} className="text-red-500 hover:underline text-xs mt-1 flex items-center gap-1 ml-auto">
                    <Trash2 size={10} /> Hủy gói
                  </button>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap mt-2">
                {pkg.danhSachKien.map((item) => (
                  <span key={item.maKienHanhLy} className="bg-gray-50 border rounded px-2 py-0.5 text-xs font-mono text-gray-500">
                    {item.trongLuong} kg
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      <button
        onClick={() => setShowAdd(true)}
        disabled={totalItems >= soKienMax}
        className="btn-secondary text-sm w-full justify-center"
      >
        <Plus size={14} /> Thêm gói hành lý
      </button>

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Thêm gói hành lý" size="lg"
        footer={
          <>
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Hủy</button>
            <button onClick={() => registerMutation.mutate()} disabled={!selectedPricing || !addItemValid || registerMutation.isPending} className="btn-primary">
              {registerMutation.isPending ? <Spinner size="sm" /> : 'Đăng ký hành lý'}
            </button>
          </>
        }>
        <div className="space-y-4 text-sm">
          <div>
            <label className="label">Gói hành lý</label>
            <div className="grid grid-cols-2 gap-3">
              {pricing.map((p) => (
                <div
                  key={p.maBangGia}
                  onClick={() => setSelectedPricing(p.maBangGia)}
                  className={`p-3 border rounded-lg cursor-pointer ${selectedPricing === p.maBangGia ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <p className="font-semibold">{p.tenGoi}</p>
                  <p className="text-xs text-gray-500 mt-1">Tối đa {p.trongLuongToiDa} kg/kiện</p>
                  <p className="text-green-600 font-medium mt-1">{formatCurrency(isEarlyPurchase ? p.giaMuaTruoc : p.giaTaiSanBay)}</p>
                  <p className="text-xs text-gray-400">{isEarlyPurchase ? 'Giá ưu đãi' : 'Giá tại sân bay'}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Kiện hành lý</label>
              <button onClick={() => setItems([...items, { trongLuong: 20, ghiChu: '' }])} className="text-blue-600 text-xs hover:underline">+ Thêm kiện</button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={item.trongLuong}
                      onChange={(e) => {
                        const updated = [...items]
                        updated[idx] = { ...updated[idx], trongLuong: Number(e.target.value) }
                        setItems(updated)
                      }}
                      max={trongLuongMax}
                      placeholder={`Trọng lượng (tối đa ${trongLuongMax} kg)`}
                      className="input text-sm"
                    />
                    {item.trongLuong > trongLuongMax && (
                      <p className="text-xs text-red-600 mt-1 flex gap-1 items-center"><AlertCircle size={12} />Vượt {trongLuongMax} kg</p>
                    )}
                  </div>
                  <input
                    value={item.ghiChu}
                    onChange={(e) => {
                      const updated = [...items]
                      updated[idx] = { ...updated[idx], ghiChu: e.target.value }
                      setItems(updated)
                    }}
                    placeholder="Ghi chú"
                    className="input text-sm flex-1"
                  />
                  {items.length > 1 && (
                    <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="p-2 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function TicketRow({ ticket, defaultOpen }: { ticket: Ticket; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false)

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <Briefcase size={16} className="text-blue-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-mono font-bold text-blue-600 text-sm">{ticket.maVeCode}</p>
          <p className="text-xs text-gray-500 truncate">{ticket.khachHang.hoTen} · {ticket.chuyenBay.maChuyenBayCode} · {ticket.hangVe.tenHangVe}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TICKET_STATUS_COLOR[ticket.trangThaiVe]}`}>
          {TICKET_STATUS_LABEL[ticket.trangThaiVe]}
        </span>
        {open ? <ChevronUp size={16} className="shrink-0 text-gray-400" /> : <ChevronDown size={16} className="shrink-0 text-gray-400" />}
      </button>
      {open && <TicketBaggagePanel ticket={ticket} />}
    </div>
  )
}

export default function BaggagePage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const isKhachHang = user?.vaiTro === 'KhachHang'

  // For KhachHang: load their own tickets
  const { data: myTickets = [], isLoading: loadingMy } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: ticketsApi.myTickets,
    enabled: isKhachHang,
  })

  // For staff: manual ticket lookup
  const [maVeInput, setMaVeInput] = useState(searchParams.get('maVe') || '')
  const [maVe, setMaVe] = useState<number | null>(
    searchParams.get('maVe') ? Number(searchParams.get('maVe')) : null
  )
  const { data: staffTicket } = useQuery({
    queryKey: ['ticket', maVe],
    queryFn: () => ticketsApi.get(maVe!),
    enabled: !isKhachHang && !!maVe,
  })

  const activeTickets = myTickets.filter((t) => t.trangThaiVe === 'HOP_LE' || t.trangThaiVe === 'DANG_GIU_CHO')
  const otherTickets = myTickets.filter((t) => t.trangThaiVe !== 'HOP_LE' && t.trangThaiVe !== 'DANG_GIU_CHO')

  const defaultOpenId = searchParams.get('maVe') ? Number(searchParams.get('maVe')) : null

  if (isKhachHang) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Hành lý ký gửi</h1>

        {loadingMy ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : myTickets.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">Bạn chưa có vé nào</div>
        ) : (
          <>
            {activeTickets.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vé có thể thêm hành lý</p>
                {activeTickets.map((t) => (
                  <TicketRow key={t.maVe} ticket={t} defaultOpen={t.maVe === defaultOpenId} />
                ))}
              </div>
            )}
            {otherTickets.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vé khác</p>
                {otherTickets.map((t) => (
                  <TicketRow key={t.maVe} ticket={t} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Staff view
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Hành lý ký gửi</h1>

      <div className="card p-4">
        <div className="flex gap-3">
          <input
            value={maVeInput}
            onChange={(e) => setMaVeInput(e.target.value)}
            placeholder="Nhập mã vé (số) để tìm..."
            className="input flex-1 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && setMaVe(Number(maVeInput))}
          />
          <button onClick={() => setMaVe(Number(maVeInput))} className="btn-primary text-sm">Tìm vé</button>
        </div>
      </div>

      {staffTicket && (
        <TicketRow ticket={staffTicket} defaultOpen />
      )}
    </div>
  )
}
