import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";

function AdminLoginPage({ theme, onToggleTheme, pushToast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLight = theme === "light";

  const redirectPath = useMemo(() => location.state?.from?.pathname || "/admin/dashboard", [location.state]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Admin login failed");
        return;
      }

      localStorage.setItem("token", data.token || "");
      login({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      });
      pushToast({
        type: "success",
        title: "Admin login successful",
        message: "Welcome to the admin panel.",
      });
      navigate(redirectPath, { replace: true });
    } catch (e) {
      setError("Backend server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      theme={theme}
      onToggleTheme={onToggleTheme}
      eyebrow="Admin access"
      title="Admin Login"
      subtitle="Manage routes, timings, transport inventory, and user bookings."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className={`mb-2 block text-sm font-medium ${isLight ? "text-neutral-700" : "text-white/80"}`}>Admin Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isLight ? "border-neutral-900/10 bg-white" : "border-white/10 bg-white/6 text-white"}`}
            placeholder="admin@yatri.com"
          />
        </label>
        <label className="block">
          <span className={`mb-2 block text-sm font-medium ${isLight ? "text-neutral-700" : "text-white/80"}`}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${isLight ? "border-neutral-900/10 bg-white" : "border-white/10 bg-white/6 text-white"}`}
            placeholder="Enter admin password"
          />
        </label>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl saffron-gradient px-4 py-3 text-sm font-semibold text-neutral-950 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login as Admin"}
        </button>
        <p className={`text-center text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
          Back to user login? <Link to="/login" className="font-semibold text-[#E65100]">User Login</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default AdminLoginPage;
