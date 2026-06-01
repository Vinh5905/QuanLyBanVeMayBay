import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import HealthPage from "../pages/HealthPage";
import ComponentsDemo from "../pages/ComponentsDemo";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/health", element: <HealthPage /> },
  { path: "/demo", element: <ComponentsDemo /> },
]);