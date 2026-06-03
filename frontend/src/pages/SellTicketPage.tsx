import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { flightsApi } from '../api/flights.api'
import { ticketsApi } from '../api/tickets.api'
import { accountsApi } from '../api/accounts.api'
import { formatCurrency, formatDateTime, formatDuration } from '../utils/format'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'
import { Search } from 'lucide-react'
import type { Flight } from '../types'

export default function SellTicketPage() {
  const navigate = useNavigate()
  const toast = useToast()

  const [selectedFlight, setSelectedFlight] = useState<number | null>(null)
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [flightFilter, setFlightFilter] = useState({ sanBayDi: '', sanBayDen: '', ngayBay: '' })

  const { data: airports = [] } = useQuery({ queryKey: ['airports'], queryFn: flightsApi.airports, staleTime: Infinity })

  const activeFilter = Object.fromEntries(Object.entries(flightFilter).filter(([, v]) => v !== ''))
  const { data: flightsResult, isLoading: loadFlights, refetch: refetchFlights } = useQuery({
    queryKey: ['flights-sell', activeFilter],
    queryFn: () => flightsApi.list({ ...activeFilter, size: 50 }),
  })
  const flights: Flight[] = flightsResult?.data ?? []

  const { data: customers } = useQuery({
    queryKey: ['accounts-customers', customerSearch],
    queryFn: () => accountsApi.list({ vaiTro: 'KhachHang', keyword: customerSearch, size: 20 }),
    enabled: customerSearch.length >= 2,
  })

  const selectedFlightData = flights.find((f) => f.maChuyenBay === selectedFlight)
  const selectedClassData = selectedFlightData?.danhSachHangVe.find((h) => h.maHangVe === selectedClass)
  const selectedCustomerData = customers?.data.find((c) => c.maTaiKhoan === selectedCustomer || c.maKhachHang === selectedCustomer)

  const sellMutation = useMutation({
    mutationFn: () => ticketsApi.sell({ maChuyenBay: selectedFlight!, maKhachHang: selectedCustomer!, maHangVe: selectedClass! }),
    onSuccess: (ticket) => {
      toast.success(`Bán vé thành công — mã vé: ${ticket.maVeCode}`)
      navigate(`/tickets/${ticket.maVe}`)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Bán vé tại quầy</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Step 1: Flight */}
          <div className="card p-4">
            <h2 className="font-semibold text-sm text-gray-700 mb-4">1. Chọn chuyến bay</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <select value={flightFilter.sanBayDi} onChange={(e) => setFlightFilter({ ...flightFilter, sanBayDi: e.target.value })} className="input text-sm">
                <option value="">Sân bay đi</option>
                {airports.map((a) => <option key={a.maSanBay} value={a.maSanBay}>{a.maSanBay} — {a.thanhPho}</option>)}
              </select>
              <select value={flightFilter.sanBayDen} onChange={(e) => setFlightFilter({ ...flightFilter, sanBayDen: e.target.value })} className="input text-sm">
                <option value="">Sân bay đến</option>
                {airports.map((a) => <option key={a.maSanBay} value={a.maSanBay}>{a.maSanBay} — {a.thanhPho}</option>)}
              </select>
              <input type="date" value={flightFilter.ngayBay} onChange={(e) => setFlightFilter({ ...flightFilter, ngayBay: e.target.value })} className="input text-sm" />
              <button onClick={() => refetchFlights()} disabled={loadFlights} className="btn-secondary text-sm justify-center">
                {loadFlights ? <Spinner size="sm" /> : <><Search size={14} /> Lọc</>}
              </button>
            </div>
            {loadFlights ? (
              <div className="flex justify-center py-6"><Spinner size="lg" /></div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {flights.map((f) => (
                  <div
                    key={f.maChuyenBay}
                    onClick={() => { setSelectedFlight(f.maChuyenBay); setSelectedClass(null) }}
                    className={`p-3 border rounded-lg cursor-pointer text-sm transition-colors ${selectedFlight === f.maChuyenBay ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-blue-700">{f.maChuyenBayCode}</span>
                      <span className="text-xs text-gray-500">{formatDateTime(f.ngayGioBay)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{f.sanBayDi.thanhPho} → {f.sanBayDen.thanhPho} · {formatDuration(f.thoiGianBay)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Từ {formatCurrency(f.giaCoBan)}</p>
                  </div>
                ))}
                {flights.length === 0 && <p className="text-center text-gray-400 text-sm py-4">Không có chuyến bay nào</p>}
              </div>
            )}
          </div>

          {/* Step 2: Class */}
          {selectedFlightData && (
            <div className="card p-4">
              <h2 className="font-semibold text-sm text-gray-700 mb-4">2. Chọn hạng vé</h2>
              <div className="grid grid-cols-2 gap-3">
                {selectedFlightData.danhSachHangVe.map((h) => (
                  <div
                    key={h.maHangVe}
                    onClick={() => h.soGheCon > 0 && setSelectedClass(h.maHangVe)}
                    className={`p-4 border rounded-lg text-sm ${h.soGheCon === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${selectedClass === h.maHangVe ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <p className="font-semibold">{h.tenHangVe}</p>
                    <p className="text-blue-600 font-bold text-base mt-1">{formatCurrency(h.donGia)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={h.soGheCon > 10 ? 'green' : h.soGheCon > 0 ? 'yellow' : 'red'}>
                        {h.soGheCon > 0 ? `${h.soGheCon} ghế còn` : 'Hết chỗ'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Customer */}
          {selectedClass && (
            <div className="card p-4">
              <h2 className="font-semibold text-sm text-gray-700 mb-4">3. Chọn khách hàng</h2>
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="input pl-8 text-sm"
                  placeholder="Tìm theo tên, email (tối thiểu 2 ký tự)..."
                />
              </div>
              {customers?.data && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customers.data.map((c) => (
                    <div
                      key={c.maTaiKhoan}
                      onClick={() => setSelectedCustomer(c.maKhachHang ?? c.maTaiKhoan)}
                      className={`p-3 border rounded-lg cursor-pointer text-sm ${selectedCustomer === (c.maKhachHang ?? c.maTaiKhoan) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <p className="font-medium">{c.tenDangNhap}</p>
                      <p className="text-xs text-gray-500">{c.email}</p>
                    </div>
                  ))}
                  {customers.data.length === 0 && <p className="text-gray-400 text-sm text-center py-2">Không tìm thấy khách hàng</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <div className="card p-4 sticky top-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-4">Tóm tắt đặt vé</h3>
            {selectedFlightData ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Chuyến bay</p>
                  <p className="font-medium">{selectedFlightData.maChuyenBayCode}</p>
                  <p className="text-xs text-gray-500">{selectedFlightData.sanBayDi.thanhPho} → {selectedFlightData.sanBayDen.thanhPho}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(selectedFlightData.ngayGioBay)}</p>
                </div>
                {selectedClassData && (
                  <div>
                    <p className="text-xs text-gray-400">Hạng vé</p>
                    <p className="font-medium">{selectedClassData.tenHangVe}</p>
                  </div>
                )}
                {selectedCustomerData && (
                  <div>
                    <p className="text-xs text-gray-400">Khách hàng</p>
                    <p className="font-medium">{selectedCustomerData.tenDangNhap}</p>
                    <p className="text-xs text-gray-500">{selectedCustomerData.email}</p>
                  </div>
                )}
                {selectedClassData && (
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold">
                      <span>Tổng tiền</span>
                      <span className="text-blue-600">{formatCurrency(selectedClassData.donGia)}</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => sellMutation.mutate()}
                  disabled={!selectedFlight || !selectedClass || !selectedCustomer || sellMutation.isPending}
                  className="btn-primary w-full justify-center mt-3"
                >
                  {sellMutation.isPending ? <Spinner size="sm" /> : 'Bán vé'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Chọn chuyến bay để xem thông tin</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
