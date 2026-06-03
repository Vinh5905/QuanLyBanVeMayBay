import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { flightsApi } from '../api/flights.api'
import { formatCurrency, formatDateTime, formatDuration, FLIGHT_STATUS_LABEL } from '../utils/format'
import { ArrowLeft, Plane, Clock, MapPin } from 'lucide-react'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import { useAuth } from '../contexts/AuthContext'

export default function FlightDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: flight, isLoading } = useQuery({
    queryKey: ['flight', id],
    queryFn: () => flightsApi.get(Number(id)),
    enabled: !!id,
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!flight) return <div className="text-center py-20 text-gray-500">Không tìm thấy chuyến bay</div>

  const totalLeft = flight.danhSachHangVe.reduce((s, h) => s + h.soGheCon, 0)
  const totalSeats = flight.danhSachHangVe.reduce((s, h) => s + h.soLuong, 0)
  const isKhachHang = user?.vaiTro === 'KhachHang'

  return (
    <div className="space-y-5 max-w-3xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={16} /> Quay lại
      </button>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Mã chuyến bay</p>
            <p className="font-mono font-bold text-blue-600 text-2xl">{flight.maChuyenBayCode}</p>
          </div>
          <Badge variant={flight.trangThaiChuyenBay === 'SCHEDULED' ? 'blue' : 'red'}>
            {FLIGHT_STATUS_LABEL[flight.trangThaiChuyenBay] || flight.trangThaiChuyenBay}
          </Badge>
        </div>

        {/* Route */}
        <div className="flex items-center gap-4 py-4 border-y">
          <div className="text-center flex-1">
            <p className="text-3xl font-bold text-gray-900">{flight.sanBayDi.maSanBay}</p>
            <p className="text-sm text-gray-600 mt-1">{flight.sanBayDi.tenSanBay}</p>
            <p className="text-xs text-gray-400">{flight.sanBayDi.thanhPho}</p>
          </div>
          <div className="text-center shrink-0">
            <Plane size={24} className="text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">{formatDuration(flight.thoiGianBay)}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-3xl font-bold text-gray-900">{flight.sanBayDen.maSanBay}</p>
            <p className="text-sm text-gray-600 mt-1">{flight.sanBayDen.tenSanBay}</p>
            <p className="text-xs text-gray-400">{flight.sanBayDen.thanhPho}</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Ngày giờ khởi hành</p>
              <p className="font-medium">{formatDateTime(flight.ngayGioBay)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Plane size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Ghế trống / Tổng</p>
              <p className="font-medium">{totalLeft} / {totalSeats}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Giá cơ sở</p>
              <p className="font-medium">{formatCurrency(flight.giaCoBan)}</p>
            </div>
          </div>
        </div>

        {/* Stopovers */}
        {flight.danhSachTrungGian.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Sân bay trung gian</p>
            <div className="flex gap-3 flex-wrap">
              {flight.danhSachTrungGian.map((tg, i) => (
                <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 border text-sm">
                  <p className="font-medium">{tg.maSanBay}</p>
                  <p className="text-xs text-gray-500">Dừng: {tg.thoiGianDung} phút</p>
                  {tg.ghiChu && <p className="text-xs text-gray-400">{tg.ghiChu}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seat classes */}
      <div className="card p-5">
        <p className="font-semibold text-gray-800 mb-4">Hạng ghế</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {flight.danhSachHangVe.map((h) => (
            <div key={h.maHangVe} className="border rounded-xl p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-800">{h.tenHangVe}</p>
                <Badge variant={h.soGheCon > 10 ? 'green' : h.soGheCon > 0 ? 'yellow' : 'red'}>
                  {h.soGheCon} ghế còn
                </Badge>
              </div>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(h.donGia)}</p>
              <p className="text-xs text-gray-400 mt-1">{h.soGheDaDat}/{h.soLuong} ghế đã đặt</p>
              {isKhachHang && h.soGheCon > 0 && (
                <button
                  onClick={() => navigate(`/tickets/book?flightId=${flight.maChuyenBay}&hangVe=${h.maHangVe}`)}
                  className="mt-3 w-full btn-primary text-sm justify-center"
                >
                  Đặt vé ngay
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
