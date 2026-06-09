import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  LogOut,
  MoonStar,
  Search,
  Sparkles,
  SunMedium,
  ChevronDown,
} from "lucide-react";

function SidebarItem({ item, isActive, theme }) {
  return (
    <a
      href={item.href}
      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
        isActive
          ? "bg-gradient-to-r from-[#FF9933]/20 via-[#E65100]/10 to-transparent text-[#FFCC80]"
          : theme === "light"
            ? "text-neutral-600 hover:bg-neutral-900/5 hover:text-neutral-900"
            : "text-white/68 hover:bg-white/6 hover:text-white"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
          isActive
            ? "saffron-gradient text-neutral-950 shadow-[0_10px_30px_rgba(255,153,51,0.24)]"
            : theme === "light"
              ? "bg-neutral-900/6 text-neutral-700"
              : "bg-white/8 text-white/80"
        }`}
      >
        <item.icon className="h-4.5 w-4.5" />
      </span>
      <div className="flex-1">
        <p>{item.label}</p>
        <p className={`text-xs ${theme === "light" ? "text-neutral-500" : "text-white/45"}`}>
          {item.helper}
        </p>
      </div>
    </a>
  );
}

function AppShell({
  theme,
  onToggleTheme,
  sidebarItems,
  activeHref,
  title,
  subtitle,
  searchValue,
  onSearchChange,
  userName,
  onLogout,
  children,
  accent,
}) {
  const isLight = theme === "light";

  return (
    <div className="relative min-h-screen px-3 py-3 sm:px-4">
      <div className="ambient-orb left-[-7rem] top-[-5rem] h-64 w-64 bg-[#FF9933]/20" />
      <div className="ambient-orb right-[-8rem] top-1/3 h-72 w-72 bg-[#FFC107]/16" />
      <div className="noise-mask" />

      <div className="relative z-10 grid min-h-[calc(100vh-1.5rem)] gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={`rounded-[28px] p-5 ${isLight ? "glass-card-light" : "glass-card"} flex flex-col`}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl saffron-gradient font-display text-lg font-semibold text-neutral-950">
              Y
            </div>
            <div>
              <p className={`font-display text-lg font-semibold tracking-[0.28em] ${isLight ? "text-neutral-900" : "text-white"}`}>
                YATRI
              </p>
              <p className={`text-sm ${isLight ? "text-neutral-500" : "text-white/55"}`}>Premium booking suite</p>
            </div>
          </div>

          <div className={`mt-8 rounded-[24px] p-4 ${isLight ? "bg-white/80 panel-border-light" : "bg-white/5 panel-border"}`}>
            <p className={`text-xs uppercase tracking-[0.28em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
              Workspace
            </p>
            <p className={`mt-3 font-display text-xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
              Smart travel dashboard
            </p>
            <p className={`mt-2 text-sm leading-6 ${isLight ? "text-neutral-600" : "text-white/60"}`}>
              Monitor bookings, search faster, and keep the product feeling premium across every trip state.
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {sidebarItems.map((item) => (
              <SidebarItem key={item.href} item={item} isActive={item.href === activeHref} theme={theme} />
            ))}
          </nav>

          <div className={`mt-auto rounded-[24px] p-4 ${isLight ? "bg-[#FFF5E8] panel-border-light" : "bg-black/20 panel-border"}`}>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#FF9933]/15 p-3 text-[#FF9933]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>Saffron mode</p>
                <p className={`text-xs ${isLight ? "text-neutral-500" : "text-white/50"}`}>{accent}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className={`rounded-[28px] ${isLight ? "glass-card-light" : "glass-card"} overflow-hidden`}>
          <header
            className={`sticky top-0 z-30 flex flex-col gap-4 border-b px-5 py-4 backdrop-blur-xl sm:px-6 lg:flex-row lg:items-center lg:justify-between ${
              isLight
                ? "border-neutral-900/8 bg-white/70"
                : "border-white/10 bg-black/25"
            }`}
          >
            <div>
              <p className={`text-xs uppercase tracking-[0.3em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
                Dashboard
              </p>
              <h1 className={`mt-2 font-display text-2xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                {title}
              </h1>
              <p className={`mt-1 text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>{subtitle}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label
                className={`flex min-w-[240px] items-center gap-3 rounded-2xl border px-4 py-3 ${
                  isLight
                    ? "border-neutral-900/10 bg-white/85 text-neutral-700 focus-within:glow-ring"
                    : "border-white/10 bg-white/6 text-white/80 focus-within:glow-ring"
                }`}
              >
                <Search className="h-4 w-4 text-[#FF9933]" />
                <input
                  value={searchValue}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search routes, bookings, destinations"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-current/45"
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={`rounded-2xl border p-3 transition ${
                    isLight
                      ? "border-neutral-900/10 bg-white/80 text-neutral-700 hover:bg-white"
                      : "border-white/10 bg-white/6 text-white/80 hover:bg-white/10"
                  }`}
                  aria-label="Toggle theme"
                >
                  {isLight ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  className={`rounded-2xl border p-3 transition ${
                    isLight
                      ? "border-neutral-900/10 bg-white/80 text-neutral-700 hover:bg-white"
                      : "border-white/10 bg-white/6 text-white/80 hover:bg-white/10"
                  }`}
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <div className={`flex items-center gap-3 rounded-2xl border px-3 py-2 ${
                  isLight ? "border-neutral-900/10 bg-white/80" : "border-white/10 bg-white/6"
                }`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl saffron-gradient text-sm font-semibold text-neutral-950">
                    {userName.slice(0, 1)}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>{userName}</p>
                    <p className={`text-xs ${isLight ? "text-neutral-500" : "text-white/45"}`}>Product traveler</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 ${isLight ? "text-neutral-500" : "text-white/45"}`} />
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#FF9933]/20 bg-[#FF9933]/10 px-4 py-3 text-sm font-medium text-[#FFB066] transition hover:bg-[#FF9933]/16"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.main
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="p-5 sm:p-6"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
