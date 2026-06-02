import { useState } from 'react'
import { checkinApi } from '../../../api/checkinApi'
import { getErrorMessage } from '../../../api/adapter'
import { Button } from '../../../components/Button/Button'
import { Input, FormField } from '../../../components/FormField/FormField'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import { toast } from '../../../components/Toast/Toast'
import type { BoardingPassResponse } from '../../../types/checkin'

export function CheckInPage() {
  const [maVe, setMaVe] = useState('')
  const [soGhe, setSoGhe] = useState('')
  const [boardingPass, setBoardingPass] = useState<BoardingPassResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!maVe.trim()) e.maVe = 'Vui lòng nhập mã vé'
    if (!soGhe.trim()) e.soGhe = 'Vui lòng nhập số ghế'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCheckIn = async () => {
    if (!validate()) return
    setLoading(true)
    setError(null)
    setBoardingPass(null)
    try {
      const res = await checkinApi.checkIn({ maVe: Number(maVe), soGhe: soGhe.trim() })
      setBoardingPass(res.data)
      toast.success('Check-in thành công!')
    } catch (err) {
      const msg = getErrorMessage(err, 'Check-in thất bại')
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="checkin-page">
      <h1>Check-in trực tuyến</h1>

      <div className="checkin-form">
        <FormField label="Mã vé" error={errors.maVe}>
          <Input placeholder="Nhập mã vé" value={maVe} onChange={setMaVe} />
        </FormField>
        <FormField label="Số ghế" error={errors.soGhe}>
          <Input placeholder="Ví dụ: A12" value={soGhe} onChange={setSoGhe} />
        </FormField>
        <Button onClick={handleCheckIn} isLoading={loading} fullWidth>Xác nhận Check-in</Button>
      </div>

      {error && <ErrorState message={error} />}
      {loading && <LoadingState text="Đang xử lý check-in..." />}

      {boardingPass && (
        <div className="boarding-pass">
          <div className="bp-header">
            <h2>Boarding Pass</h2>
            <div className="bp-code">{boardingPass.boardingPassCode}</div>
          </div>
          <div className="bp-body">
            <div className="bp-row">
              <span className="bp-label">Hành khách</span>
              <span className="bp-value">{boardingPass.hanhKhach.hoTen}</span>
            </div>
            <div className="bp-row">
              <span className="bp-label">Tuyến bay</span>
              <span className="bp-value">{boardingPass.chuyenBay.sanBayDi} → {boardingPass.chuyenBay.sanBayDen}</span>
            </div>
            <div className="bp-row">
              <span className="bp-label">Giờ bay</span>
              <span className="bp-value">{new Date(boardingPass.chuyenBay.ngayGioBay).toLocaleString('vi-VN')}</span>
            </div>
            <div className="bp-row">
              <span className="bp-label">Số ghế</span>
              <span className="bp-value bp-seat">{boardingPass.soGhe}</span>
            </div>
            <div className="bp-row">
              <span className="bp-label">Mã vé</span>
              <span className="bp-value">{boardingPass.ve.maVeCode}</span>
            </div>
            <div className="bp-row">
              <span className="bp-label">Check-in lúc</span>
              <span className="bp-value">{new Date(boardingPass.checkInAt).toLocaleString('vi-VN')}</span>
            </div>
          </div>
          <div className="bp-footer">
            <Button onClick={() => window.print()}>In thẻ lên tàu</Button>
          </div>
        </div>
      )}
    </div>
  )
}
