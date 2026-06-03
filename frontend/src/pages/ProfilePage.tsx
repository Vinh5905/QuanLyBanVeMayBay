import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../api/profile.api'
import { authApi } from '../api/auth.api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '../components/ui/Toast'
import Spinner from '../components/ui/Spinner'
import { User, Shield, Star, Edit2, X, Check, KeyRound } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const profileSchema = z.object({
  hoTen: z.string().min(2, 'Vui lòng nhập họ tên').max(150),
  soDienThoai: z.string().max(20).optional(),
  cccd: z.string().max(20).optional(),
  ngaySinh: z.string().optional(),
})
type ProfileForm = z.infer<typeof profileSchema>

const pwSchema = z.object({
  matKhauHienTai: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  matKhauMoi: z.string().min(8, 'Mật khẩu mới tối thiểu 8 ký tự'),
  xacNhanMatKhau: z.string(),
}).refine((d) => d.matKhauMoi === d.xacNhanMatKhau, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['xacNhanMatKhau'],
})
type PwForm = z.infer<typeof pwSchema>

const TIER_COLORS: Record<string, string> = {
  'Đồng': 'text-amber-700 bg-amber-50 border-amber-200',
  'Bạc': 'text-gray-600 bg-gray-100 border-gray-300',
  'Vàng': 'text-yellow-700 bg-yellow-50 border-yellow-200',
  'Bạch Kim': 'text-purple-700 bg-purple-50 border-purple-200',
}

export default function ProfilePage() {
  const qc = useQueryClient()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      hoTen: profile.hoTen,
      soDienThoai: profile.soDienThoai ?? '',
      cccd: profile.cccd ?? '',
      ngaySinh: profile.ngaySinh ? profile.ngaySinh.split('T')[0] : '',
    } : undefined,
  })

  const { register: regPw, handleSubmit: handlePw, reset: resetPw, formState: { errors: pwErrors, isSubmitting: pwSubmitting } } = useForm<PwForm>({
    resolver: zodResolver(pwSchema),
  })

  const updateMutation = useMutation({
    mutationFn: profileApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Cập nhật hồ sơ thành công')
      setEditing(false)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const pwMutation = useMutation({
    mutationFn: ({ matKhauHienTai, matKhauMoi }: PwForm) =>
      authApi.changePassword(matKhauHienTai, matKhauMoi),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công')
      setShowPw(false)
      resetPw()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!profile) return <div className="text-center py-20 text-gray-500">Không tải được hồ sơ</div>

  const tierClass = TIER_COLORS[profile.hangThanhVien ?? ''] ?? 'text-gray-600 bg-gray-100 border-gray-300'

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900">Thông tin của tôi</h1>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={28} className="text-blue-500" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{profile.hoTen}</p>
              <p className="text-sm text-gray-500">{profile.tenDangNhap}</p>
            </div>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
              <Edit2 size={14} /> Chỉnh sửa
            </button>
          )}
        </div>

        {/* Membership */}
        <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-gray-50 border">
          <Star size={18} className="text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Hạng thành viên</p>
            <span className={`text-sm font-semibold px-2 py-0.5 rounded border ${tierClass}`}>
              {profile.hangThanhVien ?? 'Chưa xếp hạng'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Điểm tích lũy</p>
            <p className="font-bold text-gray-900">{profile.diemTichLuy.toLocaleString()}</p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit((d) => updateMutation.mutate({
            hoTen: d.hoTen,
            soDienThoai: d.soDienThoai || undefined,
            cccd: d.cccd || undefined,
            ngaySinh: d.ngaySinh || undefined,
          }))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Họ và tên</label>
                <input {...register('hoTen')} className="input" />
                {errors.hoTen && <p className="text-xs text-red-600 mt-1">{errors.hoTen.message}</p>}
              </div>
              <div>
                <label className="label">Ngày sinh</label>
                <input {...register('ngaySinh')} type="date" className="input" />
              </div>
              <div>
                <label className="label">Số điện thoại</label>
                <input {...register('soDienThoai')} className="input" placeholder="0901234567" />
              </div>
              <div className="col-span-2">
                <label className="label">CCCD</label>
                <input {...register('cccd')} className="input" placeholder="079200012345" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={isSubmitting || updateMutation.isPending} className="btn-primary">
                {updateMutation.isPending ? <Spinner size="sm" /> : <><Check size={14} /> Lưu</>}
              </button>
              <button type="button" onClick={() => { setEditing(false); reset() }} className="btn-secondary">
                <X size={14} /> Hủy
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Ngày sinh</p>
              <p className="font-medium">
                {profile.ngaySinh ? format(parseISO(profile.ngaySinh), 'dd/MM/yyyy') : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Số điện thoại</p>
              <p className="font-medium">{profile.soDienThoai || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">CCCD</p>
              <p className="font-medium font-mono">{profile.cccd || '—'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-gray-500" />
            <p className="font-semibold text-gray-800">Bảo mật</p>
          </div>
          {!showPw && (
            <button onClick={() => setShowPw(true)} className="btn-secondary text-sm">
              <KeyRound size={14} /> Đổi mật khẩu
            </button>
          )}
        </div>

        {showPw && (
          <form onSubmit={handlePw((d) => pwMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="label">Mật khẩu hiện tại</label>
              <input {...regPw('matKhauHienTai')} type="password" className="input" />
              {pwErrors.matKhauHienTai && <p className="text-xs text-red-600 mt-1">{pwErrors.matKhauHienTai.message}</p>}
            </div>
            <div>
              <label className="label">Mật khẩu mới</label>
              <input {...regPw('matKhauMoi')} type="password" className="input" />
              {pwErrors.matKhauMoi && <p className="text-xs text-red-600 mt-1">{pwErrors.matKhauMoi.message}</p>}
            </div>
            <div>
              <label className="label">Xác nhận mật khẩu mới</label>
              <input {...regPw('xacNhanMatKhau')} type="password" className="input" />
              {pwErrors.xacNhanMatKhau && <p className="text-xs text-red-600 mt-1">{pwErrors.xacNhanMatKhau.message}</p>}
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={pwSubmitting || pwMutation.isPending} className="btn-primary">
                {pwMutation.isPending ? <Spinner size="sm" /> : 'Đổi mật khẩu'}
              </button>
              <button type="button" onClick={() => { setShowPw(false); resetPw() }} className="btn-secondary">Hủy</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
