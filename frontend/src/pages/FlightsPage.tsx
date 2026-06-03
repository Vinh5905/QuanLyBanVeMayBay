import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { flightsApi } from '../api/flights.api'
import { formatCurrency, formatDateTime, formatDuration, FLIGHT_STATUS_LABEL } from '../utils/format'
import { Plus, Search, ChevronDown, ChevronUp, X, AlertCircle } from 'lucide-react'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import { useQuery as useAirportsQuery } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Flight } from '../types'
import { useNavigate } from 'react-router-dom'
import { useConfig } from '../contexts/ConfigContext'
import { useAuth } from '../contexts/AuthContext'

const schema = z.object({
  maChuyenBayCode: z.string().min(1, 'Bắt buộc'),
  sanBayDi: z.string().min(1, 'Bắt buộc'),
  sanBayDen: z.string().min(1, 'Bắt buộc'),
  ngayGioBay: z.string().min(1, 'Bắt buộc'),
  thoiGianBay: z.coerce.number().min(1, 'Bắt buộc'),
  giaCoBan: z.coerce.number().min(1, 'Bắt buộc'),
  soGheHang1: z.coerce.number().min(0),
  donGiaHang1: z.coerce.number().min(0),
  soGheHang2: z.coerce.number().min(0),
  donGiaHang2: z.coerce.number().min(0),
  danhSachTrungGian: z.array(z.object({
    maSanBay: z.string().min(1, 'Bắt buộc'),
    thoiGianDung: z.coerce.number().min(45, 'Tối thiểu 45 phút').max(120, 'Tối đa 120 phút'),
    ghiChu: z.string().optional(),
  })).max(2, 'Tối đa 2 sân bay trung gian'),
})
type FormData = z.infer<typeof schema>

