import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingApi } from '../../../api/bookingApi'
import { flightApi } from '../../../api/flightApi'
import { getErrorMessage } from '../../../api/adapter'
import { Button } from '../../../components/Button/Button'
import { Input, FormField } from '../../../components/FormField/FormField'
import { AirportSelect } from '../../flights/components/AirportSelect'
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
      setFlights(res.data?.data || [])
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
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end',
            padding: '16px 20px', background: '#fff', borderRadius: 12,
            border: '1px solid #E2E8F0', marginBottom: 16,
          }}>
            <div style={{ flex: '1 1 200px', minWidth: 160 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Sân bay đi</label>
              <AirportSelect value={searchParams.sanBayDi} onChange={v => setSearchParams(p => ({ ...p, sanBayDi: v }))} placeholder="Chọn sân bay đi" />
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 160 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Sân bay đến</label>
              <AirportSelect value={searchParams.sanBayDen} onChange={v => setSearchParams(p => ({ ...p, sanBayDen: v }))} placeholder="Chọn sân bay đến" />
            </div>
            <div style={{ flex: '0 1 180px', minWidth: 140 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Ngày bay</label>
              <input className="ds-input" type="date" value={searchParams.ngayBay} onChange={e => setSearchParams(p => ({ ...p, ngayBay: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 8, paddingBottom: 1 }}>
              <Button variant="primary" onClick={searchFlights} isLoading={flightLoading}>Tìm kiếm</Button>
            </div>
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
            <EmptyState title="Chưa có đặt chỗ" description="Bạn chưa có phiếu đặt chỗ nào" action={<Button onClick={() => setStep('search')}>Đặt vé ngay</Button>} />
          )}
          {!bookingsLoading && !bookingsError && bookings.length > 0 && (
            <DataTable
              columns={[
                { key: 'maPhieuDatCho', header: 'Mã phiếu' },
                { key: 'tongTien', header: 'Tổng tiền', render: (r: BookingResponse) => `${(r.tongTien || 0).toLocaleString('vi-VN')}đ` },
                { key: 'trangThaiDatCho', header: 'Trạng thái', render: (r: BookingResponse) => <Badge>{r.trangThaiDatCho}</Badge> },
                { key: 'hanThanhToan', header: 'Hạn thanh toán', render: (r: BookingResponse) => r.hanThanhToan ? new Date(r.hanThanhToan).toLocaleString('vi-VN') : '' },
                { key: 'createdAt', header: 'Ngày đặt', render: (r: BookingResponse) => r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '' },
                { key: 'actions', header: '', render: (r: BookingResponse) => (
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
