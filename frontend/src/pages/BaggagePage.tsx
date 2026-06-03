import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { baggageApi } from '../api/baggage.api'
import { ticketsApi } from '../api/tickets.api'
import { paymentsApi } from '../api/payments.api'
import { formatCurrency, formatDateTime, TICKET_STATUS_LABEL, TICKET_STATUS_COLOR, PAYMENT_METHOD_LABEL } from '../utils/format'
import { useSearchParams } from 'react-router-dom'
import Spinner from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import { Plus, Trash2, AlertCircle, ChevronDown, ChevronUp, Briefcase, CheckCircle, Minus, CreditCard } from 'lucide-react'
import { useConfig } from '../contexts/ConfigContext'
import { useAuth } from '../contexts/AuthContext'
import { differenceInHours, parseISO } from 'date-fns'
import type { Ticket, BaggagePricing, BaggagePackage, PaymentMethod } from '../types'

function TicketBaggagePanel({ ticket }: { ticket: Ticket }) {
  const qc = useQueryClient()
  const toast = useToast()
  const { getNum } = useConfig()

  const thoiGianUuDai = getNum('ThoiGianMuaHanhLyUuDai', 3)
  const trongLuongMax = getNum('TrongLuongToiDaMotKien', 32)
  const soKienMax = getNum('SoKienToiDa', 15)
  const vatRate = getNum('ThueVAT', 10) / 100

  const isEarlyPurchase = differenceInHours(parseISO(ticket.chuyenBay.ngayGioBay), new Date()) >= thoiGianUuDai
  const canUseBaggageService = ticket.trangThaiVe === 'HOP_LE'

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
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMode, setPaymentMode] = useState<'new' | 'existing'>('new')
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH')

  const [quantities, setQuantities] = useState<Record<number, number>>({})

  const totalItems = baggage.reduce((s, b) => s + b.danhSachKien.length, 0)
  const paidItems = baggage.filter((b) => b.daThanhToan).reduce((s, b) => s + b.danhSachKien.length, 0)
  const pendingItems = baggage.filter((b) => !b.daThanhToan).reduce((s, b) => s + b.danhSachKien.length, 0)
  const selectedItems = Object.values(quantities).reduce((s, q) => s + q, 0)
  const remainingSlots = Math.max(0, soKienMax - totalItems - selectedItems)
  const canAddMore = canUseBaggageService && totalItems < soKienMax
  const hasSelection = selectedItems > 0

  const unpaidBaggage = baggage.filter((b) => !b.daThanhToan)
  const existingBaggageTotal = unpaidBaggage.reduce((sum, b) => sum + b.tongPhi, 0)
  const paidBaggageTotal = baggage.filter((b) => b.daThanhToan).reduce((sum, b) => sum + b.tongPhi, 0)
  const paidBaggageVat = Math.round(paidBaggageTotal * vatRate)
  const paidBaggageTotalWithVat = paidBaggageTotal + paidBaggageVat
  const pendingBaggageVat = Math.round(existingBaggageTotal * vatRate)
  const pendingBaggageTotalWithVat = existingBaggageTotal + pendingBaggageVat

  const getPrice = (p: BaggagePricing) => isEarlyPurchase ? p.giaMuaTruoc : p.giaTaiSanBay

  const selectedLines = pricing
    .map((p) => {
      const qty = quantities[p.maBangGia] ?? 0
      return {
        pricing: p,
        qty,
        pricePerPiece: getPrice(p),
        subtotal: getPrice(p) * qty,
      }
    })
    .filter((line) => line.qty > 0)

  const addTotal = selectedLines.reduce((sum, line) => sum + line.subtotal, 0)
  const paymentBaseTotal = paymentMode === 'new' ? addTotal : existingBaggageTotal
  const paymentVat = Math.round(paymentBaseTotal * vatRate)
  const paymentTotal = paymentBaseTotal + paymentVat

  const resetAddFlow = () => {
    setShowAdd(false)
    setShowPayment(false)
    setQuantities({})
    setPaymentMode('new')
    setPayMethod('CASH')
  }

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const createdPackages: BaggagePackage[] = []
      try {
        let packageIds: number[] = []

        if (paymentMode === 'new') {
          for (const line of selectedLines) {
            const result = await baggageApi.register({
              maVe: ticket.maVe,
              maBangGia: line.pricing.maBangGia,
              danhSachKien: Array.from({ length: line.qty }, () => ({
                trongLuong: line.pricing.trongLuongToiDa,
              })),
            })
            createdPackages.push(result)
          }
          packageIds = createdPackages.map((pkg) => pkg.maGoiHanhLy)
        } else {
          packageIds = unpaidBaggage.map((pkg) => pkg.maGoiHanhLy)
        }

        await paymentsApi.create({
          maVe: ticket.maVe,
          hinhThucThanhToan: payMethod,
          soTienThanhToan: paymentTotal,
          loaiThanhToan: 'BAGGAGE',
          maGoiHanhLyList: packageIds,
        })

        return { packageIds, createdPackages }
      } catch (error) {
        if (createdPackages.length > 0) {
          await Promise.allSettled(createdPackages.map((pkg) => baggageApi.cancel(pkg.maGoiHanhLy)))
        }
        throw error
      }
    },
    onSuccess: (result) => {
      const paidIds = new Set(result.packageIds)
      qc.setQueryData<BaggagePackage[]>(['baggage', ticket.maVe], (current = []) => {
        const byId = new Map(current.map((pkg) => [pkg.maGoiHanhLy, pkg]))
        result.createdPackages.forEach((pkg) => {
          byId.set(pkg.maGoiHanhLy, { ...pkg, daThanhToan: true, trangThai: 'ACTIVE' })
        })
        return Array.from(byId.values()).map((pkg) => (
          paidIds.has(pkg.maGoiHanhLy)
            ? { ...pkg, daThanhToan: true, trangThai: 'ACTIVE' }
            : pkg
        ))
      })
      qc.invalidateQueries({ queryKey: ['baggage', ticket.maVe] })
      toast.success('Thanh toán hành lý thành công')
      resetAddFlow()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => baggageApi.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['baggage', ticket.maVe] }); toast.success('Đã hủy gói hành lý') },
    onError: (e: Error) => toast.error(e.message),
  })

  const openPaymentForNewBaggage = () => {
    setPaymentMode('new')
    setShowAdd(false)
    setShowPayment(true)
  }

  const openPaymentForExistingBaggage = () => {
    setPaymentMode('existing')
    setShowPayment(true)
  }

  return (
    <div className="space-y-4 border-t bg-gray-50 px-4 pb-4 pt-3">
      <div className="grid gap-3 text-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TICKET_STATUS_COLOR[ticket.trangThaiVe]}`}>
              {TICKET_STATUS_LABEL[ticket.trangThaiVe]}
            </span>
            <span className="text-gray-600">
              {ticket.chuyenBay.sanBayDi}→{ticket.chuyenBay.sanBayDen} · {formatDateTime(ticket.chuyenBay.ngayGioBay)}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
            <div className="rounded-lg border bg-white px-3 py-2">
              <p className="text-xs text-gray-400">Tổng kiện</p>
              <p className="font-bold text-gray-900">{totalItems}/{soKienMax}</p>
            </div>
            <div className="rounded-lg border bg-white px-3 py-2">
              <p className="text-xs text-gray-400">Đã thanh toán</p>
              <p className="font-bold text-green-700">{paidItems}</p>
            </div>
            <div className="rounded-lg border bg-white px-3 py-2">
              <p className="text-xs text-gray-400">Chờ thanh toán</p>
              <p className="font-bold text-amber-700">{pendingItems}</p>
            </div>
            <div className="rounded-lg border bg-white px-3 py-2">
              <p className="text-xs text-gray-400">Đã trả gồm VAT</p>
              <p className="font-bold text-green-700">{formatCurrency(paidBaggageTotalWithVat)}</p>
            </div>
            <div className="rounded-lg border bg-white px-3 py-2">
              <p className="text-xs text-gray-400">Chờ trả gồm VAT</p>
              <p className="font-bold text-amber-700">{formatCurrency(pendingBaggageTotalWithVat)}</p>
            </div>
          </div>
        </div>
        <div className={`rounded-lg border px-3 py-2 text-xs font-medium ${isEarlyPurchase ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
          {isEarlyPurchase ? `Giá mua trước · còn >= ${thoiGianUuDai}h` : 'Giá tại sân bay'}
        </div>
      </div>

      {!canUseBaggageService && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          Chỉ có thể mua hành lý ký gửi sau khi vé ở trạng thái hợp lệ.
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-4"><Spinner /></div>
      ) : baggage.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white p-6 text-center text-sm text-gray-400">
          Chưa có hành lý ký gửi cho vé này
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {baggage.map((pkg) => (
            <div key={pkg.maGoiHanhLy} className="rounded-lg border bg-white p-3 text-sm shadow-sm">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-gray-900">{pkg.bangGia.tenGoi}</p>
                    {pkg.daThanhToan ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        <CheckCircle size={10} /> Đã thanh toán
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        Chưa thanh toán
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {pkg.danhSachKien.length} kiện · {pkg.tongTrongLuong} kg · #{pkg.maGoiHanhLy}
                  </p>
                </div>
                <div className="ml-3 shrink-0 text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(pkg.tongPhi)}</p>
                  {!pkg.daThanhToan && (
                    <button onClick={() => cancelMutation.mutate(pkg.maGoiHanhLy)} className="ml-auto mt-1 flex items-center gap-1 text-xs text-red-500 hover:underline">
                      <Trash2 size={10} /> Hủy gói
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {pkg.danhSachKien.map((item) => (
                  <span key={item.maKienHanhLy} className="rounded border bg-gray-50 px-2 py-0.5 font-mono text-xs text-gray-500">
                    {item.trongLuong} kg
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowAdd(true)}
          disabled={!canAddMore}
          className="btn-secondary justify-center text-sm"
          title={!canAddMore ? `Đã đạt tối đa ${soKienMax} kiện hoặc vé chưa hợp lệ` : undefined}
        >
          <Plus size={14} /> Thêm hành lý
        </button>
        {unpaidBaggage.length > 0 && (
          <button onClick={openPaymentForExistingBaggage} className="btn-primary justify-center text-sm">
            <CreditCard size={14} /> Thanh toán hành lý chờ · {formatCurrency(pendingBaggageTotalWithVat)}
          </button>
        )}
      </div>

      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); setQuantities({}) }}
        title="Thêm hành lý ký gửi"
        size="3xl"
        footer={
          <>
            <button onClick={() => { setShowAdd(false); setQuantities({}) }} className="btn-secondary">Hủy</button>
            <button
              onClick={openPaymentForNewBaggage}
              disabled={!hasSelection || addTotal <= 0}
              className="btn-primary"
            >
              <CreditCard size={16} /> Thanh toán {formatCurrency(addTotal + Math.round(addTotal * vatRate))}
            </button>
          </>
        }
      >
        <div className="grid gap-5 text-sm lg:grid-cols-[minmax(520px,1fr)_340px]">
          <div className="space-y-3">
            <div className="rounded-lg border bg-gray-50 p-4 leading-relaxed text-gray-600">
              <p>Mỗi kiện tối đa {trongLuongMax} kg. Vé còn có thể mua thêm {Math.max(0, soKienMax - totalItems)} kiện.</p>
            </div>

            {pricing.length === 0 ? (
              <p className="py-6 text-center text-gray-400">Không có gói hành lý nào</p>
            ) : (
              pricing.map((p) => {
                const qty = quantities[p.maBangGia] ?? 0
                const pricePerPiece = getPrice(p)
                const subtotal = pricePerPiece * qty
                const canIncrease = totalItems + selectedItems < soKienMax
                return (
                  <div key={p.maBangGia} className={`rounded-lg border bg-white p-4 transition-colors ${qty > 0 ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'}`}>
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900">{p.tenGoi}</p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">
                          {p.trongLuongToiDa} kg/kiện · {formatCurrency(pricePerPiece)}/kiện · {isEarlyPurchase ? 'giá mua trước' : 'giá tại sân bay'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 xl:min-w-[260px] xl:justify-end">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQuantities({ ...quantities, [p.maBangGia]: Math.max(0, qty - 1) })}
                            disabled={qty <= 0}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-lg font-bold">{qty}</span>
                          <button
                            onClick={() => setQuantities({ ...quantities, [p.maBangGia]: qty + 1 })}
                            disabled={!canIncrease}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="w-28 text-right">
                          <p className={`font-bold ${qty > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                            {formatCurrency(subtotal)}
                          </p>
                          <p className="text-xs text-gray-400">{qty} kiện</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="rounded-lg border bg-white p-4">
            <p className="font-semibold text-gray-900">Tóm tắt thanh toán</p>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Số kiện chọn</span>
                <span className="font-medium text-gray-900">{selectedItems}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Còn lại</span>
                <span className="font-medium text-gray-900">{remainingSlots}</span>
              </div>
              {selectedLines.map((line) => (
                <div key={line.pricing.maBangGia} className="flex justify-between text-xs text-gray-500">
                  <span>{line.pricing.tenGoi} x{line.qty}</span>
                  <span>{formatCurrency(line.subtotal)}</span>
                </div>
              ))}
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí hành lý</span>
                  <span className="font-medium">{formatCurrency(addTotal)}</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>VAT ({getNum('ThueVAT', 10)}%)</span>
                  <span>{formatCurrency(Math.round(addTotal * vatRate))}</span>
                </div>
                <div className="mt-2 flex justify-between text-base font-bold">
                  <span>Tổng</span>
                  <span className="text-blue-600">{formatCurrency(addTotal + Math.round(addTotal * vatRate))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        title="Thanh toán hành lý ký gửi"
        footer={
          <>
            <button onClick={() => setShowPayment(false)} className="btn-secondary">Hủy</button>
            <button
              onClick={() => paymentMutation.mutate()}
              disabled={paymentMutation.isPending || paymentTotal <= 0}
              className="btn-primary"
            >
              {paymentMutation.isPending ? <Spinner size="sm" /> : `Thanh toán ${formatCurrency(paymentTotal)}`}
            </button>
          </>
        }
      >
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border bg-gray-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Dịch vụ</p>
            <p className="mt-1 font-semibold text-gray-900">
              {paymentMode === 'new' ? 'Mua thêm hành lý ký gửi' : 'Thanh toán hành lý đã đăng ký'}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">{ticket.maVeCode} · {ticket.khachHang.hoTen}</p>
          </div>

          <div className="space-y-2">
            {paymentMode === 'new'
              ? selectedLines.map((line) => (
                  <div key={line.pricing.maBangGia} className="flex justify-between">
                    <span className="text-gray-600">{line.pricing.tenGoi} x{line.qty}</span>
                    <span className="font-medium">{formatCurrency(line.subtotal)}</span>
                  </div>
                ))
              : unpaidBaggage.map((pkg) => (
                  <div key={pkg.maGoiHanhLy} className="flex justify-between">
                    <span className="text-gray-600">{pkg.bangGia.tenGoi} · {pkg.danhSachKien.length} kiện</span>
                    <span className="font-medium">{formatCurrency(pkg.tongPhi)}</span>
                  </div>
                ))}
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">VAT ({getNum('ThueVAT', 10)}%)</span>
              <span className="font-medium">{formatCurrency(paymentVat)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Tổng thanh toán</span>
              <span className="text-blue-600">{formatCurrency(paymentTotal)}</span>
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

  const activeTickets = myTickets.filter((t) => t.trangThaiVe === 'HOP_LE')
  const otherTickets = myTickets.filter((t) => t.trangThaiVe !== 'HOP_LE')

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
