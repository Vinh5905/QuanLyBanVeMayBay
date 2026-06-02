import { useState, useEffect } from 'react'
import { ticketApi } from '../../../api/ticketApi'
import { flightApi } from '../../../api/flightApi'
import { getErrorMessage } from '../../../api/adapter'
import { StatCard } from './StatCard'
import { LoadingState } from '../../../components/LoadingState/LoadingState'
import { ErrorState } from '../../../components/ErrorState/ErrorState'
import { DataTable } from '../../../components/DataTable/DataTable'
import { EmptyState } from '../../../components/EmptyState/EmptyState'

export function AgentDashboard() {
  const [tickets, setTickets] = useState<any[]>([])
  const [flights, setFlights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [tRes, fRes] = await Promise.all([
          ticketApi.getMyTickets().catch(() => ({ data: [] })),
          flightApi.searchFlights({}).catch(() => ({ data: [] })),
        ])
        setTickets(tRes.data || [])
        setFlights(fRes.data || [])
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <LoadingState text="Đang tải..." />
  if (error) return <ErrorState message={error} />

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Đại lý</h1>
        <p className="dashboard-subtitle">Quản lý vé và tra cứu chuyến bay.</p>
      </div>

      <div className="stat-grid">
        <StatCard title="Vé đã bán" value={String(tickets.length)} icon="🎫" />
        <StatCard title="Chuyến bay có sẵn" value={String(flights.length)} icon="" />
      </div>

      <div className="dashboard-chart-container">
        <h3>Chuyến bay đang bán</h3>
        {flights.length === 0 ? (
          <EmptyState title="Không có chuyến bay" description="" />
        ) : (
          <DataTable
            columns={[
              { key: 'maChuyenBayCode', label: 'Mã CB' },
              { key: 'sanBayDi', label: 'Sân bay đi' },
              { key: 'sanBayDen', label: 'Sân bay đến' },
              { key: 'ngayGioBay', label: 'Giờ bay', render: (r: any) => r.ngayGioBay ? new Date(r.ngayGioBay).toLocaleString('vi-VN') : '' },
            ]}
            data={flights.slice(0, 10)}
          />
        )}
      </div>
    </div>
  )
}
