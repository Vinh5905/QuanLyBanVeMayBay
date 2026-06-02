import { useState, useEffect, useCallback } from 'react'
import { reportApi } from '../../../api/reportApi'
import { getErrorMessage } from '../../../api/adapter'
import { Button } from '../../../components/Button/Button'
import { FormField } from '../../../components/FormField/FormField'
import { DataTable } from '../../../components/DataTable/DataTable'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { YearlyRevenueChart } from '../components/YearlyRevenueChart'
import type { YearlyReportRow } from '../../../types/report'

export function YearlyReportPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear().toString())
  const [rows, setRows] = useState<YearlyReportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await reportApi.getYearly({ year: Number(year) })
      setRows(res.data || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải báo cáo'))
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => { fetchReport() }, [fetchReport])

  const handleExport = async () => {
    try {
      const blob = await reportApi.exportExcel({ year: Number(year) })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bao-cao-nam-${year}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Không thể xuất báo cáo')
    }
  }

  const totalRevenue = rows.reduce((s, r) => s + (r.doanhThu || 0), 0)
  const totalTickets = rows.reduce((s, r) => s + (r.soVe || 0), 0)

  return (
    <div className="report-page">
      <div className="page-header">
        <h1>Báo cáo doanh thu năm</h1>
        <Button variant="secondary" onClick={handleExport}>Xuất Excel</Button>
      </div>

      <div className="filter-row">
        <FormField label="Năm">
          <input className="form-input" type="number" value={year} onChange={e => setYear(e.target.value)} />
        </FormField>
        <Button variant="secondary" onClick={fetchReport} style={{ marginTop: 24 }}>Xem báo cáo</Button>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-label">Tổng doanh thu năm</div>
          <div className="summary-value">{(totalRevenue || 0).toLocaleString('vi-VN')}đ</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Tổng số vé</div>
          <div className="summary-value">{totalTickets}</div>
        </div>
      </div>

      {rows.length > 0 && <YearlyRevenueChart data={rows} />}

      {loading && <LoadingState text="Đang tải báo cáo..." />}
      {error && <ErrorState message={error} onRetry={fetchReport} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState title="Không có dữ liệu" description="Không có dữ liệu báo cáo cho năm này" />
      )}
      {!loading && !error && rows.length > 0 && (
        <DataTable
          columns={[
            { key: 'thang', label: 'Tháng', render: (r: YearlyReportRow) => `Tháng ${r.thang}` },
            { key: 'soChuyenBay', label: 'Số chuyến bay' },
            { key: 'soVe', label: 'Số vé' },
            { key: 'doanhThu', label: 'Doanh thu', render: (r: YearlyReportRow) => `${(r.doanhThu || 0).toLocaleString('vi-VN')}đ` },
            { key: 'phanTram', label: '%', render: (r: YearlyReportRow) => `${(r.phanTram || 0).toFixed(1)}%` },
          ]}
          data={rows}
        />
      )}
    </div>
  )
}
