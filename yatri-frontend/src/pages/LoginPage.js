import { motion } from "framer-motion";
import { ArrowRight, LockKeyhole, Mail, UserCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";

const sideNote = [
  { value: "Secure", label: "protected booking routes" },
  { value: "Smooth", label: "post-login redirect flow" },
  { value: "Persisted", label: "auth across refresh" },
];

function isValidEmail(value) {
  return /\S+@\S+\.\S+/.test(value);
}

function LoginPage({ theme, onToggleTheme, pushToast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLight = theme === "light";

  const redirectPath = useMemo(() => {
    const statePath = location.state?.from?.pathname;
    const storedPath = localStorage.getItem("yatri-post-login-path");
    return statePath || storedPath || "/";
  }, [location.state]);

  const handleLogin = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!isValidEmail(email.trim())) nextErrors.email = "Enter a valid email";
    if (!password.trim()) nextErrors.password = "Password is required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setErrors({ general: "Invalid credentials" });
        } else if (res.status === 404) {
          setErrors({ email: "User not found" });
        } else {
          setErrors({ general: data.message || "Login failed" });
        }
        pushToast({
          type: "error",
          title: "Login failed",
          message: data.message || "Invalid credentials",
        });
        return;
      }

      // Store token and user data
      localStorage.setItem("token", data.token || "");
      
      login({
        name: data.user.name,
        email: data.user.email,
        id: data.user.id || data.user._id,
        role: data.user.role || "user",
      });

      localStorage.removeItem("yatri-post-login-path");
      pushToast({
        type: "success",
        title: "Login Successful",
        message: "Welcome back to YATRI.",
      });
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrors({ general: "Backend server not reachable" });
      pushToast({
        type: "error",
        title: "Connection error",
        message: "Backend server not reachable",
      });
    } finally {
      setLoading(false);
    }
  };

  const continueAsGuest = () => {
    localStorage.removeItem("yatri-post-login-path");
    navigate("/", { replace: true });
  };

  return (
    <AuthShell
      theme={theme}
      onToggleTheme={onToggleTheme}
      eyebrow="Secure login"
      title="Login before you book."
      subtitle="A real-world booking flow with protected routes, persisted sessions, saffron highlights, and smooth return-to-booking behavior."
      sideNote={sideNote}
      footer={
        <div className="space-y-2">
          <p className={`text-center text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
            New to YATRI?{" "}
            <Link to="/register" className="font-semibold text-[#E65100]">
              Create an account
            </Link>
          </p>
          <p className={`text-center text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
            Protected routes cover bus, train, cab, seat selection, and checkout.
          </p>
          <p className={`text-center text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
            Admin?{" "}
            <Link to="/admin/login" className="font-semibold text-[#E65100]">
              Login here
            </Link>
          </p>
        </div>
      }
    >
      <div>
        <div className="mb-6">
          <p className={`text-sm uppercase tracking-[0.28em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
            Login
          </p>
          <h2 className={`mt-3 font-display text-3xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
            Continue your booking securely
          </h2>
          <p className={`mt-2 text-sm leading-6 ${isLight ? "text-neutral-600" : "text-white/60"}`}>
            Sign in to unlock booking routes. If you were trying to continue to a specific transport page, we will take you back there automatically.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block">
            <span className={`mb-2 block text-sm font-medium ${isLight ? "text-neutral-700" : "text-white/80"}`}>
              Email
            </span>
            <div
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                isLight
                  ? "border-neutral-900/10 bg-white/80 focus-within:glow-ring"
                  : "border-white/10 bg-white/6 focus-within:glow-ring"
              }`}
            >
              <Mail className="h-4 w-4 text-[#FF9933]" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`w-full bg-transparent text-sm outline-none placeholder:text-current/40 ${
                  isLight ? "text-neutral-900" : "text-white"
                }`}
              />
            </div>
            {errors.email ? <p className="mt-2 text-sm text-rose-300">{errors.email}</p> : null}
          </label>

          <label className="block">
            <span className={`mb-2 block text-sm font-medium ${isLight ? "text-neutral-700" : "text-white/80"}`}>
              Password
            </span>
            <div
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                isLight
                  ? "border-neutral-900/10 bg-white/80 focus-within:glow-ring"
                  : "border-white/10 bg-white/6 focus-within:glow-ring"
              }`}
            >
              <LockKeyhole className="h-4 w-4 text-[#FF9933]" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`w-full bg-transparent text-sm outline-none placeholder:text-current/40 ${
                  isLight ? "text-neutral-900" : "text-white"
                }`}
              />
            </div>
            {errors.password ? <p className="mt-2 text-sm text-rose-300">{errors.password}</p> : null}
          </label>

          <motion.button
            whileTap={{ scale: 0.985 }}
            whileHover={{ scale: 1.01 }}
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl saffron-gradient px-4 py-3 text-sm font-semibold text-neutral-950 soft-shadow disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </form>

        {errors.general ? (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3">
            <p className="text-sm text-rose-200">{errors.general}</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={continueAsGuest}
            className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              isLight
                ? "border-neutral-900/10 bg-white/75 text-neutral-700 hover:border-[#FF9933]/25"
                : "border-white/10 bg-white/5 text-white/75 hover:border-[#FF9933]/25"
            }`}
          >
            Continue as Guest
          </button>
          <Link
            to="/"
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              isLight
                ? "border-neutral-900/10 bg-white/75 text-neutral-700 hover:border-[#FF9933]/25"
                : "border-white/10 bg-white/5 text-white/75 hover:border-[#FF9933]/25"
            }`}
          >
            <UserCircle2 className="h-4 w-4 text-[#FF9933]" />
            Back to Home
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export default LoginPage;
