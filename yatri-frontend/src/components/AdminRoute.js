import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const isTokenValid = token && token !== "" && token !== "undefined";

  if (!isAuthenticated || !isTokenValid || !user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