function FlightRow({ flight, onDetail }: { flight: Flight; onDetail: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const totalLeft = flight.danhSachHangVe.reduce((s, h) => s + h.soGheCon, 0)
  const totalSeats = flight.danhSachHangVe.reduce((s, h) => s + h.soLuong, 0)

  return (
    <>
      <tr className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <td className="table-td font-medium text-blue-600">{flight.maChuyenBayCode}</td>
        <td className="table-td">{flight.sanBayDi.maSanBay} — {flight.sanBayDi.thanhPho}</td>
        <td className="table-td">{flight.sanBayDen.maSanBay} — {flight.sanBayDen.thanhPho}</td>
        <td className="table-td">{formatDateTime(flight.ngayGioBay)}</td>
        <td className="table-td">{formatDuration(flight.thoiGianBay)}</td>
        <td className="table-td text-right">{formatCurrency(flight.giaCoBan)}</td>
        <td className="table-td">
          <Badge variant={totalLeft > 10 ? 'green' : totalLeft > 0 ? 'yellow' : 'red'}>
            {totalLeft}/{totalSeats}
          </Badge>
        </td>
        <td className="table-td">
          <Badge variant={flight.trangThaiChuyenBay === 'SCHEDULED' ? 'blue' : 'red'}>
            {FLIGHT_STATUS_LABEL[flight.trangThaiChuyenBay] || flight.trangThaiChuyenBay}
          </Badge>
        </td>
        <td className="table-td">
          <button className="text-gray-400 hover:text-gray-700">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-blue-50/40">
          <td colSpan={9} className="px-4 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {flight.danhSachHangVe.map((h) => (
                <div key={h.maHangVe} className="bg-white rounded-lg p-3 border">
                  <p className="font-semibold text-gray-700">{h.tenHangVe}</p>
                  <p className="text-gray-500 mt-1">Giá: <span className="text-gray-900 font-medium">{formatCurrency(h.donGia)}</span></p>
                  <p className="text-gray-500">Ghế: {h.soGheCon}/{h.soLuong} còn trống</p>
                </div>
              ))}
              {flight.danhSachTrungGian.length > 0 && (
                <div className="sm:col-span-3">
                  <p className="font-medium text-gray-700 mb-2">Sân bay trung gian:</p>
                  <div className="flex gap-3 flex-wrap">
                    {flight.danhSachTrungGian.map((tg, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 border text-xs">
                        <p className="font-medium">{tg.maSanBay}</p>
                        <p className="text-gray-500">Dừng: {tg.thoiGianDung} phút</p>
                        {tg.ghiChu && <p className="text-gray-400">{tg.ghiChu}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={(e) => { e.stopPropagation(); onDetail() }} className="mt-3 text-sm text-blue-600 hover:underline">
              Xem chi tiết →
            </button>
          </td>
        </tr>
      )}
    </>
  )
}

export default function FlightsPage() {
  const qc = useQueryClient()
  const { getNum } = useConfig()
  const toast = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isKhachHang = user?.vaiTro === 'KhachHang'
  const [page, setPage] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState({ sanBayDi: '', sanBayDen: '', ngayBay: '' })

  const activeFilter = Object.fromEntries(
    Object.entries(filter).filter(([, v]) => v !== '')
  )
  const { data, isLoading } = useQuery({
    queryKey: ['flights', page, filter],
    queryFn: () => flightsApi.list({ ...activeFilter, page, size: 20 }),
  })

  const { data: airports = [] } = useQuery({
    queryKey: ['airports'],
    queryFn: flightsApi.airports,
    staleTime: Infinity,
  })

  const maxTrungGian = getNum('SoSanBayTrungGianToiDa', 2)
  const minThoiGianBay = getNum('ThoiGianBayToiThieu', 30)

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { danhSachTrungGian: [] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'danhSachTrungGian' })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => flightsApi.create({
      maChuyenBayCode: data.maChuyenBayCode,
      sanBayDi: data.sanBayDi,
      sanBayDen: data.sanBayDen,
      ngayGioBay: data.ngayGioBay,
      thoiGianBay: data.thoiGianBay,
      giaCoBan: data.giaCoBan,
      danhSachHangVe: [
        { maHangVe: 1, soLuong: data.soGheHang1, donGia: data.donGiaHang1 },
        { maHangVe: 2, soLuong: data.soGheHang2, donGia: data.donGiaHang2 },
      ],
      danhSachTrungGian: data.danhSachTrungGian,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flights'] })
      toast.success('Tạo chuyến bay thành công')
      setShowCreate(false)
      reset()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý chuyến bay</h1>
        {!isKhachHang && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={16} /> Thêm chuyến bay
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select value={filter.sanBayDi} onChange={(e) => { setFilter({ ...filter, sanBayDi: e.target.value }); setPage(0) }} className="input text-sm">
            <option value="">Tất cả sân bay đi</option>
            {airports.map((a) => <option key={a.maSanBay} value={a.maSanBay}>{a.maSanBay} — {a.tenSanBay}</option>)}
          </select>
          <select value={filter.sanBayDen} onChange={(e) => { setFilter({ ...filter, sanBayDen: e.target.value }); setPage(0) }} className="input text-sm">
            <option value="">Tất cả sân bay đến</option>
            {airports.map((a) => <option key={a.maSanBay} value={a.maSanBay}>{a.maSanBay} — {a.tenSanBay}</option>)}
          </select>
          <input type="date" value={filter.ngayBay} onChange={(e) => { setFilter({ ...filter, ngayBay: e.target.value }); setPage(0) }} className="input text-sm" />
          <button onClick={() => { setFilter({ sanBayDi: '', sanBayDen: '', ngayBay: '' }); setPage(0) }} className="btn-secondary text-sm">
            <X size={14} /> Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th">Mã chuyến</th>
                    <th className="table-th">Sân bay đi</th>
                    <th className="table-th">Sân bay đến</th>
                    <th className="table-th">Ngày giờ bay</th>
                    <th className="table-th">Thời gian bay</th>
                    <th className="table-th text-right">Giá cơ sở</th>
                    <th className="table-th">Ghế trống</th>
                    <th className="table-th">Trạng thái</th>
                    <th className="table-th"></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((f) => (
                    <FlightRow key={f.maChuyenBay} flight={f} onDetail={() => navigate(`/flights/${f.maChuyenBay}`)} />
                  ))}
                </tbody>
              </table>
            </div>
            {data?.data.length === 0 && <EmptyState message="Không có chuyến bay nào" />}
            {data?.pagination && (
              <Pagination {...data.pagination} onChange={setPage} />
            )}
          </>
        )}
      </div>

      {/* Create modal */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); reset() }}
        title="Tạo chuyến bay mới"
        size="xl"
        footer={
          <>
            <button onClick={() => { setShowCreate(false); reset() }} className="btn-secondary">Hủy</button>
            <button onClick={handleSubmit((d) => createMutation.mutate(d))} disabled={isSubmitting || createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? <Spinner size="sm" /> : 'Tạo chuyến bay'}
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Mã chuyến bay</label>
              <input {...register('maChuyenBayCode')} className="input" placeholder="VN123" />
              {errors.maChuyenBayCode && <p className="text-xs text-red-600 mt-1">{errors.maChuyenBayCode.message}</p>}
            </div>
            <div>
              <label className="label">Giá cơ sở (VND)</label>
              <input {...register('giaCoBan')} type="number" className="input" placeholder="1000000" />
              {errors.giaCoBan && <p className="text-xs text-red-600 mt-1">{errors.giaCoBan.message}</p>}
            </div>
            <div>
              <label className="label">Sân bay đi</label>
              <select {...register('sanBayDi')} className="input">
                <option value="">Chọn sân bay</option>
                {airports.map((a) => <option key={a.maSanBay} value={a.maSanBay}>{a.maSanBay} — {a.tenSanBay}</option>)}
              </select>
              {errors.sanBayDi && <p className="text-xs text-red-600 mt-1">{errors.sanBayDi.message}</p>}
            </div>
            <div>
              <label className="label">Sân bay đến</label>
              <select {...register('sanBayDen')} className="input">
                <option value="">Chọn sân bay</option>
                {airports.map((a) => <option key={a.maSanBay} value={a.maSanBay}>{a.maSanBay} — {a.tenSanBay}</option>)}
              </select>
              {errors.sanBayDen && <p className="text-xs text-red-600 mt-1">{errors.sanBayDen.message}</p>}
            </div>
            <div>
              <label className="label">Ngày giờ khởi hành</label>
              <input {...register('ngayGioBay')} type="datetime-local" className="input" />
              {errors.ngayGioBay && <p className="text-xs text-red-600 mt-1">{errors.ngayGioBay.message}</p>}
            </div>
            <div>
              <label className="label">Thời gian bay (phút, tối thiểu {minThoiGianBay})</label>
              <input {...register('thoiGianBay')} type="number" className="input" placeholder={String(minThoiGianBay)} />
              {errors.thoiGianBay && <p className="text-xs text-red-600 mt-1">{errors.thoiGianBay.message}</p>}
            </div>
          </div>

          <div className="border rounded-lg p-3 space-y-3">
            <p className="text-sm font-medium text-gray-700">Hạng ghế</p>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="label text-xs">Phổ thông — Số ghế</label>
                <input {...register('soGheHang1')} type="number" className="input text-sm" defaultValue={150} />
              </div>
              <div className="col-span-2">
                <label className="label text-xs">Phổ thông — Giá (VND)</label>
                <input {...register('donGiaHang1')} type="number" className="input text-sm" placeholder="1000000" />
              </div>
              <div className="col-span-2">
                <label className="label text-xs">Thương gia — Số ghế</label>
                <input {...register('soGheHang2')} type="number" className="input text-sm" defaultValue={20} />
              </div>
              <div className="col-span-2">
                <label className="label text-xs">Thương gia — Giá (VND)</label>
                <input {...register('donGiaHang2')} type="number" className="input text-sm" placeholder="3000000" />
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Sân bay trung gian (tối đa {maxTrungGian})</p>
              <button
                type="button"
                onClick={() => append({ maSanBay: '', thoiGianDung: 60, ghiChu: '' })}
                disabled={fields.length >= maxTrungGian}
                className="btn-secondary text-xs py-1"
              >
                <Plus size={12} /> Thêm
              </button>
            </div>
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-5 gap-2 items-start">
                <div className="col-span-2">
                  <select {...register(`danhSachTrungGian.${idx}.maSanBay`)} className="input text-sm">
                    <option value="">Chọn sân bay</option>
                    {airports.map((a) => <option key={a.maSanBay} value={a.maSanBay}>{a.maSanBay}</option>)}
                  </select>
                  {errors.danhSachTrungGian?.[idx]?.maSanBay && <p className="text-xs text-red-600">{errors.danhSachTrungGian[idx]?.maSanBay?.message}</p>}
                </div>
                <div>
                  <input {...register(`danhSachTrungGian.${idx}.thoiGianDung`)} type="number" placeholder="Phút dừng" className="input text-sm" />
                  {errors.danhSachTrungGian?.[idx]?.thoiGianDung && <p className="text-xs text-red-600">{errors.danhSachTrungGian[idx]?.thoiGianDung?.message}</p>}
                </div>
                <input {...register(`danhSachTrungGian.${idx}.ghiChu`)} placeholder="Ghi chú" className="input text-sm" />
                <button type="button" onClick={() => remove(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                  <X size={14} />
                </button>
              </div>
            ))}
            {errors.danhSachTrungGian && typeof errors.danhSachTrungGian.message === 'string' && (
              <p className="text-xs text-red-600">{errors.danhSachTrungGian.message}</p>
            )}
          </div>
        </form>
      </Modal>
    </div>
  )
}
