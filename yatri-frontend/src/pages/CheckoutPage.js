import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { CreditCard, Smartphone, Building2, Check } from "lucide-react";
import PageShell from "../components/PageShell";
import FormInput from "../components/FormInput";
import BookingSummary from "../components/BookingSummary";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, generateBookingId } from "../utils/booking";

function CheckoutPage({ theme, onToggleTheme, pushToast }) {
  const { user } = useAuth();
  const { selectedTransport, selectedSeats, passengerCount, totalPrice, selectedClass, userDetails, setUserDetails, confirmBooking, searchCriteria } = useBooking();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [passengerDetails, setPassengerDetails] = useState([]);
  const navigate = useNavigate();
  const isLight = theme === "light";

  const totalPassengers = selectedTransport?.type === "cab"
    ? Math.max(1, passengerCount || 1)
    : Math.max(1, passengerCount || selectedSeats.length || 1);

  // Pre-fill user details if user is logged in
  useEffect(() => {
    if (user) {
      setUserDetails({
        name: user.name || "",
        email: user.email || "",
        phone: userDetails.phone || "",
      });
    }
  }, [user, setUserDetails]);

  useEffect(() => {
    setPassengerDetails((current) => {
      const next = Array.from({ length: totalPassengers }).map((_, index) => {
        if (current[index]) return current[index];
        return {
          name: index === 0 ? (user?.name || "") : "",
          email: index === 0 ? (user?.email || "") : "",
          phone: "",
        };
      });
      return next;
    });
  }, [totalPassengers, user]);

  const backgroundImages = {
    bus: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1920&q=80",
    train: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&q=80",
    cab: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80",
  };

  const canCheckout = useMemo(() => {
    if (!selectedTransport) return false;
    if (selectedTransport.type === "cab") return true;
    return selectedSeats.length > 0;
  }, [selectedSeats.length, selectedTransport]);

  const validate = () => {
    const nextErrors = {};
    const emailPattern = /\S+@\S+\.\S+/;
    const phonePattern = /^\d{10}$/;

    passengerDetails.forEach((passenger, index) => {
      if (!passenger.name || !passenger.name.trim()) {
        nextErrors[`passenger_${index}_name`] = `User ${index + 1} name is required`;
      }
      if (!passenger.email || !passenger.email.trim()) {
        nextErrors[`passenger_${index}_email`] = `User ${index + 1} email is required`;
      } else if (!emailPattern.test(passenger.email.trim())) {
        nextErrors[`passenger_${index}_email`] = `User ${index + 1} email is invalid`;
      }
      if (!passenger.phone || !passenger.phone.trim()) {
        nextErrors[`passenger_${index}_phone`] = `User ${index + 1} phone is required`;
      } else if (!phonePattern.test(passenger.phone.trim())) {
        nextErrors[`passenger_${index}_phone`] = `User ${index + 1} phone must be exactly 10 digits`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!selectedTransport || !canCheckout) {
      pushToast({
        type: "error",
        title: "Incomplete booking",
        message: "Select a route and seat details before confirming.",
      });
      navigate("/");
      return;
    }

    if (selectedTransport.type !== "cab" && selectedSeats.length !== totalPassengers) {
      pushToast({
        type: "error",
        title: "Seat mismatch",
        message: `You selected ${selectedSeats.length} seat(s) for ${totalPassengers} passenger(s).`,
      });
      navigate(`/${selectedTransport.type}/${selectedTransport.id}/seats`);
      return;
    }

    if (!validate()) {
      pushToast({
        type: "error",
        title: "Missing form details",
        message: "Please complete all checkout fields.",
      });
      return;
    }

    // Ensure totalPrice is valid
    const finalPrice = totalPrice || (selectedClass?.price * selectedSeats.length) || selectedTransport.price || selectedTransport.estimatedPrice || 0;
    
    if (finalPrice === 0) {
      pushToast({
        type: "error",
        title: "Invalid price",
        message: "Unable to calculate price. Please try again.",
      });
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        userId: user?.id || "guest",
        userName: passengerDetails[0]?.name || userDetails.name,
        userEmail: passengerDetails[0]?.email || userDetails.email,
        type: selectedTransport.type,
        transportId: selectedTransport.id,
        transportName: selectedTransport.name,
        source: selectedTransport.from,
        destination: selectedTransport.to,
        date: searchCriteria?.date || new Date().toISOString().split('T')[0],
        departureTime: selectedTransport.departure,
        arrivalTime: selectedTransport.arrival,
        duration: selectedTransport.duration,
        selectedSeats: selectedTransport.type === "cab" ? [] : selectedSeats,
        passengers: totalPassengers,
        passengerDetails,
        totalPrice: finalPrice,
        bookingClass: selectedClass?.type || selectedTransport.busType
      };

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed");
      }

      const booking = {
        id: data.booking.bookingId || generateBookingId(),
        type: selectedTransport.type,
        details: selectedTransport,
        seats: selectedTransport.type === "cab" ? [] : selectedSeats,
        totalPrice,
        user: passengerDetails[0] || userDetails,
        passengerDetails,
        timestamp: Date.now(),
        backendBooking: data.booking,
      };

      confirmBooking(booking);
      pushToast({
        type: "success",
        title: "Booking confirmed",
        message: "Your booking has been confirmed successfully.",
      });
      navigate("/success");
    } catch (error) {
      console.error("Booking error:", error);
      pushToast({
        type: "error",
        title: "Booking failed",
        message: error.message || "Failed to create booking. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTransport) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageShell theme={theme} onToggleTheme={onToggleTheme}>
      <div 
        className="min-h-screen relative"
        style={{
          backgroundImage: `url(${backgroundImages[selectedTransport.type]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className={`relative z-10 min-h-screen px-4 py-6 ${isLight ? 'bg-white/80' : 'bg-black/70'}`}>
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className={`rounded-[28px] border p-6 ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}>
          <p className={`text-xs uppercase tracking-[0.28em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
            Checkout
          </p>
          <h1 className={`mt-3 font-display text-3xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
            Complete your booking
          </h1>
          <p className={`mt-3 text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
            Required fields, clear validation, sticky summary, and a production-like confirmation flow.
          </p>

          <div className="mt-8 space-y-5">
            {passengerDetails.map((passenger, index) => (
              <div
                key={`passenger-${index}`}
                className={`rounded-2xl border p-4 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}
              >
                <p className={`mb-3 text-sm font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                  User {index + 1} details
                </p>
                <div className="grid gap-4">
                  <FormInput
                    theme={theme}
                    label={`User ${index + 1} full name`}
                    placeholder="Traveler name"
                    value={passenger.name}
                    onChange={(event) =>
                      setPassengerDetails((current) =>
                        current.map((item, idx) =>
                          idx === index ? { ...item, name: event.target.value } : item
                        )
                      )
                    }
                    error={errors[`passenger_${index}_name`]}
                  />
                  <FormInput
                    theme={theme}
                    label={`User ${index + 1} email`}
                    type="email"
                    placeholder="you@example.com"
                    value={passenger.email}
                    onChange={(event) =>
                      setPassengerDetails((current) =>
                        current.map((item, idx) =>
                          idx === index ? { ...item, email: event.target.value } : item
                        )
                      )
                    }
                    error={errors[`passenger_${index}_email`]}
                  />
                  <FormInput
                    theme={theme}
                    label={`User ${index + 1} phone`}
                    placeholder="10-digit mobile number"
                    value={passenger.phone}
                    onChange={(event) =>
                      setPassengerDetails((current) =>
                        current.map((item, idx) =>
                          idx === index
                            ? { ...item, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }
                            : item
                        )
                      )
                    }
                    error={errors[`passenger_${index}_phone`]}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <p className={`text-sm font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>Payment Method</p>
            <div className="mt-4 grid gap-3">
              {[
                { id: "card", label: "Credit/Debit Card", icon: CreditCard },
                { id: "upi", label: "UPI", icon: Smartphone },
                { id: "netbanking", label: "Net Banking", icon: Building2 },
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      paymentMethod === method.id
                        ? "border-[#FF9933]/30 bg-gradient-to-r from-[#FF9933]/10 to-[#E65100]/10"
                        : isLight
                        ? "border-neutral-900/8 bg-white/78 hover:bg-white/90"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      paymentMethod === method.id ? "saffron-gradient text-neutral-950" : isLight ? "bg-neutral-900/8" : "bg-white/10"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`flex-1 font-medium ${isLight ? "text-neutral-900" : "text-white"}`}>{method.label}</span>
                    {paymentMethod === method.id && <Check className="h-5 w-5 text-[#FF9933]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <BookingSummary
          booking={selectedTransport}
          seats={selectedSeats}
          totalPrice={totalPrice}
          userDetails={userDetails}
          theme={theme}
          cta={
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleConfirm}
              disabled={!canCheckout || loading}
              className="mt-6 w-full rounded-2xl saffron-gradient px-4 py-3 text-sm font-semibold text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Processing..." : "Confirm booking"}
            </motion.button>
          }
        />
        </div>
      </div>
    </div>
    </PageShell>
  );
}

export default CheckoutPage;
