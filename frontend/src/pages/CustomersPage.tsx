import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { customersApi } from '../api/customers.api'
import { formatDateTime } from '../utils/format'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'
import Badge from '../components/ui/Badge'
import { Search, Ticket } from 'lucide-react'

export default function CustomersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [kw, setKw] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, kw],
    queryFn: () => customersApi.list({ keyword: kw || undefined, page, size: 20 }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý khách hàng</h1>
      </div>

      <div className="card p-4">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (setKw(keyword), setPage(0))}
              className="input pl-8 text-sm"
              placeholder="Tìm theo tên đăng nhập, email..."
            />
          </div>
          <button onClick={() => { setKw(keyword); setPage(0) }} className="btn-primary text-sm">Tìm</button>
        </div>
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
                    <th className="table-th">Mã KH</th>
                    <th className="table-th">Họ tên</th>
                    <th className="table-th">Email</th>
                    <th className="table-th">Số điện thoại</th>
                    <th className="table-th">CCCD</th>
                    <th className="table-th">Điểm tích lũy</th>
                    <th className="table-th">Ngày tạo</th>
                    <th className="table-th"></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((c) => (
                    <tr key={c.maKhachHang} className="border-t hover:bg-gray-50">
                      <td className="table-td font-mono text-xs text-gray-500">#{c.maKhachHang}</td>
                      <td className="table-td font-medium">{c.hoTen}</td>
                      <td className="table-td text-gray-500">{c.email || '—'}</td>
                      <td className="table-td text-gray-500">{c.soDienThoai || '—'}</td>
                      <td className="table-td text-gray-500">{c.cccd || '—'}</td>
                      <td className="table-td">
                        <Badge variant={c.diemTichLuy > 0 ? 'green' : 'gray'}>
                          {c.diemTichLuy}
                        </Badge>
                      </td>
                      <td className="table-td text-xs">{formatDateTime(c.createdAt)}</td>
                      <td className="table-td">
                        <button
                          onClick={() => navigate(`/tickets?maKhachHang=${c.maKhachHang}`)}
                          className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
                        >
                          <Ticket size={12} /> Xem vé
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data?.data.length === 0 && <EmptyState message="Không có khách hàng nào" />}
            {data?.pagination && <Pagination {...data.pagination} onChange={setPage} />}
          </>
        )}
      </div>
    </div>
  )
}
