import { useState, useEffect, useCallback } from 'react'
import { StepIndicator } from '../components/StepIndicator'
import { flightApi } from '../../../api/flightApi'
import { ticketApi } from '../../../api/ticketApi'
import { getErrorMessage } from '../../../api/adapter'
import { Button } from '../../../components/Button/Button'
import { Input, FormField } from '../../../components/FormField/FormField'
import { AirportSelect } from '../../flights/components/AirportSelect'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import { toast } from '../../../components/Toast/Toast'
import type { FlightResponse } from '../../../types/flight'
import type { SellTicketRequest } from '../../../types/ticket'

const STEPS = [
  { label: 'Chọn chuyến bay', description: 'Tìm và chọn chuyến bay' },
  { label: 'Thông tin khách hàng', description: 'Nhập thông tin hành khách' },
  { label: 'Xác nhận', description: 'Kiểm tra và bán vé' },
]

interface FormState {
  maChuyenBay: number | null
  maKhachHang: number | null
  maHangVe: number | null
  khachHangSearch: string
  khachHangName: string
  khachHangCccd: string
  khachHangEmail: string
  khachHangPhone: string
}

interface FormErrors {
  maChuyenBay?: string
  maKhachHang?: string
  maHangVe?: string
  khachHangSearch?: string
}

