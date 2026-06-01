import { createBrowserRouter } from "react-router-dom";
import HealthPage from "../pages/HealthPage";
import ComponentsDemo from "../pages/ComponentsDemo";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AppLayout } from "../components/AppLayout/AppLayout";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/", element: <ProtectedLayout><DashboardPage /></ProtectedLayout> },
  { path: "/admin", element: <ProtectedLayout><DashboardPage /></ProtectedLayout> },
  { path: "/staff", element: <ProtectedLayout><DashboardPage /></ProtectedLayout> },
  { path: "/agent", element: <ProtectedLayout><DashboardPage /></ProtectedLayout> },
  { path: "/health", element: <HealthPage /> },
  { path: "/demo", element: <ComponentsDemo /> },
]);