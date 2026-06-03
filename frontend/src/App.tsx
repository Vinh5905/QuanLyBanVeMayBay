import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ConfigProvider } from './contexts/ConfigContext'
import { ToastProvider } from './components/ui/Toast'
import AuthLayout from './layouts/AuthLayout'
import MainLayout from './layouts/MainLayout'
import RequireAuth from './layouts/RequireAuth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import FlightsPage from './pages/FlightsPage'
import FlightSearchPage from './pages/FlightSearchPage'
import TicketsPage from './pages/TicketsPage'
import TicketDetailPage from './pages/TicketDetailPage'
import SellTicketPage from './pages/SellTicketPage'
import BookTicketPage from './pages/BookTicketPage'
import PaymentsPage from './pages/PaymentsPage'
import BaggagePage from './pages/BaggagePage'
import CheckInPage from './pages/CheckInPage'
import ReportsPage from './pages/ReportsPage'
import CustomersPage from './pages/CustomersPage'
import AccountsPage from './pages/AccountsPage'
import ConfigPage from './pages/ConfigPage'
import ProfilePage from './pages/ProfilePage'
import FlightDetailPage from './pages/FlightDetailPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <ConfigProvider>
            <BrowserRouter>
              <Routes>
                {/* Public auth routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Protected app routes */}
                <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
                  <Route path="/" element={<RequireAuth roles={['Admin', 'NhanVien']}><DashboardPage /></RequireAuth>} />
                  <Route path="/flights" element={<FlightsPage />} />
                  <Route path="/flights/search" element={<RequireAuth roles={['KhachHang', 'NhanVien']}><FlightSearchPage /></RequireAuth>} />
                  <Route path="/flights/:id" element={<FlightDetailPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/tickets" element={<TicketsPage />} />
                  <Route path="/tickets/:id" element={<TicketDetailPage />} />
                  <Route path="/tickets/sell" element={<RequireAuth roles={['NhanVien', 'DaiLy']}><SellTicketPage /></RequireAuth>} />
                  <Route path="/tickets/book" element={<RequireAuth roles={['KhachHang', 'NhanVien', 'DaiLy']}><BookTicketPage /></RequireAuth>} />
                  <Route path="/payments" element={<PaymentsPage />} />
                  <Route path="/baggage" element={<BaggagePage />} />
                  <Route path="/checkin" element={<CheckInPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/accounts" element={<RequireAuth roles={['Admin']}><AccountsPage /></RequireAuth>} />
                  <Route path="/config" element={<RequireAuth roles={['Admin', 'NhanVien']}><ConfigPage /></RequireAuth>} />
                  <Route path="/profile" element={<RequireAuth roles={['KhachHang']}><ProfilePage /></RequireAuth>} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ConfigProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
