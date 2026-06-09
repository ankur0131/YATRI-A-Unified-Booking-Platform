import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPinned, Clock3, Star, Shield, ArrowRight, CheckCircle, XCircle, Info } from "lucide-react";
import PageShell from "../components/PageShell";
import { useBooking } from "../context/BookingContext";
import { formatCurrency } from "../utils/booking";

function TransportDetailsPage({ theme, onToggleTheme, pushToast }) {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { setSelectedTransport, searchCriteria } = useBooking();
  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);
  const isLight = theme === "light";

  useEffect(() => {
    const fetchTransport = async () => {
      setLoading(true);
      try {
        const endpoint = type === "bus" 
          ? `http://localhost:5000/api/transports/buses/${id}`
          : type === "train"
          ? `http://localhost:5000/api/transports/trains/${id}`
          : `http://localhost:5000/api/transports/cabs/${id}`;
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        console.log("Fetched transport data:", data);
        
        // Unwrap data based on transport type
        let transportData = null;
        if (type === "bus" && data.bus) {
          transportData = data.bus;
        } else if (type === "train" && data.train) {
          transportData = data.train;
        } else if (type === "cab" && data.cab) {
          transportData = data.cab;
        }
        
        if (transportData) {
          setTransport(transportData);
        }
      } catch (error) {
        console.error("Error fetching transport:", error);
        pushToast({
          type: "error",
          title: "Error",
          message: "Failed to load transport details"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransport();
  }, [type, id, pushToast]);

  const handleContinue = () => {
    setSelectedTransport(transport);
    navigate(`/${type}/${id}/seats`);
  };

  const refundPolicies = [
    { title: "Full Refund", description: "100% refund if cancelled 24 hours before departure", eligible: true },
    { title: "Partial Refund", description: "50% refund if cancelled 12-24 hours before departure", eligible: true },
    { title: "No Refund", description: "No refund if cancelled less than 12 hours before departure", eligible: false },
  ];

  const backgroundImages = {
    bus: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1920&q=80",
    train: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&q=80",
    cab: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80",
  };

  if (loading) {
    return (
      <PageShell theme={theme} onToggleTheme={onToggleTheme}>
        <div className={`rounded-[28px] border p-8 text-center ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}>
          Loading...
        </div>
      </PageShell>
    );
  }

  if (!transport) {
    return (
      <PageShell theme={theme} onToggleTheme={onToggleTheme}>
        <div className={`rounded-[28px] border p-8 text-center ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}>
          Transport not found
        </div>
      </PageShell>
    );
  }

  const price = type === "train" ? transport.classes?.[0]?.price : transport.price || transport.estimatedPrice;
  const amenities = transport.amenities || transport.features || [];

  return (
    <PageShell theme={theme} onToggleTheme={onToggleTheme}>
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
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className={`rounded-[32px] border p-8 ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}>
                <h1 className={`font-display text-3xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                  {transport.name || transport.type}
                </h1>
                <p className={`mt-2 ${isLight ? "text-neutral-600" : "text-white/60"}`}>
                  {transport.operator || "Yatri Travels"}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className={`rounded-2xl border p-4 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}>
                    <div className="flex items-center gap-2">
                      <MapPinned className="h-4 w-4 text-[#FF9933]" />
                      <span className={`text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>Route</span>
                    </div>
                    <p className={`mt-2 font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                      {transport.from} → {transport.to}
                    </p>
                  </div>
                  <div className={`rounded-2xl border p-4 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-[#FF9933]" />
                      <span className={`text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>Duration</span>
                    </div>
                    <p className={`mt-2 font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                      {transport.duration || transport.estimatedDuration}
                    </p>
                  </div>
                  <div className={`rounded-2xl border p-4 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-[#FF9933]" />
                      <span className={`text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>Rating</span>
                    </div>
                    <p className={`mt-2 font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                      {transport.rating || transport.driverRating || "4.5"}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className={`font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>Price</h3>
                  <p className={`mt-2 font-display text-3xl font-bold text-[#FF9933]`}>
                    {formatCurrency(price)}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div className={`rounded-[32px] border p-8 ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}>
                <h2 className={`font-display text-2xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                  Amenities
                </h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 rounded-2xl border p-4 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}
                    >
                      <CheckCircle className="h-5 w-5 text-[#FF9933]" />
                      <span className={`font-medium ${isLight ? "text-neutral-900" : "text-white"}`}>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Refund Policy */}
              <div className={`rounded-[32px] border p-6 ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}>
                <h2 className={`font-display text-xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                  Refund Policy
                </h2>
                <div className="mt-4 space-y-3">
                  {refundPolicies.map((policy, idx) => (
                    <div key={idx} className="flex gap-3">
                      {policy.eligible ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-medium ${isLight ? "text-neutral-900" : "text-white"}`}>{policy.title}</p>
                        <p className={`mt-1 text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>{policy.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                className="flex w-full items-center justify-center gap-3 rounded-2xl saffron-gradient px-6 py-4 text-base font-semibold text-neutral-950 soft-shadow transition"
              >
                Select Seats
                <ArrowRight className="h-5 w-5" />
              </motion.button>

              {/* Info Box */}
              <div className={`rounded-2xl border p-4 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}>
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-[#FF9933] flex-shrink-0 mt-0.5" />
                  <p className={`text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
                    You can select your preferred seats on the next page. Seats are subject to availability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default TransportDetailsPage;
