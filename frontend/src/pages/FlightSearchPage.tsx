import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { flightsApi } from '../api/flights.api'
import { formatCurrency, formatDateTime, formatDuration } from '../utils/format'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import { useNavigate } from 'react-router-dom'
import type { Flight } from '../types'

function FlightCard({ flight, onSelect }: { flight: Flight; onSelect?: (f: Flight) => void }) {
  const [expanded, setExpanded] = useState(false)
  const totalLeft = flight.danhSachHangVe.reduce((s, h) => s + h.soGheCon, 0)
  const minPrice = Math.min(...flight.danhSachHangVe.map((h) => h.donGia))

  return (
    <div className="card overflow-hidden">
      <div
        className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-bold text-blue-600 text-lg">{flight.maChuyenBayCode}</span>
            <Badge variant={totalLeft > 10 ? 'green' : totalLeft > 0 ? 'yellow' : 'red'}>
              {totalLeft > 0 ? `${totalLeft} ghế còn` : 'Hết chỗ'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-700">
            <span className="font-semibold">{flight.sanBayDi.maSanBay}</span>
            <span className="text-gray-400">—</span>
            <span className="font-semibold">{flight.sanBayDen.maSanBay}</span>
            <span className="text-gray-400 text-xs">({formatDuration(flight.thoiGianBay)})</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(flight.ngayGioBay)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Từ</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(minPrice)}</p>
        </div>
        <button className="text-gray-400 shrink-0">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t bg-gray-50 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {flight.danhSachHangVe.map((h) => (
              <div key={h.maHangVe} className={`bg-white rounded-lg p-3 border text-sm ${h.soGheCon === 0 ? 'opacity-50' : ''}`}>
                <p className="font-semibold text-gray-800">{h.tenHangVe}</p>
                <p className="text-blue-600 font-bold mt-1">{formatCurrency(h.donGia)}</p>
                <p className="text-gray-500 text-xs mt-1">{h.soGheCon} ghế trống / {h.soLuong} tổng</p>
                {onSelect && h.soGheCon > 0 && (
                  <button
                    onClick={() => onSelect(flight)}
                    className="mt-2 w-full btn-primary text-xs py-1 justify-center"
                  >
                    Chọn
                  </button>
                )}
              </div>
            ))}
          </div>
          {flight.danhSachTrungGian.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Điểm dừng trung gian:</p>
              <div className="flex gap-2">
                {flight.danhSachTrungGian.map((tg, i) => (
                  <div key={i} className="text-xs bg-white border rounded px-2 py-1">
                    <span className="font-medium">{tg.maSanBay}</span>
                    <span className="text-gray-400 ml-1">({tg.thoiGianDung} phút)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function FlightSearchPage() {
  const [params, setParams] = useState({ sanBayDi: '', sanBayDen: '', ngayBay: '' })
  const [searched, setSearched] = useState(false)

  const { data: airports = [] } = useQuery({
    queryKey: ['airports'],
    queryFn: flightsApi.airports,
    staleTime: Infinity,
  })

  const { data: flights = [], isLoading, refetch } = useQuery({
    queryKey: ['flights-search', params],
    queryFn: () => flightsApi.search({ sanBayDi: params.sanBayDi || undefined, sanBayDen: params.sanBayDen || undefined, ngayBay: params.ngayBay || undefined }),
    enabled: false,
  })

  const handleSearch = async () => {
    setSearched(true)
    refetch()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Tra cứu chuyến bay</h1>

      <div className="card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="label text-xs">Sân bay đi</label>
            <select value={params.sanBayDi} onChange={(e) => setParams({ ...params, sanBayDi: e.target.value })} className="input text-sm">
              <option value="">Tất cả</option>
              {airports.map((a) => <option key={a.maSanBay} value={a.maSanBay}>{a.maSanBay} — {a.tenSanBay}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Sân bay đến</label>
            <select value={params.sanBayDen} onChange={(e) => setParams({ ...params, sanBayDen: e.target.value })} className="input text-sm">
              <option value="">Tất cả</option>
              {airports.map((a) => <option key={a.maSanBay} value={a.maSanBay}>{a.maSanBay} — {a.tenSanBay}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Ngày bay</label>
            <input type="date" value={params.ngayBay} onChange={(e) => setParams({ ...params, ngayBay: e.target.value })} className="input text-sm" />
          </div>
          <div className="flex items-end">
            <button onClick={handleSearch} className="btn-primary w-full justify-center">
              <Search size={16} /> Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {searched && !isLoading && (
        <div className="space-y-3">
          {flights.length === 0 ? (
            <EmptyState
              message="Không tìm thấy chuyến bay phù hợp"
              action={<p className="text-sm text-gray-400">Thử đổi ngày hoặc sân bay khác</p>}
            />
          ) : (
            flights.map((f) => <FlightCard key={f.maChuyenBay} flight={f} />)
          )}
        </div>
      )}
    </div>
  )
}
