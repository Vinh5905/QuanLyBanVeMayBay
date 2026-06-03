import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { checkinApi } from '../api/checkin.api'
import { ticketsApi } from '../api/tickets.api'
import { formatDateTime } from '../utils/format'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Spinner from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { useConfig } from '../contexts/ConfigContext'
import { differenceInHours, differenceInMinutes, parseISO, addHours, format } from 'date-fns'
import { AlertCircle, CheckCircle, Printer } from 'lucide-react'
import type { BoardingPass } from '../types'

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

export default function CheckInPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getNum } = useConfig()

  const maVeParam = searchParams.get('maVe') ? Number(searchParams.get('maVe')) : null
  const [maVeInput, setMaVeInput] = useState(maVeParam ? String(maVeParam) : '')
  const [maVe, setMaVe] = useState<number | null>(maVeParam)
  const [soGhe, setSoGhe] = useState('')
  const [boardingPass, setBoardingPass] = useState<BoardingPass | null>(null)

  const moCheckIn = getNum('ThoiGianMoCheckInOnline', 24)
  const dongCheckIn = getNum('ThoiGianDongCheckInOnline', 60)

  const { data: ticket } = useQuery({
    queryKey: ['ticket', maVe],
    queryFn: () => ticketsApi.get(maVe!),
    enabled: !!maVe,
  })

  const { data: existingBP } = useQuery({
    queryKey: ['boarding-pass', maVe],
    queryFn: () => checkinApi.getBoardingPass(maVe!),
    enabled: !!maVe && !!ticket && ticket.trangThaiVe === 'HOP_LE',
    retry: false,
  })

  const checkInMutation = useMutation({
    mutationFn: () => checkinApi.checkIn(maVe!, soGhe),
    onSuccess: (bp) => { setBoardingPass(bp); toast.success('Check-in thành công!') },
    onError: (e: Error) => toast.error(e.message),
  })

  // Compute check-in window
  let checkInStatus: 'early' | 'open' | 'closed' | 'invalid' | null = null
  let statusMessage = ''
  if (ticket) {
    const dep = parseISO(ticket.chuyenBay.ngayGioBay)
    const now = new Date()
    const hoursUntil = differenceInHours(dep, now)
    const minutesUntil = differenceInMinutes(dep, now)

    if (ticket.trangThaiVe !== 'HOP_LE') {
      checkInStatus = 'invalid'
      statusMessage = `Vé không hợp lệ để check-in (trạng thái: ${ticket.trangThaiVe})`
    } else if (hoursUntil > moCheckIn) {
      checkInStatus = 'early'
      statusMessage = `Check-in online mở lúc ${format(addHours(dep, -moCheckIn), 'HH:mm dd/MM/yyyy')}`
    } else if (minutesUntil < dongCheckIn) {
      checkInStatus = 'closed'
      statusMessage = `Check-in online đã đóng. Vui lòng làm thủ tục tại quầy.`
    } else {
      checkInStatus = 'open'
      statusMessage = `Check-in online đang mở. Đóng lúc ${format(addHours(dep, -dongCheckIn / 60), 'HH:mm')}`
    }
  }

  if (boardingPass || existingBP) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900 no-print">Thẻ lên máy bay</h1>
        <BoardingPassCard bp={boardingPass ?? existingBP!} />
        <div className="no-print flex gap-3 justify-center">
          <button onClick={() => navigate(`/tickets/${maVe}`)} className="btn-secondary">Quay lại vé</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="text-xl font-bold text-gray-900">Check-in online</h1>

      <div className="card p-4">
        <label className="label">Mã vé (số)</label>
        <div className="flex gap-3">
          <input value={maVeInput} onChange={(e) => setMaVeInput(e.target.value)} className="input flex-1" placeholder="Nhập mã vé..." />
          <button onClick={() => { setMaVe(Number(maVeInput)); setBoardingPass(null) }} className="btn-primary">Tìm</button>
        </div>
      </div>

      {maVe && ticket && (
        <div className="card p-5 space-y-4">
          <div className="text-sm">
            <p className="font-mono font-bold text-blue-600">{ticket.maVeCode}</p>
            <p className="font-medium text-gray-900 mt-1">{ticket.khachHang.hoTen}</p>
            <p className="text-gray-500">{ticket.chuyenBay.maChuyenBayCode} · {ticket.chuyenBay.sanBayDi}→{ticket.chuyenBay.sanBayDen}</p>
            <p className="text-gray-500">{formatDateTime(ticket.chuyenBay.ngayGioBay)}</p>
          </div>

          {/* Status */}
          {checkInStatus && (
            <div className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
              checkInStatus === 'open' ? 'bg-green-50 text-green-800 border border-green-200' :
              checkInStatus === 'early' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
              'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>{statusMessage}</p>
            </div>
          )}

          {checkInStatus === 'open' && (
            <>
              <div>
                <label className="label">Số ghế (tùy chọn)</label>
                <input value={soGhe} onChange={(e) => setSoGhe(e.target.value)} className="input" placeholder="VD: 12A" />
              </div>
              <button onClick={() => checkInMutation.mutate()} disabled={checkInMutation.isPending} className="btn-primary w-full justify-center">
                {checkInMutation.isPending ? <Spinner size="sm" /> : 'Xác nhận check-in'}
              </button>
            </>
          )}

          {checkInStatus === 'invalid' && ticket.trangThaiVe === 'DANG_GIU_CHO' && (
            <button onClick={() => navigate(`/tickets/${maVe}`)} className="btn-primary w-full justify-center">
              Thanh toán vé ngay
            </button>
          )}
        </div>
      )}
    </div>
  )
}
