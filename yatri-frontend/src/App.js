import { lazy, Suspense, useCallback, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import ToastViewport from "./components/ToastViewport";
import useTheme from "./hooks/useTheme";
import "./styles.css";
import LoginPage from "./pages/LoginPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ListingPage from "./pages/ListingPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import TransportDetailsPage from "./pages/TransportDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import SuccessPage from "./pages/SuccessPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

const HomePage = lazy(() => import("./pages/HomePage"));

function RouteLoader({ theme }) {
  const isLight = theme === "light";
  return (
    <div className="min-h-screen px-4 py-6">
      <div className={`mx-auto max-w-7xl rounded-[32px] border p-6 ${isLight ? "border-neutral-900/8 bg-white/80" : "border-white/10 bg-white/5"}`}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={`skeleton-shimmer min-h-[220px] rounded-[28px] border ${
                isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, type: "info", ...toast }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const sharedProps = {
    theme,
    onToggleTheme: toggleTheme,
    pushToast,
  };

  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <ToastViewport toasts={toasts} removeToast={removeToast} theme={theme} />
          <Suspense fallback={<RouteLoader theme={theme} />}>
            <Routes>
              <Route path="/" element={<HomePage {...sharedProps} />} />
              <Route path="/login" element={<LoginPage {...sharedProps} />} />
              <Route path="/admin/login" element={<AdminLoginPage {...sharedProps} />} />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboardPage {...sharedProps} />
                  </AdminRoute>
                }
              />
              <Route path="/auth" element={<Login {...sharedProps} />} />
              <Route path="/register" element={<Register {...sharedProps} />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage {...sharedProps} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage {...sharedProps} />
                  </ProtectedRoute>
                }
              />
              <Route path="/success" element={<SuccessPage {...sharedProps} />} />
              <Route
                path="/:type"
                element={
                  <ProtectedRoute>
                    <ListingPage {...sharedProps} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:type/:id/details"
                element={
                  <ProtectedRoute>
                    <TransportDetailsPage {...sharedProps} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:type/:id/seats"
                element={
                  <ProtectedRoute>
                    <SeatSelectionPage {...sharedProps} />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
