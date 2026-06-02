import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paymentApi } from '../../../api/paymentApi'
import { getErrorMessage } from '../../../api/adapter'
import { Button } from '../../../components/Button/Button'
import { Input, FormField } from '../../../components/FormField/FormField'
import { toast } from '../../../components/Toast/Toast'
import type { PaymentRequest } from '../../../types/payment'

export function CreatePaymentPage() {
  const navigate = useNavigate()
  const [maVe, setMaVe] = useState('')
  const [maPhieuDat, setMaPhieuDat] = useState('')
  const [soTien, setSoTien] = useState('')
  const [hinhThuc, setHinhThuc] = useState('TIEN_MAT')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!maVe.trim() && !maPhieuDat.trim()) e.maVe = 'Vui lòng nhập mã vé hoặc mã phiếu đặt'
    const st = parseFloat(soTien)
    if (!soTien.trim() || isNaN(st) || st <= 0) e.soTien = 'Số tiền không hợp lệ'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const data: PaymentRequest = {
        maVe: maVe.trim() ? Number(maVe) : undefined,
        maPhieuDatCho: maPhieuDat.trim() ? Number(maPhieuDat) : undefined,
        soTienThanhToan: parseFloat(soTien),
        hinhThucThanhToan: hinhThuc,
      }
      await paymentApi.createPayment(data)
      toast.success('Tạo thanh toán thành công')
      navigate('/admin/payments')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Tạo thanh toán thất bại'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="create-payment-page">
      <h1>Tạo thanh toán</h1>
      <div className="payment-form">
        <FormField label="Mã vé" error={errors.maVe}>
          <Input placeholder="Nhập mã vé" value={maVe} onChange={setMaVe} />
        </FormField>
        <FormField label="Mã phiếu đặt (nếu có)">
          <Input placeholder="Nhập mã phiếu đặt" value={maPhieuDat} onChange={setMaPhieuDat} />
        </FormField>
        <FormField label="Số tiền thanh toán" error={errors.soTien}>
          <Input type="number" placeholder="Nhập số tiền" value={soTien} onChange={setSoTien} />
        </FormField>
        <FormField label="Hình thức thanh toán">
          <select className="form-select" value={hinhThuc} onChange={e => setHinhThuc(e.target.value)}>
            <option value="TIEN_MAT">Tiền mặt</option>
            <option value="CHUYEN_KHOAN">Chuyển khoản</option>
          </select>
        </FormField>
        <Button onClick={handleSubmit} isLoading={submitting} fullWidth>Xác nhận thanh toán</Button>
      </div>
    </div>
  )
}
