import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingApi } from '../../../api/bookingApi'
import { flightApi } from '../../../api/flightApi'
import { getErrorMessage } from '../../../api/adapter'
import { Button } from '../../../components/Button/Button'
import { Input, Select, FormField } from '../../../components/FormField/FormField'
import { DataTable } from '../../../components/DataTable/DataTable'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { Badge } from '../../../components/Badge/Badge'
import { toast } from '../../../components/Toast/Toast'
import type { FlightResponse } from '../../../types/flight'
import type { BookingResponse } from '../../../types/ticket'

export function BookingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'search' | 'bookings'>('search')
  const [flights, setFlights] = useState<FlightResponse[]>([])
  const [flightLoading, setFlightLoading] = useState(false)
  const [flightError, setFlightError] = useState<string | null>(null)
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null)
  const [selectedHangVe, setSelectedHangVe] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchParams, setSearchParams] = useState({ sanBayDi: '', sanBayDen: '', ngayBay: '' })
  const [validationError, setValidationError] = useState<string | null>(null)

  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState<string | null>(null)

  const searchFlights = useCallback(async () => {
    setFlightLoading(true)
    setFlightError(null)
    setValidationError(null)
    try {
      const res = await flightApi.searchFlights(searchParams)
      setFlights(res.data || [])
    } catch (err) {
      setFlightError(getErrorMessage(err))
    } finally {
      setFlightLoading(false)
    }
  }, [searchParams])

  useEffect(() => { if (step === 'search') searchFlights() }, [step, searchFlights])

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true)
    setBookingsError(null)
    try {
      const res = await bookingApi.getMyBookings()
      setBookings(res.data || [])
    } catch (err) {
      setBookingsError(getErrorMessage(err))
    } finally {
      setBookingsLoading(false)
    }
  }, [])

  useEffect(() => { if (step === 'bookings') loadBookings() }, [step, loadBookings])

  const handleBooking = async () => {
    if (!selectedFlightId || !selectedHangVe) {
      setValidationError('Vui lòng chọn chuyến bay và hạng vé')
      return
    }
    setValidationError(null)
    setSubmitting(true)
    try {
      await bookingApi.createBooking({ maChuyenBay: selectedFlightId, maHangVe: selectedHangVe })
      toast.success('Đặt chỗ thành công! Vui lòng thanh toán trong thời hạn.')
      setSelectedFlightId(null)
      setSelectedHangVe(null)
      setStep('bookings')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Đặt chỗ thất bại'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm('Hủy đặt chỗ này?')) return
    try {
      await bookingApi.cancelBooking(id)
      loadBookings()
      toast.success('Hủy đặt chỗ thành công')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="booking-page">
      <div className="page-header">
        <h1>Đặt vé online</h1>
        <div className="tab-bar">
          <Button variant={step === 'search' ? 'primary' : 'ghost'} onClick={() => setStep('search')}>Tìm chuyến bay</Button>
          <Button variant={step === 'bookings' ? 'primary' : 'ghost'} onClick={() => setStep('bookings')}>Đặt chỗ của tôi</Button>
        </div>
      </div>

      {step === 'search' && (
        <>
          <div className="filter-row">
            <FormField label="Sân bay đi">
              <Input placeholder="Mã sân bay" value={searchParams.sanBayDi} onChange={v => setSearchParams(p => ({ ...p, sanBayDi: v }))} />
            </FormField>
            <FormField label="Sân bay đến">
              <Input placeholder="Mã sân bay" value={searchParams.sanBayDen} onChange={v => setSearchParams(p => ({ ...p, sanBayDen: v }))} />
            </FormField>
            <FormField label="Ngày bay">
              <Input type="date" value={searchParams.ngayBay} onChange={v => setSearchParams(p => ({ ...p, ngayBay: v }))} />
            </FormField>
            <Button variant="secondary" onClick={searchFlights} style={{ marginTop: 24 }}>Tìm</Button>
          </div>

          {validationError && <div className="field-error">{validationError}</div>}
          {flightLoading && <LoadingState text="Đang tìm chuyến bay..." />}
          {flightError && <ErrorState message={flightError} onRetry={searchFlights} />}

          <div className="flight-list-select">
            {flights.map(f => (
              <div
                key={f.maChuyenBay}
                className={`flight-card-select ${selectedFlightId === f.maChuyenBay ? 'selected' : ''}`}
                onClick={() => { setSelectedFlightId(f.maChuyenBay); setSelectedHangVe(null) }}
              >
                <div className="flight-route">
                  <strong>{f.sanBayDi}</strong> → <strong>{f.sanBayDen}</strong>
                </div>
                <div className="flight-time">
                  {f.ngayGioBay ? new Date(f.ngayGioBay).toLocaleString('vi-VN') : ''} | {f.thoiGianBay} phút
                </div>
                <div className="flight-price">
                  Giá cơ bản: <strong>{(f.giaCoBan || 0).toLocaleString('vi-VN')}đ</strong>
                </div>
                <div className="flight-classes">
                  {f.danhSachHangVe?.map(hv => (
                    <label
                      key={hv.maHangVe}
                      className={`class-tag ${selectedHangVe === hv.maHangVe ? 'selected' : ''}`}
                      onClick={e => { e.stopPropagation(); setSelectedHangVe(hv.maHangVe) }}
                    >
                      {hv.tenHangVe} - {(hv.donGia || 0).toLocaleString('vi-VN')}đ
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedFlightId && selectedHangVe && (
            <div className="sticky-bottom">
              <Button onClick={handleBooking} isLoading={submitting} fullWidth>Xác nhận đặt chỗ</Button>
            </div>
          )}
        </>
      )}

      {step === 'bookings' && (
        <>
          {bookingsLoading && <LoadingState text="Đang tải..." />}
          {bookingsError && <ErrorState message={bookingsError} onRetry={loadBookings} />}
          {!bookingsLoading && !bookingsError && bookings.length === 0 && (
            <EmptyState title="Chưa có đặt chỗ" description="Bạn chưa có phiếu đặt chỗ nào" action={{ label: 'Đặt vé ngay', onClick: () => setStep('search') }} />
          )}
          {!bookingsLoading && !bookingsError && bookings.length > 0 && (
            <DataTable
              columns={[
                { key: 'maPhieuDatCho', label: 'Mã phiếu' },
                { key: 'tongTien', label: 'Tổng tiền', render: (r: BookingResponse) => `${(r.tongTien || 0).toLocaleString('vi-VN')}đ` },
                { key: 'trangThaiDatCho', label: 'Trạng thái', render: (r: BookingResponse) => <Badge>{r.trangThaiDatCho}</Badge> },
                { key: 'hanThanhToan', label: 'Hạn thanh toán', render: (r: BookingResponse) => r.hanThanhToan ? new Date(r.hanThanhToan).toLocaleString('vi-VN') : '' },
                { key: 'createdAt', label: 'Ngày đặt', render: (r: BookingResponse) => r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '' },
                { key: 'actions', label: '', render: (r: BookingResponse) => (
                  <Button variant="ghost" size="sm" onClick={() => handleCancelBooking(r.maPhieuDatCho)}>Hủy</Button>
                )},
              ]}
              data={bookings}
            />
          )}
        </>
      )}
    </div>
  )
}
