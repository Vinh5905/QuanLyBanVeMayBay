import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { flightsApi } from '../api/flights.api'
import { formatCurrency, formatDateTime, formatDuration, getFlightOperationalStatus } from '../utils/format'
import { ArrowLeft, Clock, MapPin, PlaneTakeoff, PlaneLanding, Armchair } from 'lucide-react'
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
  const status = getFlightOperationalStatus(flight.trangThaiChuyenBay, flight.ngayGioBay, flight.thoiGianBay)

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={16} /> Quay lại
      </button>

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Mã chuyến bay</p>
            <p className="font-mono font-bold text-blue-600 text-2xl">{flight.maChuyenBayCode}</p>
          </div>
          <Badge variant={status.variant} className="text-sm px-3 py-1">{status.label}</Badge>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          {/* Route */}
          <div className="rounded-lg border bg-gray-50 p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Sân bay đi</p>
                <p className="mt-2 text-4xl font-bold text-gray-900">{flight.sanBayDi.maSanBay}</p>
                <p className="mt-1 font-medium text-gray-700">{flight.sanBayDi.tenSanBay}</p>
                <p className="text-sm text-gray-500">{flight.sanBayDi.thanhPho}</p>
              </div>
              <div className="flex w-full flex-col items-center md:w-36">
                <PlaneTakeoff size={22} className="text-blue-500" />
                <div className="my-3 h-px w-full border-t border-dashed border-gray-300" />
                <p className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500 shadow-sm">
                  {formatDuration(flight.thoiGianBay)}
                </p>
                <div className="my-3 h-px w-full border-t border-dashed border-gray-300" />
                <PlaneLanding size={22} className="text-blue-500" />
              </div>
              <div className="md:text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Sân bay đến</p>
                <p className="mt-2 text-4xl font-bold text-gray-900">{flight.sanBayDen.maSanBay}</p>
                <p className="mt-1 font-medium text-gray-700">{flight.sanBayDen.tenSanBay}</p>
                <p className="text-sm text-gray-500">{flight.sanBayDen.thanhPho}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-3">
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock size={16} className="text-gray-400 shrink-0" />
                <p className="text-xs font-medium uppercase tracking-wide">Ngày giờ khởi hành</p>
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-900">{formatDateTime(flight.ngayGioBay)}</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Armchair size={16} className="text-gray-400 shrink-0" />
                <p className="text-xs font-medium uppercase tracking-wide">Ghế trống / Tổng ghế</p>
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-900">{totalLeft} / {totalSeats}</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin size={16} className="text-gray-400 shrink-0" />
                <p className="text-xs font-medium uppercase tracking-wide">Giá cơ sở</p>
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-900">{formatCurrency(flight.giaCoBan)}</p>
            </div>
          </div>
        </div>

        {/* Stopovers */}
        <div className="mt-5 border-t pt-5">
          <p className="text-sm font-semibold text-gray-800">Sân bay trung gian</p>
          {flight.danhSachTrungGian.length === 0 ? (
            <p className="mt-2 rounded-lg border bg-gray-50 px-4 py-3 text-sm text-gray-500">Bay thẳng, không có điểm dừng.</p>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {flight.danhSachTrungGian.map((tg, i) => (
                <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 border text-sm">
                  <p className="font-medium">{tg.maSanBay}</p>
                  <p className="text-xs text-gray-500">Dừng: {tg.thoiGianDung} phút</p>
                  {tg.ghiChu && <p className="text-xs text-gray-400">{tg.ghiChu}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
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
