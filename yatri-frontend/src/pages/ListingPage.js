import { motion } from "framer-motion";
import { MapPinned, Clock3, Star, ChevronRight, LoaderCircle, Search, SlidersHorizontal, Filter } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useBooking } from "../context/BookingContext";
import { formatCurrency, formatType } from "../utils/booking";

function ListingPage({ theme, onToggleTheme, pushToast }) {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { setSelectedTransport, searchCriteria } = useBooking();
  const isLight = theme === "light";

  useEffect(() => {
    const fetchItems = async () => {
      const from = searchParams.get("from") || "";
      const to = searchParams.get("to") || "";
      const date = searchParams.get("date") || "";
      
      // Check if search parameters are provided
      if (!from || !to) {
        setLoading(false);
        setItems([]);
        return;
      }

      setLoading(true);
      try {
        let endpoint = "";
        if (type === "bus") {
          endpoint = `http://localhost:5000/api/transports/buses/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`;
        } else if (type === "train") {
          endpoint = `http://localhost:5000/api/transports/trains/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`;
        } else if (type === "cab") {
          endpoint = `http://localhost:5000/api/transports/cabs/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();
        
        let formattedItems = [];
        if (type === "bus" && data.buses && Array.isArray(data.buses)) {
          formattedItems = data.buses.map(bus => ({
            ...bus,
            id: bus._id,
            type: "bus",
            departure: bus.departureTime,
            arrival: bus.arrivalTime
          }));
        } else if (type === "train" && data.trains && Array.isArray(data.trains)) {
          formattedItems = data.trains.map(train => ({
            ...train,
            id: train._id,
            type: "train",
            departure: train.departureTime,
            arrival: train.arrivalTime,
            price: train.classes[0]?.price || 0,
            operator: train.name
          }));
        } else if (type === "cab" && data.cabs && Array.isArray(data.cabs)) {
          formattedItems = data.cabs.map(cab => ({
            ...cab,
            id: cab._id,
            type: "cab",
            name: cab.type,
            departure: "Flexible",
            arrival: "Flexible",
            duration: cab.estimatedDuration,
            price: cab.estimatedPrice,
            operator: "Yatri Cabs"
          }));
        }
        
        setItems(formattedItems);
      } catch (error) {
        console.error("Error fetching items:", error);
        pushToast({
          type: "error",
          title: "Error",
          message: "Failed to load transport options. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [type, searchParams, pushToast]);

  const filteredItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    
    let result = items;
    
    // Text search filter
    const term = query.toLowerCase().trim();
    if (term) {
      result = result.filter((item) =>
        [item.name, item.from, item.to, item.operator].join(" ").toLowerCase().includes(term)
      );
    }
    
    // Price filter
    if (priceFilter === "low") {
      result = result.filter((item) => item.price <= 1000);
    } else if (priceFilter === "medium") {
      result = result.filter((item) => item.price > 1000 && item.price <= 2000);
    } else if (priceFilter === "high") {
      result = result.filter((item) => item.price > 2000);
    }
    
    return result;
  }, [items, query, priceFilter]);

  const handleSelect = useCallback((item) => {
    setSelectedTransport(item);
    navigate(`/${type}/${item.id}/details`);
  }, [navigate, setSelectedTransport, type]);

  return (
    <PageShell theme={theme} onToggleTheme={onToggleTheme}>
      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className={`text-xs uppercase tracking-[0.28em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
            Listing
          </p>
          <h1 className={`mt-3 font-display text-4xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
            {formatType(type)} listings
          </h1>
          {searchCriteria && (
            <p className={`mt-3 text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
              {searchCriteria.from} → {searchCriteria.to} on {new Date(searchCriteria.date).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${type} routes`}
            className={`w-full max-w-sm rounded-2xl border px-4 py-3 text-sm outline-none ${
              isLight ? "border-neutral-900/10 bg-white text-neutral-900" : "border-white/10 bg-white/6 text-white"
            }`}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-2xl border px-4 py-3 transition ${
              isLight
                ? "border-neutral-900/10 bg-white/75 text-neutral-700 hover:border-[#FF9933]/25"
                : "border-white/10 bg-white/5 text-white/75 hover:border-[#FF9933]/25"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </section>

      {showFilters && (
        <div className={`mb-6 rounded-2xl border p-4 ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-[#FF9933]" />
            <span className={`text-sm font-medium ${isLight ? "text-neutral-900" : "text-white"}`}>Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All Prices" },
              { value: "low", label: "Under ₹1,000" },
              { value: "medium", label: "₹1,000 - ₹2,000" },
              { value: "high", label: "Above ₹2,000" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setPriceFilter(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  priceFilter === filter.value
                    ? "saffron-gradient text-neutral-950"
                    : isLight
                    ? "border border-neutral-900/10 bg-white/75 text-neutral-700 hover:border-[#FF9933]/25"
                    : "border border-white/10 bg-white/5 text-white/75 hover:border-[#FF9933]/25"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={`skeleton-shimmer rounded-[28px] border p-6 ${
                isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"
              }`}
            >
              <div className={`h-4 w-20 rounded-full ${isLight ? "bg-neutral-200" : "bg-white/10"}`} />
              <div className={`mt-5 h-8 w-2/3 rounded-full ${isLight ? "bg-neutral-200" : "bg-white/10"}`} />
              <div className={`mt-3 h-4 w-full rounded-full ${isLight ? "bg-neutral-200" : "bg-white/10"}`} />
              <div className={`mt-10 h-12 w-full rounded-2xl ${isLight ? "bg-neutral-200" : "bg-white/10"}`} />
            </div>
          ))}
        </div>
      ) : filteredItems.length ? (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.08 },
            },
          }}
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {filteredItems.map((item) => (
            <motion.article
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              className={`rounded-[28px] border p-6 ${
                isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isLight ? "bg-[#FFF3E0] text-[#E65100]" : "bg-[#FF9933]/12 text-[#FFB066]"}`}>
                  {item.operator}
                </span>
                <span className={`inline-flex items-center gap-1 text-sm ${isLight ? "text-neutral-500" : "text-white/55"}`}>
                  <Star className="h-4 w-4 fill-current text-[#FFC107]" />
                  {item.rating}
                </span>
              </div>
              <h2 className={`mt-5 font-display text-2xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                {item.name}
              </h2>
              <div className={`mt-4 space-y-2 text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
                <p className="flex items-center gap-2">
                  <MapPinned className="h-4 w-4 text-[#FF9933]" />
                  {item.from} to {item.to}
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[#FF9933]" />
                  {item.departure} - {item.arrival} · {item.duration}
                </p>
                {(item.type === "bus" || item.type === "train") && (
                  <p className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-[#FF9933]" />
                    {item.availableSeats || item.classes?.[0]?.availableSeats || 0} seats available
                  </p>
                )}
                {item.type === "cab" && (
                  <p className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-[#FF9933]" />
                    Driver Rating: {item.driverRating}
                  </p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(item.amenities || item.features || []).map((amenity) => (
                  <span
                    key={amenity}
                    className={`rounded-full px-3 py-1 text-xs ${
                      isLight ? "bg-neutral-900/6 text-neutral-600" : "bg-white/8 text-white/55"
                    }`}
                  >
                    {amenity}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className={`text-xs uppercase tracking-[0.2em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
                    Starting
                  </p>
                  <p className={`mt-2 font-display text-2xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                    {formatCurrency(item.price)}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(item)}
                  className="flex items-center gap-2 rounded-xl saffron-gradient px-5 py-2.5 text-sm font-semibold text-neutral-950 soft-shadow transition"
                >
                  View Details
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.article>
          ))}
        </motion.div>
      ) : (
        <div className={`rounded-[28px] border border-dashed p-8 text-center ${isLight ? "border-neutral-900/12 bg-white/78 text-neutral-600" : "border-white/10 bg-white/5 text-white/60"}`}>
          {searchParams.get("from") && searchParams.get("to") ? (
            <>
              <LoaderCircle className="mx-auto h-8 w-8 text-[#FF9933]" />
              <p className="mt-4">No results found for your search. Please try different routes.</p>
            </>
          ) : (
            <>
              <Search className="mx-auto h-8 w-8 text-[#FF9933]" />
              <p className="mt-4">Please enter source and destination to search for available {formatType(type)} options.</p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 saffron-gradient px-6 py-2 rounded-xl text-sm font-semibold text-neutral-950"
              >
                Go to Search
              </button>
            </>
          )}
        </div>
      )}
    </PageShell>
  );
}

export default ListingPage;
