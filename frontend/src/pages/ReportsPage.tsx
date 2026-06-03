import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../api/reports.api'
import { formatCurrency, formatDateTime } from '../utils/format'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { Download, Printer, BarChart2 } from 'lucide-react'

const MONTH_NAMES = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']

export default function ReportsPage() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const [tab, setTab] = useState<'monthly' | 'yearly'>('monthly')
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)

  const { data: monthlyData = [], isLoading: loadingMonthly } = useQuery({
    queryKey: ['report-monthly', year, month],
    queryFn: () => reportsApi.monthly(year, month),
    enabled: tab === 'monthly',
  })

  const { data: yearlyData = [], isLoading: loadingYearly } = useQuery({
    queryKey: ['report-yearly', year],
    queryFn: () => reportsApi.yearly(year),
    enabled: tab === 'yearly',
  })

  const totalRevenue = tab === 'monthly'
    ? monthlyData.reduce((s, r) => s + r.doanhThuVe + r.doanhThuHanhLy, 0)
    : yearlyData.reduce((s, r) => s + r.doanhThu, 0)
  const totalTickets = tab === 'monthly'
    ? monthlyData.reduce((s, r) => s + r.soVeBan, 0)
    : yearlyData.reduce((s, r) => s + r.soVe, 0)

  const handleExport = () => {
    if (tab === 'monthly') reportsApi.exportExcel(year, month)
    else reportsApi.exportExcel(year)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Báo cáo doanh thu</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary text-sm">
            <Download size={14} /> Xuất Excel
          </button>
          <button onClick={() => window.print()} className="btn-secondary text-sm no-print">
            <Printer size={14} /> In PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('monthly')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Theo tháng</button>
        <button onClick={() => setTab('yearly')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'yearly' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Theo năm</button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex gap-3 items-end">
        <div>
          <label className="label text-xs">Năm</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input text-sm w-28">
            {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {tab === 'monthly' && (
          <div>
            <label className="label text-xs">Tháng</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="input text-sm w-24">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
          </div>
        )}
        <p className="text-xs text-gray-400 self-center pb-1">* Dữ liệu đã lọc theo quy định hiện hành</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Tổng doanh thu</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Tổng vé bán</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalTickets.toLocaleString('vi-VN')}</p>
        </div>
        {tab === 'monthly' && (
          <div className="card p-4">
            <p className="text-xs text-gray-500">Số chuyến bay</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{monthlyData.length}</p>
          </div>
        )}
        {tab === 'yearly' && (
          <div className="card p-4">
            <p className="text-xs text-gray-500">Tổng chuyến bay</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{yearlyData.reduce((s, r) => s + r.soChuyenBay, 0)}</p>
          </div>
        )}
      </div>

      {(loadingMonthly || loadingYearly) && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {/* Monthly report */}
      {tab === 'monthly' && !loadingMonthly && (
        <>
          {monthlyData.length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-4 flex items-center gap-2">
                <BarChart2 size={16} /> Doanh thu theo chuyến bay
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="maChuyenBayCode" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), '']} />
                  <Bar dataKey="doanhThuVe" fill="#3b82f6" name="Doanh thu vé" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="doanhThuHanhLy" fill="#8b5cf6" name="Doanh thu hành lý" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th">Chuyến bay</th>
                    <th className="table-th">Tuyến</th>
                    <th className="table-th">Ngày bay</th>
                    <th className="table-th text-right">Doanh thu vé</th>
                    <th className="table-th text-right">Doanh thu hành lý</th>
                    <th className="table-th text-right">Số vé</th>
                    <th className="table-th text-right">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((r) => (
                    <tr key={r.maChuyenBay} className="border-t hover:bg-gray-50">
                      <td className="table-td font-medium">{r.maChuyenBayCode}</td>
                      <td className="table-td text-xs">{r.sanBayDi.split(' ')[0]}→{r.sanBayDen.split(' ')[0]}</td>
                      <td className="table-td text-xs">{formatDateTime(r.ngayGioBay)}</td>
                      <td className="table-td text-right">{formatCurrency(r.doanhThuVe)}</td>
                      <td className="table-td text-right">{formatCurrency(r.doanhThuHanhLy)}</td>
                      <td className="table-td text-right">{r.soVeBan}</td>
                      <td className="table-td text-right">{r.phanTramTrenTong.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {monthlyData.length === 0 && <EmptyState message="Không có dữ liệu báo cáo" />}
          </div>
        </>
      )}

      {/* Yearly report */}
      {tab === 'yearly' && !loadingYearly && (
        <>
          {yearlyData.length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-4">Doanh thu theo tháng</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={yearlyData.map((r) => ({ ...r, name: MONTH_NAMES[r.thang - 1] }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Doanh thu']} />
                  <Line type="monotone" dataKey="doanhThu" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Doanh thu" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th">Tháng</th>
                    <th className="table-th text-right">Số chuyến bay</th>
                    <th className="table-th text-right">Số vé bán</th>
                    <th className="table-th text-right">Doanh thu</th>
                    <th className="table-th text-right">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyData.map((r) => (
                    <tr key={r.thang} className="border-t hover:bg-gray-50">
                      <td className="table-td font-medium">Tháng {r.thang}</td>
                      <td className="table-td text-right">{r.soChuyenBay}</td>
                      <td className="table-td text-right">{r.soVe.toLocaleString('vi-VN')}</td>
                      <td className="table-td text-right font-medium">{formatCurrency(r.doanhThu)}</td>
                      <td className="table-td text-right">{r.phanTram.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {yearlyData.length === 0 && <EmptyState message="Không có dữ liệu báo cáo" />}
          </div>
        </>
      )}
    </div>
  )
}
