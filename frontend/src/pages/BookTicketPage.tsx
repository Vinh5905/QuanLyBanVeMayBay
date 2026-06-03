import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { flightsApi } from '../api/flights.api'
import { bookingsApi } from '../api/bookings.api'
import { formatCurrency, formatDateTime, formatDuration } from '../utils/format'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'
import { Search, Clock, AlertCircle } from 'lucide-react'
import { useConfig } from '../contexts/ConfigContext'
import { useAuth } from '../contexts/AuthContext'
import { addMinutes, formatDistanceToNow, isAfter, addHours } from 'date-fns'
import type { Flight } from '../types'

export default function BookTicketPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { getNum } = useConfig()
  const { user } = useAuth()

  const [selectedFlight, setSelectedFlight] = useState<number | null>(null)
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [filter, setFilter] = useState({ sanBayDi: '', sanBayDen: '', ngayBay: '' })

  const { data: airports = [] } = useQuery({ queryKey: ['airports'], queryFn: flightsApi.airports, staleTime: Infinity })
  const tgDatVeChamNhat = getNum('TGDatVeChamNhat', 120)
  const thoiHanThanhToan = getNum('ThoiHanThanhToan', 2)

  const activeFilter = Object.fromEntries(Object.entries(filter).filter(([, v]) => v !== ''))
  const { data: flightsResult, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['flights-book', activeFilter],
    queryFn: () => flightsApi.list({ ...activeFilter, size: 50 }),
  })
  const flights: Flight[] = flightsResult?.data ?? []

  const selectedFlightData = flights.find((f) => f.maChuyenBay === selectedFlight)
  const selectedClassData = selectedFlightData?.danhSachHangVe.find((h) => h.maHangVe === selectedClass)

  const canBook = selectedFlightData
    ? isAfter(new Date(selectedFlightData.ngayGioBay), addMinutes(new Date(), tgDatVeChamNhat))
    : false

  const isCustomer = user?.vaiTro === 'KhachHang'

  const bookMutation = useMutation({
    mutationFn: () => bookingsApi.create({ maChuyenBay: selectedFlight!, maHangVe: selectedClass! }),
    onSuccess: (booking) => {
      toast.success('Đặt vé thành công!')
      navigate(`/tickets/${booking.ve.maVe}`)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const hanThanhToan = addHours(new Date(), thoiHanThanhToan)

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Đặt vé online</h1>

      {!isCustomer && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Chức năng dành cho khách hàng</p>
            <p className="mt-0.5">Tài khoản <strong>{user?.vaiTro}</strong> không thể đặt vé online. Để bán vé cho khách, vui lòng dùng{' '}
              <button onClick={() => navigate('/tickets/sell')} className="underline font-medium">Bán vé tại quầy</button>.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Flight filter */}
          <div className="card p-4">
            <h2 className="font-semibold text-sm text-gray-700 mb-4">Tìm chuyến bay</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <select value={filter.sanBayDi} onChange={(e) => setFilter({ ...filter, sanBayDi: e.target.value })} className="input text-sm">
                <option value="">Sân bay đi</option>
                {airports.map((a) => <option key={a.maSanBay} value={a.maSanBay}>{a.maSanBay} — {a.thanhPho}</option>)}
              </select>
              <select value={filter.sanBayDen} onChange={(e) => setFilter({ ...filter, sanBayDen: e.target.value })} className="input text-sm">
                <option value="">Sân bay đến</option>
                {airports.map((a) => <option key={a.maSanBay} value={a.maSanBay}>{a.maSanBay} — {a.thanhPho}</option>)}
              </select>
              <input type="date" value={filter.ngayBay} onChange={(e) => setFilter({ ...filter, ngayBay: e.target.value })} className="input text-sm" />
              <button onClick={() => refetch()} disabled={isFetching} className="btn-secondary text-sm justify-center">
                {isFetching ? <Spinner size="sm" /> : <><Search size={14} /> Lọc</>}
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8"><Spinner size="lg" /></div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {flights.map((f) => {
                  const dep = new Date(f.ngayGioBay)
                  const bookable = isAfter(dep, addMinutes(new Date(), tgDatVeChamNhat))
                  return (
                    <div
                      key={f.maChuyenBay}
                      onClick={() => { if (bookable) { setSelectedFlight(f.maChuyenBay); setSelectedClass(null) } }}
                      className={`p-3 border rounded-lg text-sm transition-colors ${!bookable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${selectedFlight === f.maChuyenBay ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-blue-700">{f.maChuyenBayCode}</span>
                        <div className="flex items-center gap-2">
                          {!bookable && <span className="text-xs text-red-500">Quá hạn đặt online</span>}
                          <span className="text-xs text-gray-500">{formatDateTime(f.ngayGioBay)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{f.sanBayDi.thanhPho} → {f.sanBayDen.thanhPho} · {formatDuration(f.thoiGianBay)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Từ {formatCurrency(f.giaCoBan)}</p>
                    </div>
                  )
                })}
                {flights.length === 0 && <p className="text-center text-gray-400 text-sm py-4">Không có chuyến bay nào</p>}
              </div>
            )}
          </div>

          {/* Class selection */}
          {selectedFlightData && (
            <div className="card p-4">
              <h2 className="font-semibold text-sm text-gray-700 mb-4">Chọn hạng vé</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedFlightData.danhSachHangVe.map((h) => (
                  <div
                    key={h.maHangVe}
                    onClick={() => h.soGheCon > 0 && setSelectedClass(h.maHangVe)}
                    className={`p-4 border rounded-lg text-sm ${h.soGheCon === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${selectedClass === h.maHangVe ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <p className="font-semibold">{h.tenHangVe}</p>
                    <p className="text-blue-600 font-bold text-base mt-1">{formatCurrency(h.donGia)}</p>
                    <Badge variant={h.soGheCon > 0 ? 'green' : 'red'} className="mt-2">
                      {h.soGheCon > 0 ? `${h.soGheCon} ghế còn` : 'Hết chỗ'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-4 sticky top-4 space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Tóm tắt đặt chỗ</h3>
            {selectedFlightData ? (
              <>
                <div className="text-sm space-y-2">
                  <div><p className="text-xs text-gray-400">Chuyến bay</p><p className="font-medium">{selectedFlightData.maChuyenBayCode}</p></div>
                  <div><p className="text-xs text-gray-400">Tuyến</p><p className="text-xs">{selectedFlightData.sanBayDi.maSanBay} → {selectedFlightData.sanBayDen.maSanBay}</p></div>
                  <div><p className="text-xs text-gray-400">Ngày bay</p><p className="text-xs">{formatDateTime(selectedFlightData.ngayGioBay)}</p></div>
                  {selectedClassData && (
                    <>
                      <div><p className="text-xs text-gray-400">Hạng vé</p><p className="font-medium">{selectedClassData.tenHangVe}</p></div>
                      <div className="border-t pt-2"><div className="flex justify-between font-bold"><span>Giá vé</span><span className="text-blue-600">{formatCurrency(selectedClassData.donGia)}</span></div></div>
                    </>
                  )}
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex gap-2">
                  <Clock size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Hạn thanh toán</p>
                    <p>Sau khi đặt, bạn có <strong>{thoiHanThanhToan} giờ</strong> để thanh toán{hanThanhToan ? ` (đến ${formatDistanceToNow(hanThanhToan, { addSuffix: true })})` : ''}.</p>
                  </div>
                </div>
                <button
                  onClick={() => bookMutation.mutate()}
                  disabled={!selectedFlight || !selectedClass || !canBook || !isCustomer || bookMutation.isPending}
                  className="btn-primary w-full justify-center"
                  title={!isCustomer ? 'Chỉ khách hàng mới có thể đặt vé online' : undefined}
                >
                  {bookMutation.isPending ? <Spinner size="sm" /> : 'Đặt chỗ ngay'}
                </button>
                {!canBook && selectedFlightData && (
                  <p className="text-xs text-red-600 text-center">Chuyến bay quá gần, không thể đặt online</p>
                )}
                {!isCustomer && (
                  <p className="text-xs text-amber-600 text-center">Dùng <button onClick={() => navigate('/tickets/sell')} className="underline">Bán vé</button> để bán cho khách</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Chọn chuyến bay để tiếp tục</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
