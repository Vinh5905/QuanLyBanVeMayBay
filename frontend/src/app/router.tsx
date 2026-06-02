import { createBrowserRouter } from "react-router-dom";
import HealthPage from "../pages/HealthPage";
import ComponentsDemo from "../pages/ComponentsDemo";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AppLayout } from "../components/AppLayout/AppLayout";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { FlightListPage } from "../features/flights/pages/FlightListPage";
import { FlightDetailPage } from "../features/flights/pages/FlightDetailPage";
import { FlightFormPage } from "../features/flights/pages/FlightFormPage";
import { FlightSearchPage } from "../features/flights/pages/FlightSearchPage";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const PlaceholderPage = ({ title }: { title: string }) => (
  <div style={{ padding: 40, textAlign: 'center' }}>
    <h2>{title}</h2>
    <p style={{ color: '#64748B', marginTop: 8 }}>Tính năng đang được phát triển.</p>
  </div>
);

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/", element: <ProtectedLayout><DashboardPage /></ProtectedLayout> },
  { path: "/admin", element: <ProtectedLayout><DashboardPage /></ProtectedLayout> },
  { path: "/staff", element: <ProtectedLayout><DashboardPage /></ProtectedLayout> },
  { path: "/agent", element: <ProtectedLayout><DashboardPage /></ProtectedLayout> },
  { path: "/flights/search", element: <FlightSearchPage /> },
  { path: "/admin/flights", element: <ProtectedLayout><FlightListPage /></ProtectedLayout> },
  { path: "/admin/flights/new", element: <ProtectedLayout><FlightFormPage /></ProtectedLayout> },
  { path: "/admin/flights/:id", element: <ProtectedLayout><FlightDetailPage /></ProtectedLayout> },
  { path: "/admin/flights/:id/edit", element: <ProtectedLayout><FlightFormPage /></ProtectedLayout> },
  { path: "/staff/flights", element: <ProtectedLayout><FlightListPage /></ProtectedLayout> },
  { path: "/staff/flights/new", element: <ProtectedLayout><FlightFormPage /></ProtectedLayout> },
  { path: "/staff/flights/:id", element: <ProtectedLayout><FlightDetailPage /></ProtectedLayout> },
  { path: "/staff/flights/:id/edit", element: <ProtectedLayout><FlightFormPage /></ProtectedLayout> },
  { path: "/agent/search", element: <ProtectedLayout><FlightSearchPage /></ProtectedLayout> },
  { path: "/admin/users", element: <ProtectedLayout><PlaceholderPage title="Quản lý người dùng" /></ProtectedLayout> },
  { path: "/admin/reports", element: <ProtectedLayout><PlaceholderPage title="Báo cáo doanh thu" /></ProtectedLayout> },
  { path: "/admin/settings", element: <ProtectedLayout><PlaceholderPage title="Cài đặt" /></ProtectedLayout> },
  { path: "/staff/tickets", element: <ProtectedLayout><PlaceholderPage title="Quản lý vé" /></ProtectedLayout> },
  { path: "/staff/pos", element: <ProtectedLayout><PlaceholderPage title="Bán vé tại quầy" /></ProtectedLayout> },
  { path: "/staff/baggage", element: <ProtectedLayout><PlaceholderPage title="Quản lý hành lý" /></ProtectedLayout> },
  { path: "/agent/bookings", element: <ProtectedLayout><PlaceholderPage title="Đặt chỗ của tôi" /></ProtectedLayout> },
  { path: "/bookings", element: <ProtectedLayout><PlaceholderPage title="Đặt chỗ của tôi" /></ProtectedLayout> },
  { path: "/check-in", element: <ProtectedLayout><PlaceholderPage title="Check-in trực tuyến" /></ProtectedLayout> },
  { path: "/health", element: <HealthPage /> },
  { path: "/demo", element: <ComponentsDemo /> },
]);