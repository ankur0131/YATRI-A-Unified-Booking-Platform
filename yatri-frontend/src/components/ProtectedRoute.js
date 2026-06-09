import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Check both AuthContext state and localStorage token
  const token = localStorage.getItem("token");
  const isTokenValid = token && token !== "" && token !== "undefined";

  if (!isAuthenticated || !isTokenValid || !user) {
    const target = `${location.pathname}${location.search}${location.hash}`;
    localStorage.setItem("yatri-post-login-path", target);

    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
