import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { checkinApi } from '../api/checkin.api'
import { ticketsApi } from '../api/tickets.api'
import { formatCurrency, formatDateTime } from '../utils/format'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Spinner from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../contexts/AuthContext'
import { useConfig } from '../contexts/ConfigContext'
import { differenceInHours, differenceInMinutes, parseISO, addHours, format } from 'date-fns'
import { AlertCircle, CheckCircle, Printer, Plane } from 'lucide-react'
import type { BoardingPass, Ticket } from '../types'

function BoardingPassCard({ bp }: { bp: BoardingPass }) {
  return (
    <div id="boarding-pass" className="card max-w-2xl mx-auto overflow-hidden">
      {/* Header bar */}
      <div className="bg-blue-700 text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs opacity-70">HÃNG HÀNG KHÔNG</p>
            <p className="text-xl font-bold mt-0.5">Quản Lý Vé Máy Bay</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">BOARDING PASS</p>
            <p className="text-sm font-mono font-bold">{bp.boardingPassCode}</p>
          </div>
        </div>
      </div>

      {/* Flight info */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">{bp.chuyenBay.sanBayDi}</p>
            <p className="text-sm text-gray-500 mt-1">{bp.chuyenBay.tenSanBayDi}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-gray-700">{bp.chuyenBay.maChuyenBayCode}</p>
            <div className="border-t-2 border-dashed border-gray-300 my-1 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-blue-500 text-xl">✈</span>
            </div>
            <p className="text-xs text-gray-400">{formatDateTime(bp.chuyenBay.ngayGioBay)}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">{bp.chuyenBay.sanBayDen}</p>
            <p className="text-sm text-gray-500 mt-1">{bp.chuyenBay.tenSanBayDen}</p>
          </div>
        </div>

        {/* Passenger details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase">Hành khách</p>
            <p className="font-bold mt-0.5">{bp.hanhKhach.hoTen}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Hạng vé</p>
            <p className="font-bold mt-0.5">{bp.ve.hangVe}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Số ghế</p>
            <p className="font-bold mt-0.5 text-blue-600">{bp.soGhe || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Check-in lúc</p>
            <p className="font-bold mt-0.5">{formatDateTime(bp.checkInAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
          <CheckCircle size={16} />
          <span>Check-in thành công · Mã xác nhận: <span className="font-mono font-bold">{bp.boardingPassCode}</span></span>
        </div>
      </div>

      {/* Print button (hidden on print) */}
      <div className="px-6 pb-5 no-print">
        <button onClick={() => window.print()} className="btn-secondary w-full justify-center">
          <Printer size={16} /> In thẻ lên máy bay (PDF)
        </button>
      </div>
    </div>
  )
}

// ─── Check-in form for a single ticket ────────────────────────────────────────

function CheckInForm({ ticket, onComplete }: { ticket: Ticket; onComplete: (bp: BoardingPass) => void }) {
  const toast = useToast()
  const navigate = useNavigate()
  const { getNum } = useConfig()

  const moCheckIn = getNum('ThoiGianMoCheckInOnline', 24)
  const dongCheckIn = getNum('ThoiGianDongCheckInOnline', 60)

  const { data: existingBP } = useQuery({
    queryKey: ['boarding-pass', ticket.maVe],
    queryFn: () => checkinApi.getBoardingPass(ticket.maVe),
    enabled: ticket.trangThaiVe === 'HOP_LE',
    retry: false,
  })

  const checkInMutation = useMutation({
    mutationFn: () => checkinApi.checkIn(ticket.maVe),
    onSuccess: (bp) => { onComplete(bp); toast.success('Check-in thành công!') },
    onError: (e: Error) => toast.error(e.message),
  })

  useEffect(() => {
    if (existingBP) {
      onComplete(existingBP)
    }
  }, [existingBP, onComplete])

  // Compute check-in window
  const dep = parseISO(ticket.chuyenBay.ngayGioBay)
  const now = new Date()
  const hoursUntil = differenceInHours(dep, now)
  const minutesUntil = differenceInMinutes(dep, now)

  let checkInStatus: 'early' | 'open' | 'closed' | 'invalid' = 'invalid'
  let statusMessage = ''

  if (ticket.trangThaiVe !== 'HOP_LE') {
    checkInStatus = 'invalid'
    statusMessage = 'Vé không hợp lệ để check-in'
  } else if (hoursUntil > moCheckIn) {
    checkInStatus = 'early'
    statusMessage = `Check-in online mở lúc ${format(addHours(dep, -moCheckIn), 'HH:mm dd/MM/yyyy')}`
  } else if (minutesUntil < dongCheckIn) {
    checkInStatus = 'closed'
    statusMessage = 'Check-in online đã đóng. Vui lòng làm thủ tục tại quầy.'
  } else {
    checkInStatus = 'open'
    statusMessage = `Check-in online đang mở. Đóng lúc ${format(addHours(dep, -dongCheckIn / 60), 'HH:mm')}`
  }

  if (existingBP) {
    return (
      <div className="card p-6 text-center text-sm text-gray-500">
        Đang mở thẻ lên máy bay đã check-in...
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b bg-white px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-sm font-bold text-blue-600">{ticket.maVeCode}</p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900">{ticket.khachHang.hoTen}</h2>
            <p className="mt-0.5 text-sm text-gray-500">{ticket.chuyenBay.maChuyenBayCode} · {ticket.hangVe.tenHangVe}</p>
          </div>
          <div className="rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <p className="text-xs text-gray-400">Khởi hành</p>
            <p className="font-medium text-gray-900">{formatDateTime(ticket.chuyenBay.ngayGioBay)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid items-center gap-4 rounded-lg border bg-gray-50 p-4 sm:grid-cols-[1fr_auto_1fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Điểm đi</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{ticket.chuyenBay.sanBayDi}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-white text-blue-600">
            <Plane size={18} />
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Điểm đến</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{ticket.chuyenBay.sanBayDen}</p>
          </div>
        </div>

        <div className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
          checkInStatus === 'open' ? 'border-green-200 bg-green-50 text-green-800' :
          checkInStatus === 'early' ? 'border-blue-200 bg-blue-50 text-blue-800' :
          'border-red-200 bg-red-50 text-red-800'
        }`}>
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p className="leading-relaxed">{statusMessage}</p>
        </div>

        {checkInStatus === 'open' && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-blue-600">
                <CheckCircle size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">Ghế sẽ được cấp tự động</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  Hệ thống sẽ random mã ghế khi bạn xác nhận check-in và in trên thẻ lên máy bay.
                </p>
              </div>
            </div>
            <button onClick={() => checkInMutation.mutate()} disabled={checkInMutation.isPending} className="btn-primary mt-4 w-full justify-center">
              {checkInMutation.isPending ? <Spinner size="sm" /> : 'Check-in và nhận ghế tự động'}
            </button>
          </div>
        )}

        {checkInStatus === 'invalid' && ticket.trangThaiVe === 'DANG_GIU_CHO' && (
          <button
            onClick={() => navigate(`/tickets/${ticket.maVe}`)}
            className="btn-primary w-full justify-center"
          >
            Thanh toán vé ngay
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CheckInPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const isKhachHang = user?.vaiTro === 'KhachHang'

  const maVeParam = searchParams.get('maVe') ? Number(searchParams.get('maVe')) : null
  const [maVeInput, setMaVeInput] = useState(maVeParam ? String(maVeParam) : '')
  const [maVe, setMaVe] = useState<number | null>(maVeParam)
  const [selectedMaVe, setSelectedMaVe] = useState<number | null>(maVeParam)
  const [boardingPass, setBoardingPass] = useState<BoardingPass | null>(null)

  // For KhachHang: auto-load paid tickets
  const { data: myTickets = [], isLoading: loadingTickets } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: ticketsApi.myTickets,
    enabled: isKhachHang,
  })

  // Filter tickets eligible for check-in (HOP_LE)
  const eligibleTickets = myTickets.filter((t) => t.trangThaiVe === 'HOP_LE')

  useEffect(() => {
    if (isKhachHang && selectedMaVe == null && eligibleTickets.length > 0) {
      setSelectedMaVe(eligibleTickets[0].maVe)
    }
  }, [eligibleTickets, isKhachHang, selectedMaVe])

  // Lookup specific ticket if entered manually
  const { data: lookupTicket } = useQuery({
    queryKey: ['ticket', maVe],
    queryFn: () => ticketsApi.get(maVe!),
    enabled: !!maVe && !isKhachHang,
  })

  const activeTicket = isKhachHang
    ? myTickets.find((t) => t.maVe === selectedMaVe) ?? null
    : lookupTicket ?? null

  // Boarding pass shown?
  if (boardingPass) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900 no-print">Thẻ lên máy bay</h1>
        <BoardingPassCard bp={boardingPass} />
        <div className="no-print flex gap-3 justify-center">
          <button onClick={() => setBoardingPass(null)} className="btn-secondary">Quay lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Check-in online</h1>
            <p className="mt-1 text-sm text-gray-500">
              Chọn vé hợp lệ, xác nhận check-in và hệ thống sẽ cấp ghế tự động.
            </p>
          </div>
          <div className="rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <p className="text-xs text-gray-400">Cửa sổ online</p>
            <p className="font-medium text-gray-900">24h đến 60 phút trước bay</p>
          </div>
        </div>
      </div>

      {/* KhachHang: auto-show eligible tickets */}
      {isKhachHang && (
        <>
          {loadingTickets ? (
            <div className="flex justify-center py-8"><Spinner size="lg" /></div>
          ) : eligibleTickets.length === 0 ? (
            <div className="card p-8 text-center text-gray-400 space-y-2">
              <Plane size={32} className="mx-auto text-gray-300" />
              <p>Bạn chưa có vé hợp lệ nào để check-in</p>
              <p className="text-xs text-gray-400">Vé cần có trạng thái Hợp lệ (đã thanh toán)</p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
              <div className="space-y-4">
                <div className="card p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Chọn vé để check-in</p>
                  <div className="mt-3 space-y-2">
                    {eligibleTickets.map((t) => (
                      <button
                        key={t.maVe}
                        onClick={() => setSelectedMaVe(t.maVe)}
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                          selectedMaVe === t.maVe ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Plane size={16} className="shrink-0 text-blue-500" />
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-sm font-bold text-blue-600">{t.maVeCode}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              {t.chuyenBay.sanBayDi}→{t.chuyenBay.sanBayDen} · {formatDateTime(t.chuyenBay.ngayGioBay)}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">{t.hangVe.tenHangVe}</p>
                          </div>
                          <span className="shrink-0 text-xs font-medium text-gray-500">{formatCurrency(t.giaVe)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div>
                {activeTicket ? (
                  <CheckInForm
                    key={activeTicket.maVe}
                    ticket={activeTicket}
                    onComplete={(bp) => setBoardingPass(bp)}
                  />
                ) : (
                  <div className="card p-8 text-center text-sm text-gray-400">
                    Chọn một vé hợp lệ để bắt đầu check-in.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Staff / Manual entry */}
      {!isKhachHang && (
        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="card p-4">
            <label className="label">Mã vé (số)</label>
            <div className="flex gap-3">
              <input
                value={maVeInput}
                onChange={(e) => setMaVeInput(e.target.value)}
                className="input flex-1"
                placeholder="Nhập mã vé..."
              />
              <button onClick={() => { setMaVe(Number(maVeInput)); setBoardingPass(null) }} className="btn-primary">
                Tìm
              </button>
            </div>
          </div>

          {activeTicket ? (
            <CheckInForm
              key={activeTicket.maVe}
              ticket={activeTicket}
              onComplete={(bp) => setBoardingPass(bp)}
            />
          ) : (
            <div className="card flex min-h-[260px] items-center justify-center p-8 text-center text-sm text-gray-400">
              Nhập mã vé để kiểm tra điều kiện check-in.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
