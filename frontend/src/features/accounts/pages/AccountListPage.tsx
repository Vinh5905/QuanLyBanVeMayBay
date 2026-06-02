import { useState, useEffect, useCallback } from 'react'
import { accountApi } from '../../../api/accountApi'
import { getErrorMessage } from '../../../api/adapter'
import { Button } from '../../../components/Button/Button'
import { Input, Select, FormField } from '../../../components/FormField/FormField'
import { DataTable } from '../../../components/DataTable/DataTable'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { Pagination } from '../../../components/Pagination/Pagination'
import { Badge } from '../../../components/Badge/Badge'
import { Modal } from '../../../components/Modal/Modal'
import { toast } from '../../../components/Toast/Toast'
import type { AccountResponse, CreateAccountRequest } from '../../../types/account'

const roleColors: Record<string, string> = {
  QuanTriVien: 'error',
  NhanVien: 'primary',
  DaiLy: 'warning',
  KhachHang: 'neutral',
}

export function AccountListPage() {
  const [accounts, setAccounts] = useState<AccountResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [filterVaiTro, setFilterVaiTro] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<AccountResponse | null>(null)
  const size = 10

  const [createForm, setCreateForm] = useState<CreateAccountRequest>({
    tenDangNhap: '', matKhau: '', email: '', vaiTro: 'NhanVien',
  })
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})
  const [createLoading, setCreateLoading] = useState(false)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await accountApi.getAccounts({
        vaiTro: filterVaiTro || undefined,
        page, size,
      })
      setAccounts(res.data || [])
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages)
        setTotalElements(res.pagination.totalElements)
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải danh sách tài khoản'))
    } finally {
      setLoading(false)
    }
  }, [page, filterVaiTro])

  useEffect(() => { fetchAccounts() }, [fetchAccounts])

  const validateCreate = (): boolean => {
    const e: Record<string, string> = {}
    if (!createForm.tenDangNhap.trim()) e.tenDangNhap = 'Vui lòng nhập tên đăng nhập'
    if (!createForm.matKhau.trim() || createForm.matKhau.length < 6) e.matKhau = 'Mật khẩu phải ít nhất 6 ký tự'
    if (!createForm.email.trim()) e.email = 'Vui lòng nhập email'
    if (!createForm.vaiTro) e.vaiTro = 'Vui lòng chọn vai trò'
    setCreateErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = async () => {
    if (!validateCreate()) return
    setCreateLoading(true)
    try {
      await accountApi.createAccount(createForm)
      toast.success('Tạo tài khoản thành công')
      setShowCreate(false)
      setCreateForm({ tenDangNhap: '', matKhau: '', email: '', vaiTro: 'NhanVien' })
      fetchAccounts()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Tạo tài khoản thất bại'))
    } finally {
      setCreateLoading(false)
    }
  }

  const handleToggleStatus = async (acc: AccountResponse) => {
    try {
      await accountApi.updateStatus(acc.maTaiKhoan, { trangThai: acc.trangThai === 1 ? 0 : 1 })
      toast.success(acc.trangThai === 1 ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản')
      fetchAccounts()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleResetPassword = async (id: number) => {
    if (!window.confirm('Xác nhận reset mật khẩu?')) return
    try {
      await accountApi.resetPassword(id)
      toast.success('Reset mật khẩu thành công')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const columns = [
    { key: 'tenDangNhap', label: 'Tên đăng nhập' },
    { key: 'email', label: 'Email' },
    { key: 'vaiTro', label: 'Vai trò', render: (r: AccountResponse) => (
      <Badge variant={(roleColors[r.vaiTro] || 'neutral') as any}>{r.vaiTro}</Badge>
    )},
    { key: 'trangThai', label: 'Trạng thái', render: (r: AccountResponse) => (
      <Badge variant={r.trangThai === 1 ? 'success' : 'error'}>{r.trangThai === 1 ? 'Hoạt động' : 'Đã khóa'}</Badge>
    )},
    { key: 'createdAt', label: 'Ngày tạo', render: (r: AccountResponse) => r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '' },
    { key: 'lastLogin', label: 'Lần cuối', render: (r: AccountResponse) => r.lastLogin ? new Date(r.lastLogin).toLocaleDateString('vi-VN') : 'Chưa đăng nhập' },
    { key: 'actions', label: '', render: (r: AccountResponse) => (
      <div className="action-buttons">
        <Button variant="ghost" size="sm" onClick={() => setSelectedAccount(r)}>Xem</Button>
        <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(r)}>
          {r.trangThai === 1 ? 'Khóa' : 'Mở'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleResetPassword(r.maTaiKhoan)}>Reset MK</Button>
      </div>
    )},
  ]

  return (
    <div className="account-list-page">
      <div className="page-header">
        <h1>Quản lý tài khoản</h1>
        <Button onClick={() => setShowCreate(true)}>Tạo tài khoản</Button>
      </div>

      <div className="filter-row">
        <FormField label="Vai trò">
          <Select
            value={filterVaiTro}
            onChange={setFilterVaiTro}
            options={[
              { value: '', label: 'Tất cả' },
              { value: 'QuanTriVien', label: 'Quản trị viên' },
              { value: 'NhanVien', label: 'Nhân viên' },
              { value: 'DaiLy', label: 'Đại lý' },
              { value: 'KhachHang', label: 'Khách hàng' },
            ]}
          />
        </FormField>
      </div>

      {loading && <LoadingState text="Đang tải..." />}
      {error && <ErrorState message={error} onRetry={fetchAccounts} />}
      {!loading && !error && accounts.length === 0 && <EmptyState title="Không có tài khoản" description="Chưa có tài khoản nào" />}
      {!loading && !error && accounts.length > 0 && (
        <>
          <DataTable columns={columns} data={accounts} />
          <div className="table-footer">
            <span className="total-count">Tổng: {totalElements} tài khoản</span>
            {totalPages > 1 && (
              <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={p => setPage(p - 1)} />
            )}
          </div>
        </>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Tạo tài khoản mới">
        <FormField label="Tên đăng nhập" error={createErrors.tenDangNhap}>
          <Input placeholder="Tên đăng nhập" value={createForm.tenDangNhap} onChange={v => setCreateForm(p => ({ ...p, tenDangNhap: v }))} />
        </FormField>
        <FormField label="Mật khẩu" error={createErrors.matKhau}>
          <Input type="password" placeholder="Mật khẩu (ít nhất 6 ký tự)" value={createForm.matKhau} onChange={v => setCreateForm(p => ({ ...p, matKhau: v }))} />
        </FormField>
        <FormField label="Email" error={createErrors.email}>
          <Input type="email" placeholder="Email" value={createForm.email} onChange={v => setCreateForm(p => ({ ...p, email: v }))} />
        </FormField>
        <FormField label="Vai trò" error={createErrors.vaiTro}>
          <select className="form-select" value={createForm.vaiTro} onChange={e => setCreateForm(p => ({ ...p, vaiTro: e.target.value }))}>
            <option value="NhanVien">Nhân viên</option>
            <option value="DaiLy">Đại lý</option>
          </select>
        </FormField>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setShowCreate(false)}>Hủy</Button>
          <Button onClick={handleCreate} isLoading={createLoading}>Tạo tài khoản</Button>
        </div>
      </Modal>

      <Modal open={!!selectedAccount} onClose={() => setSelectedAccount(null)} title="Chi tiết tài khoản">
        {selectedAccount && (
          <div>
            <p><strong>Tên ĐN:</strong> {selectedAccount.tenDangNhap}</p>
            <p><strong>Email:</strong> {selectedAccount.email}</p>
            <p><strong>Vai trò:</strong> {selectedAccount.vaiTro}</p>
            <p><strong>Trạng thái:</strong> {selectedAccount.trangThai === 1 ? 'Hoạt động' : 'Đã khóa'}</p>
            <p><strong>Ngày tạo:</strong> {selectedAccount.createdAt ? new Date(selectedAccount.createdAt).toLocaleString('vi-VN') : ''}</p>
            <p><strong>Lần cuối ĐN:</strong> {selectedAccount.lastLogin ? new Date(selectedAccount.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
