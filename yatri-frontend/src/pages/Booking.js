import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  Bus,
  CalendarDays,
  CarTaxiFront,
  Clock3,
  MapPinned,
  Search,
  TrainFront,
  WalletCards,
  LayoutDashboard,
  Ticket,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";

const TRANSPORTS = [
  {
    id: "bus",
    label: "Bus",
    icon: Bus,
    blurb: "Great for flexible intercity hops with smart price points.",
    eta: "5h 20m",
    provider: "RedBus Connect",
  },
  {
    id: "train",
    label: "Train",
    icon: TrainFront,
    blurb: "Comfort-first routes with stable pricing and long-distance confidence.",
    eta: "4h 40m",
    provider: "IRCTC Fastlane",
  },
  {
    id: "cab",
    label: "Cab",
    icon: CarTaxiFront,
    blurb: "Door-to-door convenience for premium last-mile or direct city travel.",
    eta: "3h 50m",
    provider: "Uber Intercity",
  },
];

const sidebarItems = [
  { href: "/booking", label: "Dashboard", helper: "Search and compare", icon: LayoutDashboard },
  { href: "/my-bookings", label: "Bookings", helper: "Trips and history", icon: Ticket },
];

function formatPrice(value) {
  return `Rs. ${value}`;
}

function Booking({ theme, onToggleTheme, pushToast }) {
  const [type, setType] = useState("bus");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLight = theme === "light";

  const selected = useMemo(
    () => TRANSPORTS.find((transport) => transport.id === type) || TRANSPORTS[0],
    [type]
  );

  const filteredResults = useMemo(() => {
    const term = searchText.toLowerCase().trim();
    if (!term) return results;
    return results.filter((result) =>
      [result.name, result.provider, result.time].join(" ").toLowerCase().includes(term)
    );
  }, [results, searchText]);

  const dashboardStats = useMemo(
    () => [
      { label: "Routes scanned", value: "184", detail: "today", icon: Search },
      { label: "Fastest option", value: selected.eta, detail: selected.label, icon: Clock3 },
      { label: "Best partner", value: selected.provider, detail: "redirect ready", icon: WalletCards },
    ],
    [selected]
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    pushToast({
      type: "info",
      title: "Logged out",
      message: "You have exited the dashboard.",
    });
    navigate("/");
  };

  const search = () => {
    setStatus({ type: "", text: "" });

    if (!source || !destination || !date) {
      const message = "Please fill source, destination and date";
      setStatus({ type: "error", text: message });
      pushToast({
        type: "error",
        title: "Missing search details",
        message,
      });
      return;
    }

    setIsSearching(true);
    window.setTimeout(() => {
      const base = type === "cab" ? 640 : type === "bus" ? 420 : 520;
      const generated = [
        {
          name: `${selected.label} Prime`,
          time: "Fastest",
          price: base + 220,
          provider: selected.provider,
          status: "Active",
        },
        {
          name: `${selected.label} Flex`,
          time: "Balanced",
          price: base + 120,
          provider: selected.provider,
          status: "Pending",
        },
        {
          name: `${selected.label} Saver`,
          time: "Budget",
          price: base,
          provider: selected.provider,
          status: "Completed",
        },
      ];

      setResults(generated);
      setIsSearching(false);
      setStatus({
        type: "success",
        text: `${generated.length} premium options ready for ${source} to ${destination}.`,
      });
      pushToast({
        type: "success",
        title: "Search complete",
        message: `Found ${generated.length} curated ${selected.label.toLowerCase()} options.`,
      });
    }, 950);
  };

  const book = async (option) => {
    setStatus({ type: "", text: "" });

    if (!token) {
      const message = "Please login first to book";
      setStatus({ type: "error", text: message });
      pushToast({
        type: "error",
        title: "Authentication required",
        message,
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          source,
          destination,
          date,
          price: option.price,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const message = data.message || "Booking failed";
        setStatus({ type: "error", text: message });
        pushToast({
          type: "error",
          title: "Booking failed",
          message,
        });
        return;
      }

      const message = "Booked successfully! Check My Bookings.";
      setStatus({ type: "success", text: message });
      pushToast({
        type: "success",
        title: "Booking confirmed",
        message: `${option.name} is now in your bookings list.`,
      });
    } catch (error) {
      const message = "Backend server not reachable";
      setStatus({ type: "error", text: message });
      pushToast({
        type: "error",
        title: "Connection error",
        message,
      });
    }
  };

  return (
    <AppShell
      theme={theme}
      onToggleTheme={onToggleTheme}
      sidebarItems={sidebarItems}
      activeHref="/booking"
      title="Travel dashboard"
      subtitle="Modern booking UI with saffron-led actions, glass surfaces, and calmer decision-making."
      searchValue={searchText}
      onSearchChange={setSearchText}
      userName="Traveler"
      onLogout={handleLogout}
      accent={`${selected.label} mode active`}
    >
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <section className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`overflow-hidden rounded-[28px] border p-6 ${isLight ? "border-neutral-900/8 bg-white/70" : "border-white/10 bg-white/5"}`}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className={`text-xs uppercase tracking-[0.28em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
                  Dashboard
                </p>
                <h2 className={`mt-3 font-display text-3xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                  Book confidently with a premium saffron interface.
                </h2>
                <p className={`mt-3 text-sm leading-7 ${isLight ? "text-neutral-600" : "text-white/60"}`}>
                  Search across transport modes, compare quick takeaways, and keep key actions bright while the rest of the UI stays composed.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {dashboardStats.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl border p-4 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}
                  >
                    <item.icon className="h-4.5 w-4.5 text-[#FF9933]" />
                    <p className={`mt-4 text-xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                      {item.value}
                    </p>
                    <p className={`mt-1 text-xs ${isLight ? "text-neutral-500" : "text-white/45"}`}>
                      {item.label} · {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-3">
            {TRANSPORTS.map((transport) => {
              const active = transport.id === type;
              return (
                <motion.button
                  key={transport.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={() => setType(transport.id)}
                  className={`rounded-[26px] border p-5 text-left transition ${
                    active
                      ? "border-[#FF9933]/35 bg-gradient-to-br from-[#FF9933]/14 via-[#E65100]/8 to-transparent shadow-[0_18px_50px_rgba(255,153,51,0.12)]"
                      : isLight
                        ? "border-neutral-900/8 bg-white/70 hover:border-[#FF9933]/25"
                        : "border-white/10 bg-white/5 hover:border-[#FF9933]/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      active ? "saffron-gradient text-neutral-950" : isLight ? "bg-neutral-900/6 text-neutral-700" : "bg-white/8 text-white/80"
                    }`}>
                      <transport.icon className="h-5 w-5" />
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      active ? "bg-[#FF9933]/15 text-[#FF9933]" : isLight ? "bg-neutral-900/6 text-neutral-500" : "bg-white/8 text-white/45"
                    }`}>
                      {active ? "Active" : "Switch"}
                    </span>
                  </div>
                  <h3 className={`mt-5 font-display text-xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                    {transport.label}
                  </h3>
                  <p className={`mt-2 text-sm leading-6 ${isLight ? "text-neutral-600" : "text-white/60"}`}>
                    {transport.blurb}
                  </p>
                </motion.button>
              );
            })}
          </div>

          <div className={`rounded-[28px] border p-6 ${isLight ? "border-neutral-900/8 bg-white/70" : "border-white/10 bg-white/5"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs uppercase tracking-[0.28em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
                  Search module
                </p>
                <h3 className={`mt-2 font-display text-2xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                  Configure your next route
                </h3>
              </div>
              <div className={`rounded-full px-3 py-1 text-xs font-medium ${isLight ? "bg-[#FFF3E0] text-[#E65100]" : "bg-[#FF9933]/12 text-[#FFB066]"}`}>
                {selected.provider}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                { id: "source", label: "From", value: source, setValue: setSource, icon: MapPinned, placeholder: "e.g. Delhi" },
                { id: "destination", label: "To", value: destination, setValue: setDestination, icon: ArrowRightLeft, placeholder: "e.g. Jaipur" },
                { id: "date", label: "Travel date", value: date, setValue: setDate, icon: CalendarDays, type: "date" },
              ].map((field) => (
                <label key={field.id} className="block">
                  <span className={`mb-2 block text-sm font-medium ${isLight ? "text-neutral-700" : "text-white/80"}`}>
                    {field.label}
                  </span>
                  <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                    isLight
                      ? "border-neutral-900/10 bg-white/85 focus-within:glow-ring"
                      : "border-white/10 bg-white/6 focus-within:glow-ring"
                  }`}>
                    <field.icon className="h-4 w-4 text-[#FF9933]" />
                    <input
                      id={field.id}
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      value={field.value}
                      onChange={(event) => field.setValue(event.target.value)}
                      className={`w-full bg-transparent text-sm outline-none placeholder:text-current/40 ${
                        isLight ? "text-neutral-900" : "text-white"
                      }`}
                    />
                  </div>
                </label>
              ))}

              <div className="flex items-end">
                <motion.button
                  whileTap={{ scale: 0.985 }}
                  whileHover={{ scale: 1.01 }}
                  type="button"
                  onClick={search}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl saffron-gradient px-4 py-3 text-sm font-semibold text-neutral-950 soft-shadow"
                >
                  Search premium options
                  <Search className="h-4 w-4" />
                </motion.button>
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
        </section>

        <section className="space-y-6">
          <div className={`rounded-[28px] border p-6 ${isLight ? "border-neutral-900/8 bg-white/70" : "border-white/10 bg-white/5"}`}>
            <p className={`text-xs uppercase tracking-[0.28em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
              Recommendation
            </p>
            <h3 className={`mt-2 font-display text-2xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
              {selected.label} mode highlights
            </h3>
            <p className={`mt-3 text-sm leading-7 ${isLight ? "text-neutral-600" : "text-white/60"}`}>
              {selected.blurb}
            </p>

            <div className="mt-5 space-y-3">
              {[
                "Cards glow softly on hover instead of shouting with color.",
                "Sticky top navigation keeps search and profile actions available.",
                "Dark or light mode keeps the saffron identity consistent.",
              ].map((point) => (
                <div
                  key={point}
                  className={`rounded-2xl border px-4 py-3 text-sm ${isLight ? "border-neutral-900/8 bg-[#FFF9F3] text-neutral-700" : "border-white/10 bg-black/20 text-white/70"}`}
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[28px] border p-6 ${isLight ? "border-neutral-900/8 bg-white/70" : "border-white/10 bg-white/5"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs uppercase tracking-[0.28em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
                  Results
                </p>
                <h3 className={`mt-2 font-display text-2xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                  Curated route options
                </h3>
              </div>
              <Link
                to="/my-bookings"
                className={`rounded-full px-4 py-2 text-sm font-medium ${isLight ? "bg-[#FFF3E0] text-[#E65100]" : "bg-[#FF9933]/12 text-[#FFB066]"}`}
              >
                View bookings
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {isSearching ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className={`skeleton-shimmer rounded-[24px] border p-5 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}
                  >
                    <div className={`h-4 w-24 rounded-full ${isLight ? "bg-neutral-200" : "bg-white/10"}`} />
                    <div className={`mt-4 h-7 w-2/3 rounded-full ${isLight ? "bg-neutral-200" : "bg-white/10"}`} />
                    <div className={`mt-3 h-4 w-1/2 rounded-full ${isLight ? "bg-neutral-200" : "bg-white/10"}`} />
                  </div>
                ))
              ) : filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <motion.div
                    key={result.name}
                    whileHover={{ y: -4 }}
                    className={`rounded-[24px] border p-5 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-[#FF9933]/12 px-3 py-1 text-xs font-semibold text-[#FF9933]">
                            {result.provider}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              result.status === "Active"
                                ? "bg-[#FF9933]/12 text-[#FF9933]"
                                : result.status === "Pending"
                                  ? "bg-yellow-500/12 text-yellow-400"
                                  : "bg-emerald-500/12 text-emerald-400"
                            }`}
                          >
                            {result.status}
                          </span>
                        </div>
                        <h4 className={`mt-4 font-display text-xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                          {result.name}
                        </h4>
                        <p className={`mt-2 text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
                          {source || "Origin"} to {destination || "Destination"} · {result.time} · {date || "Select date"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs uppercase tracking-[0.28em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
                          Price
                        </p>
                        <p className={`mt-2 font-display text-2xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                          {formatPrice(result.price)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className={`text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
                        Partner handoff: {result.provider}
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.985 }}
                        whileHover={{ scale: 1.02 }}
                        type="button"
                        onClick={() => book(result)}
                        className="rounded-2xl saffron-gradient px-4 py-3 text-sm font-semibold text-neutral-950 soft-shadow"
                      >
                        Book now
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className={`rounded-[24px] border border-dashed p-6 text-center ${isLight ? "border-neutral-900/12 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}>
                  <p className={`font-display text-xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                    No results yet
                  </p>
                  <p className={`mt-2 text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
                    Pick a mode, enter the route, and search to populate the premium result cards.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default Booking;
