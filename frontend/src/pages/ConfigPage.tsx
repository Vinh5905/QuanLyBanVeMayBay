import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { configApi } from '../api/config.api'
import { formatDateTime } from '../utils/format'
import Spinner from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { Save, RefreshCw } from 'lucide-react'

const PARAM_LABELS: Record<string, string> = {
  TuoiMuaVeToiThieu: 'Tuổi tối thiểu mua vé (năm)',
  ThoiGianBayToiThieu: 'Thời gian bay tối thiểu (phút)',
  SoSanBayTrungGianToiDa: 'Số sân bay trung gian tối đa',
  ThoiGianDungToiThieu: 'Thời gian dừng tối thiểu tại sân bay TG (phút)',
  ThoiGianDungToiDa: 'Thời gian dừng tối đa tại sân bay TG (phút)',
  ThoiGianDongBanVe: 'Đóng bán vé trước giờ bay (phút)',
  TGDatVeChamNhat: 'Đặt vé online chậm nhất trước giờ bay (phút)',
  TGHuyChamNhat: 'Hủy vé chậm nhất trước giờ bay (phút)',
  ThoiGianChoPhepDoiVe: 'Đổi chuyến chậm nhất trước giờ bay (giờ)',
  ThueVAT: 'Thuế VAT (%)',
  ThoiHanThanhToan: 'Hạn thanh toán sau đặt chỗ (giờ)',
  TrongLuongToiDaMotKien: 'Trọng lượng tối đa 1 kiện hành lý (kg)',
  SoKienToiDa: 'Số kiện hành lý tối đa trong 1 gói',
  ThoiGianMuaHanhLyUuDai: 'Mua hành lý ưu đãi trước giờ bay (giờ)',
  ThoiGianMoCheckInOnline: 'Mở check-in online trước giờ bay (giờ)',
  ThoiGianDongCheckInOnline: 'Đóng check-in online trước giờ bay (phút)',
  ACCESS_TOKEN_MINUTES: 'Thời hạn access token (phút)',
  REFRESH_TOKEN_EXPIRY_DAYS: 'Thời hạn refresh token (ngày)',
}

export default function ConfigPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const { data: params = [], isLoading, refetch } = useQuery({
    queryKey: ['config'],
    queryFn: configApi.list,
    staleTime: 30_000,
  })

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => configApi.update(key, value),
    onSuccess: (_, { key }) => {
      qc.invalidateQueries({ queryKey: ['config'] })
      toast.success(`Cập nhật ${key} thành công`)
      setSaving(null)
      setEditValues((prev) => { const n = { ...prev }; delete n[key]; return n })
    },
    onError: (e: Error, { key }) => { toast.error(e.message); setSaving(null) },
  })

  const handleSave = (key: string) => {
    const value = editValues[key]
    if (value === undefined) return
    setSaving(key)
    updateMutation.mutate({ key, value })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Tham số hệ thống</h1>
        <button onClick={() => refetch()} className="btn-secondary text-sm">
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      <p className="text-sm text-gray-500">Thay đổi có hiệu lực ngay lập tức với giao dịch mới.</p>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="card divide-y">
          {params.map((p) => {
            const isEditing = editValues[p.tenThamSo] !== undefined
            const value = isEditing ? editValues[p.tenThamSo] : p.giaTri

            return (
              <div key={p.tenThamSo} className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{PARAM_LABELS[p.tenThamSo] || p.tenThamSo}</p>
                  {p.moTa && <p className="text-xs text-gray-400 mt-0.5">{p.moTa}</p>}
                  <p className="text-xs text-gray-300 mt-0.5 font-mono">{p.tenThamSo}</p>
                  {p.capNhatLuc && <p className="text-xs text-gray-300 mt-0.5">Cập nhật: {formatDateTime(p.capNhatLuc)}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setEditValues({ ...editValues, [p.tenThamSo]: e.target.value })}
                    className="input text-sm w-24 text-right"
                  />
                  {isEditing && (
                    <button
                      onClick={() => handleSave(p.tenThamSo)}
                      disabled={saving === p.tenThamSo}
                      className="btn-primary text-xs py-2"
                    >
                      {saving === p.tenThamSo ? <Spinner size="sm" /> : <Save size={14} />}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
