import { Clock3, History, MapPin, Calendar, Search, Ticket, Star, Tag, Quote, Gift } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { transportTypes } from "../data/transports";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import PageShell from "../components/PageShell";
import TransportCard from "../components/TransportCard";
import { formatCurrency, formatType } from "../utils/booking";

function HomePage({ theme, onToggleTheme, pushToast }) {
  const { bookingHistory, setSearchCriteria } = useBooking();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isLight = theme === "light";
  
  const [activeTab, setActiveTab] = useState("bus");
  const [searchForm, setSearchForm] = useState({
    from: "",
    to: "",
    date: "",
    passengers: 1
  });
  const [errors, setErrors] = useState({});

  const handleSearch = () => {
    const newErrors = {};
    
    if (!searchForm.from.trim()) newErrors.from = "Source is required";
    if (!searchForm.to.trim()) newErrors.to = "Destination is required";
    if (!searchForm.date) newErrors.date = "Date is required";
    if (searchForm.from.trim() === searchForm.to.trim()) {
      newErrors.from = "Source and destination must be different";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (!isAuthenticated) {
      localStorage.setItem("yatri-post-login-path", `/${activeTab}`);
      pushToast({
        type: "info",
        title: "Login required",
        message: "Please login to search and book tickets.",
      });
      navigate("/login", { state: { from: { pathname: `/${activeTab}` } } });
      return;
    }

    setSearchCriteria(searchForm);
    navigate(`/${activeTab}?from=${encodeURIComponent(searchForm.from)}&to=${encodeURIComponent(searchForm.to)}&date=${searchForm.date}&passengers=${searchForm.passengers}`);
  };

  const handleTransportClick = (type) => {
    const target = `/${type}`;
    if (!isAuthenticated) {
      localStorage.setItem("yatri-post-login-path", target);
      pushToast({
        type: "info",
        title: "Login required",
        message: "Please login before starting a booking.",
      });
      navigate("/login", { state: { from: { pathname: target } } });
      return;
    }

    navigate(target);
  };

  return (
    <PageShell theme={theme} onToggleTheme={onToggleTheme}>
      {/* Hero Section without Search Form */}
      <section className={`rounded-[32px] border overflow-hidden ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}>
        <div className="grid lg:grid-cols-2">
          <div className="p-8 lg:p-12">
            <p className={`text-xs uppercase tracking-[0.3em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
              Welcome to YATRI
            </p>
            <h1 className={`mt-4 font-display text-4xl font-semibold ${isLight ? "text-neutral-900" : "text-white"} sm:text-5xl lg:text-6xl`}>
              Your Journey, Our Priority
            </h1>
            <p className={`mt-5 max-w-xl text-base leading-8 ${isLight ? "text-neutral-600" : "text-white/62"}`}>
              Experience seamless travel booking across buses, trains, and cabs. Premium service, competitive prices, and hassle-free reservations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/bus")}
                className="rounded-2xl saffron-gradient px-6 py-3 text-sm font-semibold text-neutral-950 soft-shadow transition hover:scale-[1.02]"
              >
                Book Bus
              </button>
              <button
                onClick={() => navigate("/train")}
                className={`rounded-2xl border px-6 py-3 text-sm font-semibold transition ${
                  isLight
                    ? "border-neutral-900/10 bg-white/75 text-neutral-700 hover:border-[#FF9933]/25"
                    : "border-white/10 bg-white/5 text-white/75 hover:border-[#FF9933]/25"
                }`}
              >
                Book Train
              </button>
              <button
                onClick={() => navigate("/cab")}
                className={`rounded-2xl border px-6 py-3 text-sm font-semibold transition ${
                  isLight
                    ? "border-neutral-900/10 bg-white/75 text-neutral-700 hover:border-[#FF9933]/25"
                    : "border-white/10 bg-white/5 text-white/75 hover:border-[#FF9933]/25"
                }`}
              >
                Book Cab
              </button>
            </div>
          </div>
          <div className={`relative hidden lg:block ${isLight ? "bg-[#FFF9F3]" : "bg-black/20"}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full saffron-gradient text-5xl font-bold text-neutral-950">
                  Y
                </div>
                <p className={`font-display text-2xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                  YATRI
                </p>
                <p className={`mt-2 text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
                  Multi-transport booking platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Form Section */}
      <section className="mt-8">
        <div className={`rounded-[32px] border p-8 ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}>
          <p className={`text-xs uppercase tracking-[0.3em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
            Search Your Journey
          </p>
          <h2 className={`mt-3 font-display text-2xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
            Find the perfect ride
          </h2>

          {/* Transport Tabs */}
          <div className="mt-6 flex gap-2">
            {[
              { id: "bus", label: "Bus", icon: Ticket },
              { id: "train", label: "Train", icon: History },
              { id: "cab", label: "Cab", icon: Clock3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "saffron-gradient text-neutral-950"
                    : isLight
                    ? "border border-neutral-900/10 bg-white/75 text-neutral-700 hover:border-[#FF9933]/25"
                    : "border border-white/10 bg-white/5 text-white/75 hover:border-[#FF9933]/25"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <div className={`mt-6 rounded-[28px] border p-6 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}>
            <div className="grid gap-4 md:grid-cols-4">
              {/* Source */}
              <label className="block">
                <span className={`mb-2 block text-sm font-medium ${isLight ? "text-neutral-700" : "text-white/80"}`}>
                  From
                </span>
                <div
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                    isLight
                      ? errors.from
                        ? "border-rose-400 bg-white/80"
                        : "border-neutral-900/10 bg-white/80 focus-within:glow-ring"
                      : errors.from
                      ? "border-rose-400 bg-white/6"
                      : "border-white/10 bg-white/6 focus-within:glow-ring"
                  }`}
                >
                  <MapPin className="h-4 w-4 text-[#FF9933]" />
                  <input
                    type="text"
                    placeholder="Source"
                    value={searchForm.from}
                    onChange={(e) => setSearchForm({ ...searchForm, from: e.target.value })}
                    className={`w-full bg-transparent text-sm outline-none placeholder:text-current/40 ${
                      isLight ? "text-neutral-900" : "text-white"
                    }`}
                  />
                </div>
                {errors.from && <p className="mt-2 text-sm text-rose-300">{errors.from}</p>}
              </label>

              {/* Destination */}
              <label className="block">
                <span className={`mb-2 block text-sm font-medium ${isLight ? "text-neutral-700" : "text-white/80"}`}>
                  To
                </span>
                <div
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                    isLight
                      ? errors.to
                        ? "border-rose-400 bg-white/80"
                        : "border-neutral-900/10 bg-white/80 focus-within:glow-ring"
                      : errors.to
                      ? "border-rose-400 bg-white/6"
                      : "border-white/10 bg-white/6 focus-within:glow-ring"
                  }`}
                >
                  <MapPin className="h-4 w-4 text-[#FF9933]" />
                  <input
                    type="text"
                    placeholder="Destination"
                    value={searchForm.to}
                    onChange={(e) => setSearchForm({ ...searchForm, to: e.target.value })}
                    className={`w-full bg-transparent text-sm outline-none placeholder:text-current/40 ${
                      isLight ? "text-neutral-900" : "text-white"
                    }`}
                  />
                </div>
                {errors.to && <p className="mt-2 text-sm text-rose-300">{errors.to}</p>}
              </label>

              {/* Date */}
              <label className="block">
                <span className={`mb-2 block text-sm font-medium ${isLight ? "text-neutral-700" : "text-white/80"}`}>
                  Date
                </span>
                <div
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                    isLight
                      ? errors.date
                        ? "border-rose-400 bg-white/80"
                        : "border-neutral-900/10 bg-white/80 focus-within:glow-ring"
                      : errors.date
                      ? "border-rose-400 bg-white/6"
                      : "border-white/10 bg-white/6 focus-within:glow-ring"
                  }`}
                >
                  <Calendar className="h-4 w-4 text-[#FF9933]" />
                  <input
                    type="date"
                    value={searchForm.date}
                    onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full bg-transparent text-sm outline-none ${
                      isLight ? "text-neutral-900" : "text-white"
                    }`}
                  />
                </div>
                {errors.date && <p className="mt-2 text-sm text-rose-300">{errors.date}</p>}
              </label>

              {/* Passengers */}
              <label className="block">
                <span className={`mb-2 block text-sm font-medium ${isLight ? "text-neutral-700" : "text-white/80"}`}>
                  Passengers
                </span>
                <div
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                    isLight
                      ? "border-neutral-900/10 bg-white/80 focus-within:glow-ring"
                      : "border-white/10 bg-white/6 focus-within:glow-ring"
                  }`}
                >
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={searchForm.passengers}
                    onChange={(e) => setSearchForm({ ...searchForm, passengers: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) })}
                    className={`w-full bg-transparent text-sm outline-none ${
                      isLight ? "text-neutral-900" : "text-white"
                    }`}
                  />
                </div>
              </label>
            </div>

            <button
              onClick={handleSearch}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl saffron-gradient px-4 py-3 text-sm font-semibold text-neutral-950 soft-shadow transition hover:scale-[1.02]"
            >
              <Search className="h-4 w-4" />
              Search {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className={`rounded-[32px] border p-7 ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}>
          <p className={`text-xs uppercase tracking-[0.3em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
            Quick Stats
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Transport types", value: "3", icon: Ticket },
              { label: "Max seats", value: "6", icon: History },
              { label: "Fast search", value: "<1s", icon: Clock3 },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-[24px] border p-4 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}
              >
                <stat.icon className="h-4.5 w-4.5 text-[#FF9933]" />
                <p className={`mt-4 font-display text-2xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                  {stat.value}
                </p>
                <p className={`mt-2 text-sm ${isLight ? "text-neutral-600" : "text-white/55"}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {transportTypes.map((item) => (
          <TransportCard
            key={item.type}
            item={item}
            theme={theme}
            onSelect={handleTransportClick}
          />
        ))}
      </section>

      {/* Reviews Section */}
      <section className="mt-12">
        <div className="mb-8 flex items-center gap-3">
          <Quote className="h-6 w-6 text-[#FF9933]" />
          <h2 className={`font-display text-3xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
            What Our Travelers Say
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Rahul Sharma",
              trip: "Delhi to Mumbai - Bus",
              rating: 5,
              comment: "Excellent service! The bus was clean and on time. Will definitely use YATRI again for my travel needs.",
              avatar: "RS"
            },
            {
              name: "Priya Patel",
              trip: "Mumbai to Pune - Cab",
              rating: 5,
              comment: "Great cab service with professional driver. The app made booking so easy and hassle-free.",
              avatar: "PP"
            },
            {
              name: "Amit Kumar",
              trip: "Chennai to Bangalore - Train",
              rating: 4,
              comment: "Smooth booking experience. Got good seats at reasonable prices. Highly recommended!",
              avatar: "AK"
            }
          ].map((review) => (
            <div
              key={review.name}
              className={`rounded-[28px] border p-6 ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full saffron-gradient text-sm font-semibold text-neutral-950`}>
                  {review.avatar}
                </div>
                <div>
                  <p className={`font-medium ${isLight ? "text-neutral-900" : "text-white"}`}>{review.name}</p>
                  <p className={`text-sm ${isLight ? "text-neutral-500" : "text-white/55"}`}>{review.trip}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "fill-current text-[#FFC107]" : "text-neutral-300"}`}
                  />
                ))}
              </div>
              <p className={`text-sm leading-6 ${isLight ? "text-neutral-600" : "text-white/60"}`}>
                "{review.comment}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Coupons Section */}
      <section className="mt-12">
        <div className="mb-8 flex items-center gap-3">
          <Gift className="h-6 w-6 text-[#FF9933]" />
          <h2 className={`font-display text-3xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
            Exclusive Offers & Coupons
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              code: "FIRSTBOOK",
              discount: "20% OFF",
              description: "Get 20% off on your first bus booking",
              minBooking: "Minimum ₹500",
              expiry: "Valid till Dec 31, 2024",
              icon: Ticket
            },
            {
              code: "TRAINSAVE",
              discount: "₹200 OFF",
              description: "Save ₹200 on all train bookings",
              minBooking: "Minimum ₹1000",
              expiry: "Valid till Dec 31, 2024",
              icon: History
            },
            {
              code: "CABRIDE",
              discount: "15% OFF",
              description: "15% discount on cab rides",
              minBooking: "Minimum ₹300",
              expiry: "Valid till Dec 31, 2024",
              icon: Clock3
            }
          ].map((coupon) => (
            <div
              key={coupon.code}
              className={`rounded-[28px] border overflow-hidden ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}
            >
              <div className={`p-6 ${isLight ? "bg-[#FFF9F3]" : "bg-black/20"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>
                    {coupon.discount}
                  </span>
                  <coupon.icon className="h-8 w-8 text-[#FF9933]" />
                </div>
              </div>
              <div className="p-6">
                <p className={`font-medium ${isLight ? "text-neutral-900" : "text-white"}`}>
                  {coupon.description}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[#FF9933]" />
                    <code className={`rounded-lg px-3 py-1 text-sm font-mono ${
                      isLight ? "bg-neutral-100 text-neutral-700" : "bg-white/10 text-white"
                    }`}>
                      {coupon.code}
                    </code>
                  </div>
                  <p className={`text-sm ${isLight ? "text-neutral-500" : "text-white/55"}`}>
                    {coupon.minBooking}
                  </p>
                  <p className={`text-xs ${isLight ? "text-neutral-400" : "text-white/40"}`}>
                    {coupon.expiry}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export default HomePage;
