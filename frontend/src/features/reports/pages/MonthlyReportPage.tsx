import { useState, useEffect, useCallback } from 'react'
import { reportApi } from '../../../api/reportApi'
import { getErrorMessage } from '../../../api/adapter'
import { Button } from '../../../components/Button/Button'
import { FormField } from '../../../components/FormField/FormField'
import { DataTable } from '../../../components/DataTable/DataTable'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { MonthlyRevenueChart } from '../components/MonthlyRevenueChart'
import type { MonthlyReportRow } from '../../../types/report'

export function MonthlyReportPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear().toString())
  const [month, setMonth] = useState((now.getMonth() + 1).toString())
  const [rows, setRows] = useState<MonthlyReportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await reportApi.getMonthly({ year: Number(year), month: Number(month) })
      setRows(res.data || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải báo cáo'))
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { fetchReport() }, [fetchReport])

  const handleExport = async () => {
    try {
      const blob = await reportApi.exportExcel({ year: Number(year), month: Number(month) })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bao-cao-thang-${month}-${year}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Không thể xuất báo cáo')
    }
  }

  const totalRevenue = rows.reduce((s, r) => s + (r.doanhThuVe || 0) + (r.doanhThuHanhLy || 0), 0)
  const totalTickets = rows.reduce((s, r) => s + (r.soVeBan || 0), 0)

  return (
    <div className="report-page">
      <div className="page-header">
        <h1>Báo cáo doanh thu tháng</h1>
        <Button variant="secondary" onClick={handleExport}>Xuất Excel</Button>
      </div>

      <div className="filter-row">
        <FormField label="Năm">
          <input className="form-input" type="number" value={year} onChange={e => setYear(e.target.value)} />
        </FormField>
        <FormField label="Tháng">
          <input className="form-input" type="number" min={1} max={12} value={month} onChange={e => setMonth(e.target.value)} />
        </FormField>
        <Button variant="secondary" onClick={fetchReport} style={{ marginTop: 24 }}>Xem báo cáo</Button>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-label">Tổng doanh thu</div>
          <div className="summary-value">{(totalRevenue || 0).toLocaleString('vi-VN')}đ</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Tổng số vé</div>
          <div className="summary-value">{totalTickets}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Số chuyến bay</div>
          <div className="summary-value">{rows.length}</div>
        </div>
      </div>

      {rows.length > 0 && <MonthlyRevenueChart data={rows} />}

      {loading && <LoadingState text="Đang tải báo cáo..." />}
      {error && <ErrorState message={error} onRetry={fetchReport} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState title="Không có dữ liệu" description="Không có dữ liệu báo cáo cho tháng này" />
      )}
      {!loading && !error && rows.length > 0 && (
        <DataTable
          columns={[
            { key: 'maChuyenBayCode', label: 'Mã CB' },
            { key: 'sanBayDi', label: 'Sân bay đi' },
            { key: 'sanBayDen', label: 'Sân bay đến' },
            { key: 'soVeBan', label: 'Số vé' },
            { key: 'doanhThuVe', label: 'DT vé', render: (r: MonthlyReportRow) => `${(r.doanhThuVe || 0).toLocaleString('vi-VN')}đ` },
            { key: 'doanhThuHanhLy', label: 'DT hành lý', render: (r: MonthlyReportRow) => `${(r.doanhThuHanhLy || 0).toLocaleString('vi-VN')}đ` },
            { key: 'phanTramTrenTong', label: '%', render: (r: MonthlyReportRow) => `${(r.phanTramTrenTong || 0).toFixed(1)}%` },
          ]}
          data={rows}
        />
      )}
    </div>
  )
}
