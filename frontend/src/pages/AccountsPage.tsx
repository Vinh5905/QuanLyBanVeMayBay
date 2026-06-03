import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountsApi } from '../api/accounts.api'
import { formatDateTime } from '../utils/format'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import { Plus, Lock, Unlock, Key } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const createSchema = z.object({
  tenDangNhap: z.string().min(3, 'Tối thiểu 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  matKhau: z.string().min(8, 'Tối thiểu 8 ký tự'),
  vaiTro: z.enum(['NhanVien', 'DaiLy']),
})
type CreateForm = z.infer<typeof createSchema>

export default function AccountsPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const [page, setPage] = useState(0)
  const [vaiTroFilter, setVaiTroFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [resetId, setResetId] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['accounts', page, vaiTroFilter],
    queryFn: () => accountsApi.list({ vaiTro: vaiTroFilter || undefined, page, size: 20 }),
  })

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { vaiTro: 'NhanVien' },
  })

  const createMutation = useMutation({
    mutationFn: (d: CreateForm) => accountsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); toast.success('Tạo tài khoản thành công'); setShowCreate(false); reset() },
    onError: (e: Error) => toast.error(e.message),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => accountsApi.setStatus(id, active),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); toast.success('Cập nhật trạng thái thành công') },
    onError: (e: Error) => toast.error(e.message),
  })

  const resetPwMutation = useMutation({
    mutationFn: () => accountsApi.resetPassword(resetId!, newPassword),
    onSuccess: () => { toast.success('Đặt lại mật khẩu thành công'); setResetId(null); setNewPassword('') },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý tài khoản</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={16} /> Tạo tài khoản
        </button>
      </div>

      <div className="card p-4 flex gap-3">
        <select value={vaiTroFilter} onChange={(e) => { setVaiTroFilter(e.target.value); setPage(0) }} className="input text-sm w-auto">
          <option value="">Tất cả vai trò</option>
          <option value="Admin">Admin</option>
          <option value="NhanVien">Nhân viên</option>
          <option value="DaiLy">Đại lý</option>
          <option value="KhachHang">Khách hàng</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th">Tên đăng nhập</th>
                    <th className="table-th">Email</th>
                    <th className="table-th">Vai trò</th>
                    <th className="table-th">Trạng thái</th>
                    <th className="table-th">Ngày tạo</th>
                    <th className="table-th">Đăng nhập cuối</th>
                    <th className="table-th">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((acc) => (
                    <tr key={acc.maTaiKhoan} className="border-t hover:bg-gray-50">
                      <td className="table-td font-medium">{acc.tenDangNhap}</td>
                      <td className="table-td text-gray-500">{acc.email}</td>
                      <td className="table-td"><Badge variant="blue">{acc.vaiTro}</Badge></td>
                      <td className="table-td">
                        <Badge variant={acc.trangThai === 1 ? 'green' : 'red'}>
                          {acc.trangThai === 1 ? 'Hoạt động' : 'Bị khóa'}
                        </Badge>
                      </td>
                      <td className="table-td text-xs">{formatDateTime(acc.createdAt)}</td>
                      <td className="table-td text-xs">{acc.lastLogin ? formatDateTime(acc.lastLogin) : '—'}</td>
                      <td className="table-td">
                        <div className="flex gap-2">
                          <button
                            onClick={() => statusMutation.mutate({ id: acc.maTaiKhoan, active: acc.trangThai !== 1 })}
                            className="p-1.5 rounded hover:bg-gray-100"
                            title={acc.trangThai === 1 ? 'Khóa tài khoản' : 'Mở khóa'}
                          >
                            {acc.trangThai === 1 ? <Lock size={14} className="text-red-500" /> : <Unlock size={14} className="text-green-500" />}
                          </button>
                          <button
                            onClick={() => setResetId(acc.maTaiKhoan)}
                            className="p-1.5 rounded hover:bg-gray-100"
                            title="Đặt lại mật khẩu"
                          >
                            <Key size={14} className="text-amber-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data?.data.length === 0 && <EmptyState message="Không có tài khoản nào" />}
            {data?.pagination && <Pagination {...data.pagination} onChange={setPage} />}
          </>
        )}
      </div>

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); reset() }} title="Tạo tài khoản mới"
        footer={
          <>
            <button onClick={() => { setShowCreate(false); reset() }} className="btn-secondary">Hủy</button>
            <button onClick={handleSubmit((d) => createMutation.mutate(d))} disabled={isSubmitting || createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? <Spinner size="sm" /> : 'Tạo tài khoản'}
            </button>
          </>
        }>
        <form className="space-y-3">
          <div>
            <label className="label">Tên đăng nhập</label>
            <input {...register('tenDangNhap')} className="input" />
            {errors.tenDangNhap && <p className="text-xs text-red-600 mt-1">{errors.tenDangNhap.message}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input {...register('email')} type="email" className="input" />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Mật khẩu</label>
            <input {...register('matKhau')} type="password" className="input" />
            {errors.matKhau && <p className="text-xs text-red-600 mt-1">{errors.matKhau.message}</p>}
          </div>
          <div>
            <label className="label">Vai trò</label>
            <select {...register('vaiTro')} className="input">
              <option value="NhanVien">Nhân viên</option>
              <option value="DaiLy">Đại lý</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Reset password modal */}
      <Modal open={!!resetId} onClose={() => { setResetId(null); setNewPassword('') }} title="Đặt lại mật khẩu"
        footer={
          <>
            <button onClick={() => { setResetId(null); setNewPassword('') }} className="btn-secondary">Hủy</button>
            <button onClick={() => resetPwMutation.mutate()} disabled={newPassword.length < 8 || resetPwMutation.isPending} className="btn-primary">
              {resetPwMutation.isPending ? <Spinner size="sm" /> : 'Xác nhận'}
            </button>
          </>
        }>
        <div className="space-y-3">
          <label className="label">Mật khẩu mới (tối thiểu 8 ký tự)</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" placeholder="••••••••" />
        </div>
      </Modal>
    </div>
  )
}