export function TicketSellPage() {
  const [step, setStep] = useState(0)
  const [flights, setFlights] = useState<FlightResponse[]>([])
  const [flightLoading, setFlightLoading] = useState(false)
  const [flightError, setFlightError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchParams, setSearchParams] = useState({ sanBayDi: '', sanBayDen: '', ngayBay: '' })

  const [form, setForm] = useState<FormState>({
    maChuyenBay: null, maKhachHang: null, maHangVe: null,
    khachHangSearch: '', khachHangName: '', khachHangCccd: '',
    khachHangEmail: '', khachHangPhone: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const searchFlights = useCallback(async () => {
    setFlightLoading(true)
    setFlightError(null)
    try {
      const res = await flightApi.searchFlights(searchParams)
      setFlights(res.data?.data || [])
    } catch (err) {
      setFlightError(getErrorMessage(err, 'Không thể tải danh sách chuyến bay'))
    } finally {
      setFlightLoading(false)
    }
  }, [searchParams])

  useEffect(() => { searchFlights() }, [searchFlights])

  const validateStep0 = (): boolean => {
    const e: FormErrors = {}
    if (!form.maChuyenBay) e.maChuyenBay = 'Vui lòng chọn chuyến bay'
    if (!form.maHangVe) e.maHangVe = 'Vui lòng chọn hạng vé'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep1 = (): boolean => {
    const e: FormErrors = {}
    if (!form.maKhachHang) {
      if (!form.khachHangName.trim()) e.khachHangSearch = 'Vui lòng nhập thông tin khách hàng'
      if (!form.khachHangCccd.trim()) e.khachHangSearch = 'Vui lòng nhập CCCD'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return
    if (step === 1 && !validateStep1()) return
    setStep(s => Math.min(s + 1, 2))
  }

  const handleSubmit = async () => {
    if (!form.maChuyenBay || !form.maHangVe) return
    setSubmitting(true)
    try {
      const req: SellTicketRequest = {
        maChuyenBay: form.maChuyenBay,
        maKhachHang: form.maKhachHang || 0,
        maHangVe: form.maHangVe,
      }
      await ticketApi.sellTicket(req)
      toast.success('Bán vé thành công!')
      setStep(0)
      setForm({ maChuyenBay: null, maKhachHang: null, maHangVe: null, khachHangSearch: '', khachHangName: '', khachHangCccd: '', khachHangEmail: '', khachHangPhone: '' })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Bán vé thất bại'))
    } finally {
      setSubmitting(false)
    }
  }

  const selectedFlight = flights.find(f => f.maChuyenBay === form.maChuyenBay)

  return (
    <div className="ticket-sell-page">
      <h1>Bán vé tại quầy</h1>
      <StepIndicator steps={STEPS} currentStep={step} />

      {step === 0 && (
        <div className="step-content">
          <h2>Bước 1: Chọn chuyến bay</h2>
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

          {flightLoading && <LoadingState text="Đang tải chuyến bay..." />}
          {flightError && <ErrorState message={flightError} onRetry={searchFlights} />}

          {errors.maChuyenBay && <div className="field-error">{errors.maChuyenBay}</div>}

          <div className="flight-list-select">
            {flights.map(f => {
              const isSelected = form.maChuyenBay === f.maChuyenBay
              return (
                <div
                  key={f.maChuyenBay}
                  className={`flight-card-select ${isSelected ? 'selected' : ''}`}
                  onClick={() => setForm(p => ({ ...p, maChuyenBay: f.maChuyenBay }))}
                >
                  <div className="flight-route">
                    <strong>{f.sanBayDi}</strong> → <strong>{f.sanBayDen}</strong>
                  </div>
                  <div className="flight-time">
                    {f.ngayGioBay ? new Date(f.ngayGioBay).toLocaleString('vi-VN') : ''} | {f.thoiGianBay} phút
                  </div>
                  <div className="flight-classes">
                    {f.danhSachHangVe?.map(hv => (
                      <label
                        key={hv.maHangVe}
                        className={`class-tag ${form.maHangVe === hv.maHangVe ? 'selected' : ''}`}
                        onClick={e => { e.stopPropagation(); setForm(p => ({ ...p, maHangVe: hv.maHangVe })) }}
                      >
                        {hv.tenHangVe} - {hv.soLuong} ghế
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          {errors.maHangVe && <div className="field-error">{errors.maHangVe}</div>}
        </div>
      )}

      {step === 1 && (
        <div className="step-content">
          <h2>Bước 2: Thông tin khách hàng</h2>
          <FormField label="Tên khách hàng" error={errors.khachHangSearch}>
            <Input
              placeholder="Nhập tên khách hàng"
              value={form.khachHangName}
              onChange={e => setForm(p => ({ ...p, khachHangName: e.target.value }))}
            />
          </FormField>
          <FormField label="CCCD" error={errors.khachHangSearch}>
            <Input
              placeholder="Số CCCD"
              value={form.khachHangCccd}
              onChange={e => setForm(p => ({ ...p, khachHangCccd: e.target.value }))}
            />
          </FormField>
          <FormField label="Email">
            <Input
              type="email"
              placeholder="Email (không bắt buộc)"
              value={form.khachHangEmail}
              onChange={e => setForm(p => ({ ...p, khachHangEmail: e.target.value }))}
            />
          </FormField>
          <FormField label="Số điện thoại">
            <Input
              placeholder="Số điện thoại"
              value={form.khachHangPhone}
              onChange={e => setForm(p => ({ ...p, khachHangPhone: e.target.value }))}
            />
          </FormField>
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <h2>Bước 3: Xác nhận</h2>
          <div className="confirm-card">
            <h3>Thông tin chuyến bay</h3>
            <p>Tuyến: {selectedFlight?.sanBayDi} → {selectedFlight?.sanBayDen}</p>
            <p>Giờ bay: {selectedFlight?.ngayGioBay ? new Date(selectedFlight.ngayGioBay).toLocaleString('vi-VN') : ''}</p>
            <p>Thời gian bay: {selectedFlight?.thoiGianBay} phút</p>
            <h3>Thông tin khách hàng</h3>
            <p>Họ tên: {form.khachHangName || 'Chưa nhập'}</p>
            <p>CCCD: {form.khachHangCccd || 'Chưa nhập'}</p>
          </div>
        </div>
      )}

      <div className="step-actions">
        {step > 0 && <Button variant="secondary" onClick={() => setStep(s => s - 1)}>Quay lại</Button>}
        {step < 2 && <Button onClick={handleNext}>Tiếp theo</Button>}
        {step === 2 && <Button onClick={handleSubmit} isLoading={submitting}>Xác nhận bán vé</Button>}
      </div>
    </div>
  )
}
