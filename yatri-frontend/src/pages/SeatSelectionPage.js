import { motion } from "framer-motion";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingSummary from "../components/BookingSummary";
import PageShell from "../components/PageShell";
import SeatGrid from "../components/SeatGrid";
import { useBooking } from "../context/BookingContext";

function SeatSelectionPage({ theme, onToggleTheme, pushToast }) {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transport, setTransport] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const {
    selectedSeats,
    totalPrice,
    passengerCount,
    setSelectedTransport,
    toggleSeat,
    setPassengerCount,
    setSelectedClass: setContextSelectedClass,
    searchCriteria,
  } = useBooking();
  const isLight = theme === "light";

  useEffect(() => {
    const fetchTransport = async () => {
      setLoading(true);
      try {
        const travelDate = searchCriteria?.date || new Date().toISOString().split("T")[0];
        let endpoint = "";
        if (type === "bus") {
          endpoint = `http://localhost:5000/api/transports/buses/${id}?date=${encodeURIComponent(travelDate)}`;
        } else if (type === "train") {
          endpoint = `http://localhost:5000/api/transports/trains/${id}?date=${encodeURIComponent(travelDate)}`;
        } else if (type === "cab") {
          endpoint = `http://localhost:5000/api/transports/cabs/${id}?date=${encodeURIComponent(travelDate)}`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();
        
        let formattedTransport = null;
        if (type === "bus" && data.bus) {
          formattedTransport = {
            ...data.bus,
            id: data.bus._id,
            type: "bus",
            departure: data.bus.departureTime,
            arrival: data.bus.arrivalTime,
            busType: data.bus.type
          };
        } else if (type === "train" && data.train) {
          formattedTransport = {
            ...data.train,
            id: data.train._id,
            type: "train",
            departure: data.train.departureTime,
            arrival: data.train.arrivalTime,
            classes: data.train.classes
          };
          // Auto-select the first class
          if (data.train.classes && data.train.classes.length > 0) {
            const firstClass = data.train.classes[0];
            setSelectedClass(firstClass);
            setContextSelectedClass(firstClass);
          }
        } else if (type === "cab" && data.cab) {
          formattedTransport = {
            ...data.cab,
            id: data.cab._id,
            type: "cab",
            name: data.cab.type,
            departure: "Flexible",
            arrival: "Flexible",
            duration: data.cab.estimatedDuration,
            price: data.cab.estimatedPrice,
            operator: "Yatri Cabs"
          };
        }
        
        if (formattedTransport) {
          setTransport(formattedTransport);
          setSelectedTransport(formattedTransport);
        }
      } catch (error) {
        console.error("Error fetching transport:", error);
        pushToast({
          type: "error",
          title: "Error",
          message: "Failed to load transport details."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransport();
  }, [id, setSelectedTransport, type, pushToast]);

  const seatCost = useMemo(() => {
    if (!transport) return 0;
    if (type === "train" && selectedClass) {
      return selectedClass.price || 0;
    }
    return transport.price || transport.estimatedPrice || 0;
  }, [transport, selectedClass, type]);

  const handleToggle = (seatId) => {
    if (selectedSeats.length >= passengerCount && !selectedSeats.includes(seatId)) {
      pushToast({
        type: "error",
        title: "Seat limit reached",
        message: `You can select only ${passengerCount} seat(s) for ${passengerCount} passenger(s).`,
      });
      return;
    }
    toggleSeat(seatId, passengerCount);
  };

  const proceed = () => {
    if (!selectedSeats.length) {
      pushToast({
        type: "error",
        title: "No seats selected",
        message: "Select at least one seat before checkout.",
      });
      return;
    }
    if (type !== "cab" && selectedSeats.length !== passengerCount) {
      pushToast({
        type: "error",
        title: "Seat count mismatch",
        message: `Please select exactly ${passengerCount} seat(s).`,
      });
      return;
    }
    navigate("/checkout");
  };

  const backgroundImages = {
    bus: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1920&q=80",
    train: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&q=80",
    cab: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80",
  };

  return (
    <PageShell theme={theme} onToggleTheme={onToggleTheme}>
      {loading ? (
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.75fr]">
          <div className={`skeleton-shimmer min-h-[420px] rounded-[28px] border ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`} />
          <div className={`skeleton-shimmer min-h-[320px] rounded-[28px] border ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`} />
        </div>
      ) : transport ? (
        <div 
          className="min-h-screen relative"
          style={{
            backgroundImage: `url(${backgroundImages[type]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className={`relative z-10 min-h-screen px-4 py-6 ${isLight ? 'bg-white/80' : 'bg-black/70'}`}>
            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.75fr]">
          <section className={`rounded-[28px] border p-6 ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}>
            <p className={`text-xs uppercase tracking-[0.28em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
              Seat selection
            </p>
            <h1 className={`mt-3 font-display text-3xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
              Choose your seats
            </h1>
            <p className={`mt-3 text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
              Select passengers first, then choose matching seats. Booked seats stay disabled.
            </p>

            {type !== "cab" ? (
              <div className="mt-5 max-w-xs">
                <label className={`mb-2 block text-sm font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                  Number of passengers
                </label>
                <select
                  value={passengerCount}
                  onChange={(event) => setPassengerCount(Number(event.target.value))}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${
                    isLight ? "border-neutral-900/10 bg-white text-neutral-900" : "border-white/10 bg-white/6 text-white"
                  }`}
                >
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const count = idx + 1;
                    return (
                      <option key={count} value={count}>
                        {count} passenger{count > 1 ? "s" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : null}

            {/* Class Selection for Trains */}
            {type === "train" && transport.classes && transport.classes.length > 0 && (
              <div className="mt-6">
                <p className={`text-sm font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>Select Class</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {transport.classes.map((cls, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedClass(cls);
                        setContextSelectedClass(cls);
                      }}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                        selectedClass?.type === cls.type
                          ? "border-[#FF9933]/30 bg-gradient-to-br from-[#FF9933] to-[#E65100] text-neutral-950"
                          : isLight
                          ? "border-neutral-900/8 bg-white/78 text-neutral-700 hover:bg-white"
                          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {cls.type} - ₹{cls.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Available", className: isLight ? "border-neutral-900/12 bg-white text-neutral-700" : "border-white/10 bg-white/5 text-white/70" },
                { label: "Selected", className: "border-[#FF9933]/30 bg-gradient-to-br from-[#FF9933] to-[#E65100] text-neutral-950" },
                { label: "Booked", className: isLight ? "border-neutral-300 bg-neutral-200 text-neutral-400" : "border-white/8 bg-white/6 text-white/25" },
              ].map((legend) => (
                <div key={legend.label} className={`rounded-2xl border px-4 py-3 text-sm ${legend.className}`}>
                  {legend.label}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <SeatGrid
                bookedSeats={transport.bookedSeats}
                selectedSeats={selectedSeats}
                onToggle={handleToggle}
                theme={theme}
                seatType={selectedClass?.type?.toLowerCase().includes("sleeper") || ["1a", "2a", "3a"].includes(selectedClass?.type?.toLowerCase()) ? "sleeper" : "seater"}
              />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className={`rounded-[24px] border p-4 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-[#FF9933]" />
                  <div>
                    <p className={`text-sm font-medium ${isLight ? "text-neutral-900" : "text-white"}`}>Seat price</p>
                    <p className={`text-sm ${isLight ? "text-neutral-500" : "text-white/45"}`}>Per seat: Rs. {seatCost}</p>
                  </div>
                </div>
              </div>
              <div className={`rounded-[24px] border p-4 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4.5 w-4.5 text-[#FF9933]" />
                  <div>
                    <p className={`text-sm font-medium ${isLight ? "text-neutral-900" : "text-white"}`}>Selection rule</p>
                    <p className={`text-sm ${isLight ? "text-neutral-500" : "text-white/45"}`}>
                      Select exactly {passengerCount} seat(s) for {passengerCount} passenger(s).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <BookingSummary
            booking={transport}
            seats={selectedSeats}
            totalPrice={totalPrice}
            theme={theme}
            cta={
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={proceed}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl saffron-gradient px-4 py-3 text-sm font-semibold text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!selectedSeats.length}
              >
                Continue to checkout
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            }
          />
        </div>
        </div>
      </div>
      ) : (
        <div className={`rounded-[28px] border border-dashed p-8 ${isLight ? "border-neutral-900/12 bg-white/78 text-neutral-600" : "border-white/10 bg-white/5 text-white/60"}`}>
          Selected route could not be found.
        </div>
      )}
    </PageShell>
  );
}

export default SeatSelectionPage;
