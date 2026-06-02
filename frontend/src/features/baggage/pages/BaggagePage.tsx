import { useState, useEffect } from 'react'
import { baggageApi } from '../../../api/baggageApi'
import { getErrorMessage } from '../../../api/adapter'
import { Button } from '../../../components/Button/Button'
import { Input, FormField } from '../../../components/FormField/FormField'
import { DataTable } from '../../../components/DataTable/DataTable'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import { toast } from '../../../components/Toast/Toast'
import type { BaggagePricingResponse } from '../../../types/baggage'

export function BaggagePage() {
  const [pricing, setPricing] = useState<BaggagePricingResponse[]>([])
  const [pricingLoading, setPricingLoading] = useState(true)
  const [pricingError, setPricingError] = useState<string | null>(null)
  const [maVe, setMaVe] = useState('')
  const [maBangGia, setMaBangGia] = useState<number | null>(null)
  const [kienList, setKienList] = useState<{ trongLuong: string; ghiChu: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    baggageApi.getPricing()
      .then(r => { setPricing(r.data || []); setPricingLoading(false) })
      .catch(err => { setPricingError(getErrorMessage(err)); setPricingLoading(false) })
  }, [])

  const addKien = () => {
    setKienList(prev => [...prev, { trongLuong: '', ghiChu: '' }])
  }

  const removeKien = (index: number) => {
    setKienList(prev => prev.filter((_, i) => i !== index))
  }

  const updateKien = (index: number, field: 'trongLuong' | 'ghiChu', value: string) => {
    setKienList(prev => prev.map((k, i) => i === index ? { ...k, [field]: value } : k))
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!maVe.trim()) e.maVe = 'Vui lòng nhập mã vé'
    if (!maBangGia) e.maBangGia = 'Vui lòng chọn gói hành lý'
    if (kienList.length === 0) e.kienList = 'Vui lòng thêm ít nhất 1 kiện'
    kienList.forEach((k, i) => {
      const w = parseFloat(k.trongLuong)
      if (!k.trongLuong.trim() || isNaN(w) || w <= 0) e[`kien_${i}_tl`] = 'Trọng lượng không hợp lệ'
      else if (w > 32) e[`kien_${i}_tl`] = 'Kiện không được quá 32kg'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      await baggageApi.register({
        maVe: Number(maVe),
        maBangGia: maBangGia!,
        danhSachKien: kienList.map(k => ({ trongLuong: parseFloat(k.trongLuong), ghiChu: k.ghiChu })),
      })
      toast.success('Đăng ký hành lý thành công')
      setMaVe(''); setMaBangGia(null); setKienList([])
    } catch (err) {
      toast.error(getErrorMessage(err, 'Đăng ký hành lý thất bại'))
    } finally {
      setSubmitting(false)
    }
  }

  const totalWeight = kienList.reduce((s, k) => s + (parseFloat(k.trongLuong) || 0), 0)
  const selectedPricing = pricing.find(p => p.maBangGia === maBangGia)
  const totalFee = selectedPricing ? (totalWeight * selectedPricing.giaMuaTruoc) : 0

  return (
    <div className="baggage-page">
      <h1>Đăng ký hành lý ký gửi</h1>

      {pricingLoading && <LoadingState text="Đang tải bảng giá..." />}
      {pricingError && <ErrorState message={pricingError} />}

      {!pricingLoading && pricing.length > 0 && (
        <div className="pricing-grid">
          {pricing.map(p => (
            <div key={p.maBangGia} className="pricing-card">
              <h3>{p.tenGoi}</h3>
              <p>Giá mua trước: <strong>{(p.giaMuaTruoc || 0).toLocaleString('vi-VN')}đ/kg</strong></p>
              <p>Giá tại sân bay: <strong>{(p.giaTaiSanBay || 0).toLocaleString('vi-VN')}đ/kg</strong></p>
            </div>
          ))}
        </div>
      )}

      <div className="baggage-form">
        <FormField label="Mã vé" error={errors.maVe}>
          <Input placeholder="Nhập mã vé" value={maVe} onChange={v => setMaVe(v)} />
        </FormField>

        <FormField label="Chọn gói hành lý" error={errors.maBangGia}>
          <select
            className="form-select"
            value={maBangGia ?? ''}
            onChange={e => setMaBangGia(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">-- Chọn gói --</option>
            {pricing.map(p => (
              <option key={p.maBangGia} value={p.maBangGia}>{p.tenGoi} - {(p.giaMuaTruoc || 0).toLocaleString('vi-VN')}đ/kg</option>
            ))}
          </select>
        </FormField>

        <div className="kien-section">
          <div className="kien-header">
            <h3>Danh sách kiện hàng</h3>
            <Button size="sm" onClick={addKien}>+ Thêm kiện</Button>
          </div>
          {errors.kienList && <div className="field-error">{errors.kienList}</div>}
          {kienList.map((k, i) => (
            <div key={i} className="kien-row">
              <FormField label={`Kiện ${i + 1} - Trọng lượng (kg)`} error={errors[`kien_${i}_tl`]}>
                <Input
                  type="number"
                  placeholder="Kg"
                  value={k.trongLuong}
                  onChange={v => updateKien(i, 'trongLuong', v)}
                />
              </FormField>
              <FormField label="Ghi chú">
                <Input placeholder="Ghi chú (không bắt buộc)" value={k.ghiChu} onChange={v => updateKien(i, 'ghiChu', v)} />
              </FormField>
              <Button variant="danger" size="sm" onClick={() => removeKien(i)} style={{ marginTop: 24 }}>Xóa</Button>
            </div>
          ))}
        </div>

        {kienList.length > 0 && (
          <div className="baggage-summary">
            <p>Tổng trọng lượng: <strong>{totalWeight} kg</strong></p>
            <p>Tổng phí: <strong>{(totalFee || 0).toLocaleString('vi-VN')}đ</strong></p>
          </div>
        )}

        <Button onClick={handleSubmit} isLoading={submitting} fullWidth>Xác nhận đăng ký</Button>
      </div>
    </div>
  )
}
