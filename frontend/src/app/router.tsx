import { createBrowserRouter } from "react-router-dom";
import HealthPage from "../pages/HealthPage";
import ComponentsDemo from "../pages/ComponentsDemo";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleRoute } from "./routes/RoleRoute";
import { AppLayout } from "../components/AppLayout/AppLayout";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { FlightListPage } from "../features/flights/pages/FlightListPage";
import { FlightDetailPage } from "../features/flights/pages/FlightDetailPage";
import { FlightFormPage } from "../features/flights/pages/FlightFormPage";
import { FlightSearchPage } from "../features/flights/pages/FlightSearchPage";
import { TicketSellPage } from "../features/tickets/pages/TicketSellPage";
import { TicketListPage } from "../features/tickets/pages/TicketListPage";
import { TicketDetailPage } from "../features/tickets/pages/TicketDetailPage";
import { BookingPage } from "../features/tickets/pages/BookingPage";
import { BaggagePage } from "../features/baggage/pages/BaggagePage";
import { CheckInPage } from "../features/checkin/pages/CheckInPage";
import { PaymentListPage } from "../features/payments/pages/PaymentListPage";
import { CreatePaymentPage } from "../features/payments/pages/CreatePaymentPage";
import { MonthlyReportPage } from "../features/reports/pages/MonthlyReportPage";
import { YearlyReportPage } from "../features/reports/pages/YearlyReportPage";
import { AccountListPage } from "../features/accounts/pages/AccountListPage";
import { ConfigPage } from "../features/config/pages/ConfigPage";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const RoleProtected = ({ roles, children }: { roles: string[]; children: React.ReactNode }) => (
  <ProtectedRoute>
    <RoleRoute allowedRoles={roles}>
      <AppLayout>{children}</AppLayout>
    </RoleRoute>
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/", element: <ProtectedLayout><DashboardPage /></ProtectedLayout> },
  { path: "/admin", element: <ProtectedLayout><DashboardPage /></ProtectedLayout> },
  { path: "/staff", element: <ProtectedLayout><DashboardPage /></ProtectedLayout> },
  { path: "/agent", element: <ProtectedLayout><DashboardPage /></ProtectedLayout> },
  { path: "/flights/search", element: <ProtectedLayout><FlightSearchPage /></ProtectedLayout> },
  { path: "/admin/flights", element: <ProtectedLayout><FlightListPage /></ProtectedLayout> },
  { path: "/admin/flights/new", element: <ProtectedLayout><FlightFormPage /></ProtectedLayout> },
  { path: "/admin/flights/:id", element: <ProtectedLayout><FlightDetailPage /></ProtectedLayout> },
  { path: "/admin/flights/:id/edit", element: <ProtectedLayout><FlightFormPage /></ProtectedLayout> },
  { path: "/staff/flights", element: <ProtectedLayout><FlightListPage /></ProtectedLayout> },
  { path: "/staff/flights/new", element: <ProtectedLayout><FlightFormPage /></ProtectedLayout> },
  { path: "/staff/flights/:id", element: <ProtectedLayout><FlightDetailPage /></ProtectedLayout> },
  { path: "/staff/flights/:id/edit", element: <ProtectedLayout><FlightFormPage /></ProtectedLayout> },
  { path: "/agent/search", element: <ProtectedLayout><FlightSearchPage /></ProtectedLayout> },
  { path: "/admin/users", element: <RoleProtected roles={['Admin']}><AccountListPage /></RoleProtected> },
  { path: "/admin/reports", element: <RoleProtected roles={['Admin', 'NhanVien']}><MonthlyReportPage /></RoleProtected> },
  { path: "/admin/reports/yearly", element: <RoleProtected roles={['Admin', 'NhanVien']}><YearlyReportPage /></RoleProtected> },
  { path: "/admin/settings", element: <RoleProtected roles={['Admin', 'NhanVien']}><ConfigPage /></RoleProtected> },
  { path: "/admin/payments", element: <RoleProtected roles={['Admin', 'NhanVien']}><PaymentListPage /></RoleProtected> },
  { path: "/admin/payments/new", element: <RoleProtected roles={['Admin', 'NhanVien']}><CreatePaymentPage /></RoleProtected> },
  { path: "/staff/tickets", element: <ProtectedLayout><TicketListPage /></ProtectedLayout> },
  { path: "/staff/tickets/:id", element: <ProtectedLayout><TicketDetailPage /></ProtectedLayout> },
  { path: "/staff/pos", element: <ProtectedLayout><TicketSellPage /></ProtectedLayout> },
  { path: "/staff/baggage", element: <ProtectedLayout><BaggagePage /></ProtectedLayout> },
  { path: "/agent/bookings", element: <ProtectedLayout><BookingPage /></ProtectedLayout> },
  { path: "/bookings", element: <ProtectedLayout><BookingPage /></ProtectedLayout> },
  { path: "/check-in", element: <ProtectedLayout><CheckInPage /></ProtectedLayout> },
  { path: "/403", element: (
    <div style={{ padding: 80, textAlign: 'center' }}>
      <h1 style={{ fontSize: 64, color: '#DC2626', marginBottom: 16 }}>403</h1>
      <h2>Không có quyền truy cập</h2>
      <p style={{ color: '#64748B', marginTop: 8 }}>Bạn không có quyền truy cập trang này.</p>
    </div>
  )},
  { path: "/health", element: <HealthPage /> },
  { path: "/demo", element: <ComponentsDemo /> },
]);