import { motion } from "framer-motion";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";

const sideNote = [
  { value: "24/7", label: "premium search availability" },
  { value: "Smart", label: "route recommendations" },
  { value: "Secure", label: "token-based access flow" },
];

function Login({ theme, onToggleTheme, pushToast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isLight = theme === "light";

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", text: "" });

    // Validate fields
    if (!email.trim()) {
      setStatus({ type: "error", text: "Please fill all fields" });
      pushToast({
        type: "error",
        title: "Validation error",
        message: "Email is required",
      });
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setStatus({ type: "error", text: "Please fill all fields" });
      pushToast({
        type: "error",
        title: "Validation error",
        message: "Password is required",
      });
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email.trim())) {
      setStatus({ type: "error", text: "Please enter a valid email" });
      pushToast({
        type: "error",
        title: "Validation error",
        message: "Please enter a valid email",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        let message = "Login failed";
        if (res.status === 401) {
          message = "Invalid credentials";
        } else if (res.status === 404) {
          message = "User not found";
        } else if (data.message) {
          message = data.message;
        }
        
        setStatus({ type: "error", text: message });
        pushToast({
          type: "error",
          title: "Login failed",
          message,
        });
        return;
      }

      localStorage.setItem("token", data.token || "");
      setStatus({ type: "success", text: "Login successful. Redirecting to dashboard..." });
      pushToast({
        type: "success",
        title: "Welcome back",
        message: "Your dashboard is ready.",
      });
      navigate("/booking");
    } catch (error) {
      const message = "Backend server not reachable";
      setStatus({ type: "error", text: message });
      pushToast({
        type: "error",
        title: "Connection error",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      theme={theme}
      onToggleTheme={onToggleTheme}
      eyebrow="Premium access"
      title="Sign in to your saffron workspace."
      subtitle="A modern travel dashboard for discovering routes, comparing options, and managing bookings with calm, premium clarity."
      sideNote={sideNote}
      footer={
        <p className={`text-center text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
          New to YATRI?{" "}
          <Link to="/register" className="font-semibold text-[#E65100]">
            Create an account
          </Link>
        </p>
      }
    >
      <div>
        <div className="mb-6">
          <p className={`text-sm uppercase tracking-[0.28em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
            Login
          </p>
          <h2 className={`mt-3 font-display text-3xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
            Premium Travel Booking
          </h2>
          <p className={`mt-2 text-sm leading-6 ${isLight ? "text-neutral-600" : "text-white/60"}`}>
            Minimal, secure, and crafted with a saffron identity that feels elevated rather than loud.
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
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={`w-full bg-transparent text-sm outline-none placeholder:text-current/40 ${
                  isLight ? "text-neutral-900" : "text-white"
                }`}
              />
            </div>
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
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className={`w-full bg-transparent text-sm outline-none placeholder:text-current/40 ${
                  isLight ? "text-neutral-900" : "text-white"
                }`}
              />
            </div>
          </label>

          <motion.button
            whileTap={{ scale: 0.985 }}
            whileHover={{ scale: 1.01 }}
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl saffron-gradient px-4 py-3 text-sm font-semibold text-neutral-950 soft-shadow disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Login"}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </form>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className={`rounded-2xl border p-4 ${isLight ? "border-neutral-900/8 bg-white/75" : "border-white/10 bg-white/5"}`}>
            <ShieldCheck className="h-5 w-5 text-[#FF9933]" />
            <p className={`mt-3 text-sm font-medium ${isLight ? "text-neutral-900" : "text-white"}`}>Protected sessions</p>
            <p className={`mt-1 text-xs leading-5 ${isLight ? "text-neutral-600" : "text-white/55"}`}>
              Authentication keeps your booking flow secure without adding visual clutter.
            </p>
          </div>
          <div className={`rounded-2xl border p-4 ${isLight ? "border-neutral-900/8 bg-white/75" : "border-white/10 bg-white/5"}`}>
            <p className={`text-xs uppercase tracking-[0.26em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>Accent principle</p>
            <p className={`mt-3 text-sm leading-6 ${isLight ? "text-neutral-700" : "text-white/60"}`}>
              Saffron is reserved for focus points, actions, and meaningful highlights.
            </p>
          </div>
        </div>

        {status.text ? (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
              status.type === "error"
                ? "border-rose-400/20 bg-rose-500/10 text-rose-200"
                : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {status.text}
          </div>
        ) : null}
      </div>
    </AuthShell>
  );
}

export default Login;
