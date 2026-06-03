import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff } from 'lucide-react'
import Spinner from '../components/ui/Spinner'
import { AxiosError } from 'axios'

const schema = z.object({
  tenDangNhap: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  matKhau: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
  const [showPass, setShowPass] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await login(data.tenDangNhap, data.matKhau)
      navigate(from, { replace: true })
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>
      setServerError(e.response?.data?.message || 'Đăng nhập thất bại')
    }
  }

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Đăng nhập</h2>
      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Tên đăng nhập</label>
          <input {...register('tenDangNhap')} className="input" placeholder="admin" />
          {errors.tenDangNhap && <p className="text-xs text-red-600 mt-1">{errors.tenDangNhap.message}</p>}
        </div>
        <div>
          <label className="label">Mật khẩu</label>
          <div className="relative">
            <input
              {...register('matKhau')}
              type={showPass ? 'text' : 'password'}
              className="input pr-10"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.matKhau && <p className="text-xs text-red-600 mt-1">{errors.matKhau.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-2.5">
          {isSubmitting ? <Spinner size="sm" /> : 'Đăng nhập'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-blue-600 hover:underline font-medium">Đăng ký</Link>
      </p>
    </>
  )
}
