import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { authApi } from '../api/auth.api'
import Spinner from '../components/ui/Spinner'
import { AxiosError } from 'axios'
import { subYears } from 'date-fns'

const MIN_AGE = 18
const maxBirthDate = subYears(new Date(), MIN_AGE).toISOString().split('T')[0]

const schema = z.object({
  tenDangNhap: z.string().min(3, 'Tối thiểu 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  matKhau: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  hoTen: z.string().min(2, 'Vui lòng nhập họ tên'),
  ngaySinh: z.string().min(1, 'Vui lòng nhập ngày sinh').refine((val) => {
    const birth = new Date(val)
    const today = new Date()
    const age = today.getFullYear() - birth.getFullYear() - (
      today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0
    )
    return age >= MIN_AGE
  }, `Phải đủ ${MIN_AGE} tuổi để đăng ký`),
  soDienThoai: z.string().optional(),
  cccd: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await authApi.register(data)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>
      setServerError(e.response?.data?.message || 'Đăng ký thất bại')
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h2 className="text-lg font-semibold text-gray-900">Đăng ký thành công!</h2>
        <p className="text-sm text-gray-500 mt-2">Đang chuyển về trang đăng nhập...</p>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Đăng ký tài khoản</h2>
      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{serverError}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Họ và tên <span className="text-red-500">*</span></label>
            <input {...register('hoTen')} className="input" placeholder="Nguyễn Văn A" />
            {errors.hoTen && <p className="text-xs text-red-600 mt-1">{errors.hoTen.message}</p>}
          </div>
          <div>
            <label className="label">Ngày sinh <span className="text-red-500">*</span></label>
            <input {...register('ngaySinh')} type="date" max={maxBirthDate} className="input" />
            {errors.ngaySinh && <p className="text-xs text-red-600 mt-1">{errors.ngaySinh.message}</p>}
          </div>
          <div>
            <label className="label">Số điện thoại</label>
            <input {...register('soDienThoai')} className="input" placeholder="0901234567" />
          </div>
          <div>
            <label className="label">Tên đăng nhập <span className="text-red-500">*</span></label>
            <input {...register('tenDangNhap')} className="input" placeholder="nguyenvana" />
            {errors.tenDangNhap && <p className="text-xs text-red-600 mt-1">{errors.tenDangNhap.message}</p>}
          </div>
          <div>
            <label className="label">Email <span className="text-red-500">*</span></label>
            <input {...register('email')} type="email" className="input" placeholder="email@example.com" />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">CCCD</label>
            <input {...register('cccd')} className="input" placeholder="079200012345" />
          </div>
          <div>
            <label className="label">Mật khẩu <span className="text-red-500">*</span></label>
            <input {...register('matKhau')} type="password" className="input" placeholder="Tối thiểu 8 ký tự" />
            {errors.matKhau && <p className="text-xs text-red-600 mt-1">{errors.matKhau.message}</p>}
          </div>
        </div>
        <p className="text-xs text-gray-400">Phải đủ {MIN_AGE} tuổi để mua vé máy bay.</p>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-2.5">
          {isSubmitting ? <Spinner size="sm" /> : 'Đăng ký'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">Đăng nhập</Link>
      </p>
    </>
  )
}
