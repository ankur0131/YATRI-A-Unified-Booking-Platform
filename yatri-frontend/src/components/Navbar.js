import { motion } from "framer-motion";
import {
  ChevronDown,
  LogOut,
  MoonStar,
  SunMedium,
  Ticket,
  TrainFront,
  UserCircle2,
  Calendar,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar({ theme, onToggleTheme }) {
  const isLight = theme === "light";
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();
  const location = useLocation();

  const initials = useMemo(() => {
    if (!user?.name) return "Y";
    return user.name
      .split(" ")
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [user?.name]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/", { replace: true });
  };

  const handleLogin = () => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    if (currentPath !== "/login") {
      localStorage.setItem("yatri-post-login-path", currentPath);
    }
    navigate("/login");
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-xl ${
        isLight ? "border-neutral-900/8 bg-white/72" : "border-white/10 bg-black/30"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl saffron-gradient font-display text-base font-semibold text-neutral-950">
            Y
          </div>
          <div>
            <p className={`font-display text-lg font-semibold tracking-[0.28em] ${isLight ? "text-neutral-900" : "text-white"}`}>
              YATRI
            </p>
            <p className={`text-xs ${isLight ? "text-neutral-500" : "text-white/50"}`}>Multi-transport booking</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {[
            { to: "/", label: "Home", icon: TrainFront },
            { to: "/bus", label: "Bus", icon: Ticket },
            { to: "/train", label: "Train", icon: Ticket },
            { to: "/cab", label: "Cab", icon: Ticket },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-full px-4 py-2 text-sm transition ${
                isLight ? "text-neutral-700 hover:bg-neutral-900/6" : "text-white/70 hover:bg-white/8"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-2 transition ${
                  isLight
                    ? "border-neutral-900/10 bg-white/85 text-neutral-700 hover:bg-white"
                    : "border-white/10 bg-white/8 text-white/80 hover:bg-white/12"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl saffron-gradient text-sm font-semibold text-neutral-950">
                  {initials}
                </div>
                <div className="hidden text-left sm:block">
                  <p className={`text-sm font-medium ${isLight ? "text-neutral-900" : "text-white"}`}>
                    {user?.name || "Traveler"}
                  </p>
                  <p className={`text-xs ${isLight ? "text-neutral-500" : "text-white/45"}`}>
                    {user?.email || "Signed in"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>

              {menuOpen ? (
                <div
                  className={`absolute right-0 top-[calc(100%+0.75rem)] w-56 rounded-[24px] border p-2 shadow-xl ${
                    isLight ? "glass-card-light text-neutral-900" : "glass-card text-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(isAdmin ? "/admin/dashboard" : "/");
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                      isLight ? "hover:bg-neutral-900/6" : "hover:bg-white/8"
                    }`}
                  >
                    <UserCircle2 className="h-4 w-4 text-[#FF9933]" />
                    <div className="text-left">
                      <p className="font-medium">Profile</p>
                      <p className={`text-xs ${isLight ? "text-neutral-500" : "text-white/45"}`}>
                        {user?.email || "Signed in user"}
                      </p>
                    </div>
                  </button>
                  {!isAdmin ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/my-bookings");
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                        isLight ? "hover:bg-neutral-900/6" : "hover:bg-white/8"
                      }`}
                    >
                      <Calendar className="h-4 w-4 text-[#FF9933]" />
                      My Bookings
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                      isLight ? "hover:bg-neutral-900/6" : "hover:bg-white/8"
                    }`}
                  >
                    <LogOut className="h-4 w-4 text-[#FF9933]" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.01 }}
              type="button"
              onClick={handleLogin}
              className="rounded-2xl saffron-gradient px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-[0_12px_32px_rgba(255,153,51,0.22)]"
            >
              Login
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onToggleTheme}
            className={`rounded-2xl border p-3 transition ${
              isLight
                ? "border-neutral-900/10 bg-white/85 text-neutral-700 hover:bg-white"
                : "border-white/10 bg-white/8 text-white/80 hover:bg-white/12"
            }`}
            aria-label="Toggle theme"
          >
            {isLight ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
          </motion.button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
