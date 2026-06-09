import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";

const sideNote = [
  { value: "Fast", label: "account setup flow" },
  { value: "Clean", label: "glassmorphism UI layer" },
  { value: "Ready", label: "dashboard after signup" },
];

function Register({ theme, onToggleTheme, pushToast }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isLight = theme === "light";

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.message || "Registration failed";
        setStatus({ type: "error", text: message });
        pushToast({
          type: "error",
          title: "Signup failed",
          message,
        });
        return;
      }

      const message = "Account created. Please login.";
      setStatus({ type: "success", text: message });
      pushToast({
        type: "success",
        title: "Account created",
        message: "Your new workspace is ready.",
      });
      setTimeout(() => navigate("/"), 900);
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
      eyebrow="Create account"
      title="Start with a cleaner travel workflow."
      subtitle="Join YATRI and enter a dashboard designed around clarity, speed, and a saffron-led premium visual identity."
      sideNote={sideNote}
      footer={
        <p className={`text-center text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#E65100]">
            Sign in
          </Link>
        </p>
      }
    >
      <div>
        <div className="mb-6">
          <p className={`text-sm uppercase tracking-[0.28em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
            Register
          </p>
          <h2 className={`mt-3 font-display text-3xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
            Create your account
          </h2>
          <p className={`mt-2 text-sm leading-6 ${isLight ? "text-neutral-600" : "text-white/60"}`}>
            Build a premium booking experience from the very first interaction.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {[
            { id: "name", label: "Full name", icon: UserRound, value: name, setValue: setName, type: "text", placeholder: "Your full name" },
            { id: "email", label: "Email", icon: Mail, value: email, setValue: setEmail, type: "email", placeholder: "you@example.com" },
            { id: "password", label: "Password", icon: LockKeyhole, value: password, setValue: setPassword, type: "password", placeholder: "Create password" },
          ].map((field) => (
            <label className="block" key={field.id}>
              <span className={`mb-2 block text-sm font-medium ${isLight ? "text-neutral-700" : "text-white/80"}`}>
                {field.label}
              </span>
              <div
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                  isLight
                    ? "border-neutral-900/10 bg-white/80 focus-within:glow-ring"
                    : "border-white/10 bg-white/6 focus-within:glow-ring"
                }`}
              >
                <field.icon className="h-4 w-4 text-[#FF9933]" />
                <input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(event) => field.setValue(event.target.value)}
                  required
                  className={`w-full bg-transparent text-sm outline-none placeholder:text-current/40 ${
                    isLight ? "text-neutral-900" : "text-white"
                  }`}
                />
              </div>
            </label>
          ))}

          <motion.button
            whileTap={{ scale: 0.985 }}
            whileHover={{ scale: 1.01 }}
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl saffron-gradient px-4 py-3 text-sm font-semibold text-neutral-950 soft-shadow disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Register"}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </form>

        <div className={`mt-5 rounded-2xl border p-4 ${isLight ? "border-neutral-900/8 bg-white/75" : "border-white/10 bg-white/5"}`}>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[#FF9933]/12 p-2.5 text-[#FF9933]">
              <BadgeCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className={`text-sm font-medium ${isLight ? "text-neutral-900" : "text-white"}`}>Design principle</p>
              <p className={`mt-1 text-xs leading-5 ${isLight ? "text-neutral-600" : "text-white/55"}`}>
                Bright accent, dark restraint, soft shadows, and plenty of breathing room.
              </p>
            </div>
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

export default Register;
