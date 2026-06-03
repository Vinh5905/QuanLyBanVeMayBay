import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { flightsApi } from '../api/flights.api'
import { formatCurrency, formatDateTime, formatDuration, getFlightOperationalStatus } from '../utils/format'
import { Plus, ChevronDown, ChevronUp, X, AlertCircle, PlaneTakeoff, PlaneLanding, Armchair, Route, Clock3 } from 'lucide-react'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
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
  danhSachHangVe: z.array(z.object({
    maHangVe: z.coerce.number().min(1),
    tenHangVe: z.string().min(1),
    heSoGia: z.coerce.number().optional(),
    soLuong: z.coerce.number().min(1, 'Số ghế phải lớn hơn 0'),
    donGia: z.coerce.number().min(1, 'Giá phải lớn hơn 0'),
  })).min(1, 'Phải có ít nhất 1 hạng ghế'),
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
  const status = getFlightOperationalStatus(flight.trangThaiChuyenBay, flight.ngayGioBay, flight.thoiGianBay)

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
          <Badge variant={status.variant}>{status.label}</Badge>
        </td>
        <td className="table-td">
          <button className="text-gray-400 hover:text-gray-700">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={9} className="p-0">
            <div className="border-t px-5 py-5">
              <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Lộ trình</p>
                      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{flight.sanBayDi.maSanBay}</p>
                          <p className="mt-1 text-sm text-gray-600">{flight.sanBayDi.tenSanBay}</p>
                          <p className="text-xs text-gray-400">{flight.sanBayDi.thanhPho}</p>
                        </div>
                        <div className="flex w-full flex-col items-center text-gray-400 md:min-w-28">
                          <PlaneTakeoff size={18} className="text-blue-500" />
                          <div className="my-2 h-px w-full border-t border-dashed" />
                          <PlaneLanding size={18} className="text-blue-500" />
                        </div>
                        <div className="md:text-right">
                          <p className="text-2xl font-bold text-gray-900">{flight.sanBayDen.maSanBay}</p>
                          <p className="mt-1 text-sm text-gray-600">{flight.sanBayDen.tenSanBay}</p>
                          <p className="text-xs text-gray-400">{flight.sanBayDen.thanhPho}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDetail() }}
                      className="btn-secondary shrink-0 text-sm"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border bg-gray-50 px-3 py-2">
                      <p className="flex items-center gap-1 text-xs text-gray-400"><Clock3 size={13} /> Khởi hành</p>
                      <p className="mt-1 font-medium text-gray-900">{formatDateTime(flight.ngayGioBay)}</p>
                    </div>
                    <div className="rounded-lg border bg-gray-50 px-3 py-2">
                      <p className="flex items-center gap-1 text-xs text-gray-400"><Route size={13} /> Thời gian bay</p>
                      <p className="mt-1 font-medium text-gray-900">{formatDuration(flight.thoiGianBay)}</p>
                    </div>
                    <div className="rounded-lg border bg-gray-50 px-3 py-2">
                      <p className="flex items-center gap-1 text-xs text-gray-400"><Armchair size={13} /> Ghế còn</p>
                      <p className="mt-1 font-medium text-gray-900">{totalLeft}/{totalSeats}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {flight.danhSachHangVe.map((h) => (
                      <div key={h.maHangVe} className="rounded-lg border bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{h.tenHangVe}</p>
                            <p className="mt-1 text-xs text-gray-500">{h.soGheDaDat}/{h.soLuong} ghế đã đặt</p>
                          </div>
                          <Badge variant={h.soGheCon > 10 ? 'green' : h.soGheCon > 0 ? 'yellow' : 'red'}>
                            {h.soGheCon} còn
                          </Badge>
                        </div>
                        <p className="mt-3 text-lg font-bold text-blue-600">{formatCurrency(h.donGia)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Sân bay trung gian</p>
                    {flight.danhSachTrungGian.length === 0 ? (
                      <p className="mt-2 text-sm text-gray-500">Bay thẳng, không có điểm dừng.</p>
                    ) : (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {flight.danhSachTrungGian.map((tg, i) => (
                          <div key={i} className="rounded-lg border bg-gray-50 px-3 py-2 text-sm">
                            <p className="font-semibold text-gray-900">{tg.maSanBay}</p>
                            <p className="text-xs text-gray-500">Dừng {tg.thoiGianDung} phút</p>
                            {tg.ghiChu && <p className="mt-1 text-xs text-gray-400">{tg.ghiChu}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
  const canManageFlights = user?.vaiTro === 'Admin' || user?.vaiTro === 'NhanVien'
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

  const { data: ticketClasses = [], isLoading: isTicketClassesLoading } = useQuery({
    queryKey: ['ticket-classes'],
    queryFn: flightsApi.ticketClasses,
    staleTime: Infinity,
  })

  const maxTrungGian = getNum('SoSanBayTrungGianToiDa', 2)
  const minThoiGianBay = getNum('ThoiGianBayToiThieu', 30)

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { danhSachHangVe: [], danhSachTrungGian: [] },
  })
  const { fields: seatClassFields } = useFieldArray({ control, name: 'danhSachHangVe' })
  const { fields: stopoverFields, append, remove } = useFieldArray({ control, name: 'danhSachTrungGian' })

  const buildSeatClassDefaults = () => ticketClasses.map((h) => {
    const normalized = h.tenHangVe.toLowerCase()
    const defaultSeats = normalized.includes('nhất') ? 10 : normalized.includes('thương') ? 30 : 120
    const defaultPrice = Math.max(1, Math.round(1000000 * Number(h.heSoGia || 1)))

    return {
      maHangVe: h.maHangVe,
      tenHangVe: h.tenHangVe,
      heSoGia: Number(h.heSoGia),
      soLuong: defaultSeats,
      donGia: defaultPrice,
    }
  })

  const openCreateModal = () => {
    reset({ danhSachHangVe: buildSeatClassDefaults(), danhSachTrungGian: [] })
    setShowCreate(true)
  }

  const closeCreateModal = () => {
    setShowCreate(false)
    reset({ danhSachHangVe: [], danhSachTrungGian: [] })
  }

  const createMutation = useMutation({
    mutationFn: (data: FormData) => flightsApi.create({
      maChuyenBayCode: data.maChuyenBayCode,
      sanBayDi: data.sanBayDi,
      sanBayDen: data.sanBayDen,
      ngayGioBay: data.ngayGioBay,
      thoiGianBay: data.thoiGianBay,
      giaCoBan: data.giaCoBan,
      danhSachHangVe: data.danhSachHangVe.map((h) => ({
        maHangVe: h.maHangVe,
        soLuong: h.soLuong,
        donGia: h.donGia,
      })),
      danhSachTrungGian: data.danhSachTrungGian.map((tg, idx) => ({
        ...tg,
        thuTu: idx + 1,
      })),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flights'] })
      toast.success('Tạo chuyến bay thành công')
      closeCreateModal()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý chuyến bay</h1>
        {canManageFlights && (
          <button
            onClick={openCreateModal}
            disabled={isTicketClassesLoading || ticketClasses.length === 0}
            className="btn-primary disabled:opacity-60"
          >
            {isTicketClassesLoading ? <Spinner size="sm" /> : <Plus size={16} />} Thêm chuyến bay
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
        onClose={closeCreateModal}
        title="Tạo chuyến bay mới"
        size="xl"
        footer={
          <>
            <button onClick={closeCreateModal} className="btn-secondary">Hủy</button>
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
            <div className="grid gap-3 md:grid-cols-3">
              {seatClassFields.map((field, idx) => (
                <div key={field.id} className="rounded-lg border bg-gray-50 p-3">
                  <input type="hidden" {...register(`danhSachHangVe.${idx}.maHangVe`)} />
                  <input type="hidden" {...register(`danhSachHangVe.${idx}.tenHangVe`)} />
                  <input type="hidden" {...register(`danhSachHangVe.${idx}.heSoGia`)} />
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{field.tenHangVe}</p>
                      <p className="mt-0.5 text-xs text-gray-500">Hệ số giá {Number(field.heSoGia || 1).toFixed(2)}</p>
                    </div>
                    <Badge variant={field.tenHangVe.toLowerCase().includes('nhất') ? 'yellow' : field.tenHangVe.toLowerCase().includes('thương') ? 'blue' : 'gray'}>
                      {field.tenHangVe.toLowerCase().includes('nhất') ? 'Cao nhất' : field.tenHangVe.toLowerCase().includes('thương') ? 'Cao cấp' : 'Tiêu chuẩn'}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className="label text-xs">Số ghế</label>
                      <input {...register(`danhSachHangVe.${idx}.soLuong`)} type="number" className="input text-sm" />
                      {errors.danhSachHangVe?.[idx]?.soLuong && (
                        <p className="text-xs text-red-600 mt-1">{errors.danhSachHangVe[idx]?.soLuong?.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="label text-xs">Đơn giá (VND)</label>
                      <input {...register(`danhSachHangVe.${idx}.donGia`)} type="number" className="input text-sm" />
                      {errors.danhSachHangVe?.[idx]?.donGia && (
                        <p className="text-xs text-red-600 mt-1">{errors.danhSachHangVe[idx]?.donGia?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.danhSachHangVe && typeof errors.danhSachHangVe.message === 'string' && (
              <p className="text-xs text-red-600">{errors.danhSachHangVe.message}</p>
            )}
          </div>

          <div className="border rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Sân bay trung gian (tối đa {maxTrungGian})</p>
              <button
                type="button"
                onClick={() => append({ maSanBay: '', thoiGianDung: 60, ghiChu: '' })}
                disabled={stopoverFields.length >= maxTrungGian}
                className="btn-secondary text-xs py-1"
              >
                <Plus size={12} /> Thêm
              </button>
            </div>
            {stopoverFields.map((field, idx) => (
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
