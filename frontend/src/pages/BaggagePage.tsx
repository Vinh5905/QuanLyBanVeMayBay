import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { baggageApi } from '../api/baggage.api'
import { ticketsApi } from '../api/tickets.api'
import { formatCurrency, formatDateTime, TICKET_STATUS_LABEL, TICKET_STATUS_COLOR } from '../utils/format'
import { useSearchParams } from 'react-router-dom'
import Spinner from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import { Plus, Trash2, AlertCircle, ChevronDown, ChevronUp, Briefcase, CheckCircle, Minus } from 'lucide-react'
import { useConfig } from '../contexts/ConfigContext'
import { useAuth } from '../contexts/AuthContext'
import { differenceInHours, parseISO } from 'date-fns'
import type { Ticket, BaggagePricing } from '../types'

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

  // For the add modal: map of maBangGia -> quantity
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  const totalItems = baggage.reduce((s, b) => s + b.danhSachKien.length, 0)
  const canAddMore = totalItems < soKienMax
  const hasSelection = Object.values(quantities).some((q) => q > 0)

  const registerMutation = useMutation({
    mutationFn: async () => {
      // For each package type with quantity > 0, create a separate baggage package
      const results = []
      for (const pkg of pricing) {
        const qty = quantities[pkg.maBangGia] ?? 0
        if (qty <= 0) continue
        const danhSachKien = Array.from({ length: qty }, () => ({
          trongLuong: pkg.trongLuongToiDa,
        }))
        const result = await baggageApi.register({
          maVe: ticket.maVe,
          maBangGia: pkg.maBangGia,
          danhSachKien,
        })
        results.push(result)
      }
      return results
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['baggage', ticket.maVe] })
      toast.success('Đăng ký hành lý thành công')
      setShowAdd(false)
      setQuantities({})
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => baggageApi.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['baggage', ticket.maVe] }); toast.success('Đã hủy gói hành lý') },
    onError: (e: Error) => toast.error(e.message),
  })

  // Calculate price per piece (early or airport)
  const getPrice = (p: BaggagePricing) => isEarlyPurchase ? p.giaMuaTruoc : p.giaTaiSanBay

  // Calculate total cost of pending additions
  const addTotal = pricing.reduce((sum, p) => {
    const qty = quantities[p.maBangGia] ?? 0
    return sum + getPrice(p) * qty
  }, 0)

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
          {isEarlyPurchase
            ? `Giá mua trước (còn ≥${thoiGianUuDai}h trước giờ bay)`
            : 'Giá tại sân bay (đã quá hạn mua ưu đãi)'}
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
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{pkg.bangGia.tenGoi}</p>
                    {/* Payment status badge */}
                    {pkg.daThanhToan ? (
                      <span className="inline-flex items-center gap-0.5 text-xs text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                        <CheckCircle size={10} /> Đã thanh toán
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-xs text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                        Chưa thanh toán
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{pkg.danhSachKien.length} kiện · {pkg.tongTrongLuong} kg</p>
                </div>
                <div className="text-right shrink-0 ml-3">
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
        disabled={!canAddMore}
        className="btn-secondary text-sm w-full justify-center"
        title={!canAddMore ? `Đã đạt tối đa ${soKienMax} kiện` : undefined}
      >
        <Plus size={14} /> Thêm hành lý
      </button>

      {/* Add modal — quantity-based selection */}
      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); setQuantities({}) }}
        title="Thêm hành lý ký gửi"
        size="lg"
        footer={
          <>
            <button onClick={() => { setShowAdd(false); setQuantities({}) }} className="btn-secondary">Hủy</button>
            <button
              onClick={() => registerMutation.mutate()}
              disabled={!hasSelection || registerMutation.isPending}
              className="btn-primary"
            >
              {registerMutation.isPending ? <Spinner size="sm" /> : `Xác nhận · ${formatCurrency(addTotal)}`}
            </button>
          </>
        }
      >
        <div className="space-y-4 text-sm">
          <p className="text-gray-500">
            Chọn gói hành lý và số lượng kiện cho từng gói.
            Mỗi kiện có trọng lượng tối đa {trongLuongMax} kg.
          </p>

          <div className="divide-y">
            {pricing.map((p) => {
              const qty = quantities[p.maBangGia] ?? 0
              const pricePerPiece = getPrice(p)
              const subtotal = pricePerPiece * qty
              return (
                <div key={p.maBangGia} className="flex items-center gap-4 py-3">
                  {/* Package info */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{p.tenGoi}</p>
                    <p className="text-xs text-gray-500">
                      {p.trongLuongToiDa} kg/kiện · {formatCurrency(pricePerPiece)}/kiện
                      {isEarlyPurchase ? ' (giá ưu đãi)' : ' (giá tại sân bay)'}
                    </p>
                  </div>

                  {/* Quantity control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantities({ ...quantities, [p.maBangGia]: Math.max(0, qty - 1) })}
                      disabled={qty <= 0}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold text-lg">{qty}</span>
                    <button
                      onClick={() => {
                        const newQty = qty + 1
                        if (totalItems + Object.values(quantities).reduce((s, v) => s + v, 0) + 1 - qty + newQty > soKienMax) return
                        setQuantities({ ...quantities, [p.maBangGia]: newQty })
                      }}
                      disabled={totalItems + Object.values(quantities).reduce((s, v) => s + v, 0) + 1 > soKienMax}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="w-28 text-right">
                    {qty > 0 && (
                      <>
                        <p className="font-semibold text-blue-600">{formatCurrency(subtotal)}</p>
                        <p className="text-xs text-gray-400">{qty} kiện</p>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Grand total */}
          {addTotal > 0 && (
            <div className="flex justify-between items-center bg-blue-50 rounded-lg p-3 border border-blue-200">
              <span className="font-semibold text-gray-800">Tổng tiền hành lý thêm</span>
              <span className="text-lg font-bold text-blue-600">{formatCurrency(addTotal)}</span>
            </div>
          )}

          {pricing.length === 0 && (
            <p className="text-center text-gray-400 py-4">Không có gói hành lý nào</p>
          )}
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
