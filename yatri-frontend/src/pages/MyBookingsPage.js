import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Trash2, Ticket, TrainFront, CarTaxiFront, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";

const iconMap = {
  bus: Ticket,
  train: TrainFront,
  cab: CarTaxiFront,
};

function MyBookingsPage({ theme, onToggleTheme, pushToast }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLight = theme === "light";

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/bookings", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        pushToast({
          type: "error",
          title: "Error",
          message: "Failed to load bookings"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [pushToast]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: "cancelled" } : b));
        pushToast({
          type: "success",
          title: "Booking cancelled",
          message: "Your booking has been cancelled successfully"
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      pushToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to cancel booking"
      });
    }
  };

  if (loading) {
    return (
      <PageShell theme={theme} onToggleTheme={onToggleTheme}>
        <div className={`rounded-[28px] border p-8 text-center ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}>
          Loading bookings...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell theme={theme} onToggleTheme={onToggleTheme}>
      <div className={`rounded-[32px] border p-8 ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"}`}>
        <h1 className={`font-display text-3xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
          My Bookings
        </h1>
        <p className={`mt-2 ${isLight ? "text-neutral-600" : "text-white/60"}`}>
          View and manage your bookings
        </p>

        {bookings.length === 0 ? (
          <div className={`mt-8 rounded-[24px] border border-dashed p-8 text-center ${isLight ? "border-neutral-900/12 bg-[#FFF9F3] text-neutral-600" : "border-white/10 bg-black/20 text-white/60"}`}>
            No bookings yet. Start by booking a bus, train, or cab.
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {bookings.map((booking) => {
              const Icon = iconMap[booking.type] || Ticket;
              const isCancelled = booking.status === "cancelled";
              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-[24px] border p-6 ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"} ${isCancelled ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isCancelled ? "bg-neutral-200 text-neutral-400" : "saffron-gradient text-neutral-950"}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold uppercase ${isLight ? "text-neutral-500" : "text-white/45"}`}>
                            {booking.type}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            isCancelled
                              ? "bg-rose-100 text-rose-600"
                              : booking.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-neutral-100 text-neutral-600"
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <h3 className={`mt-2 font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                          {booking.transportName}
                        </h3>
                        <div className={`mt-2 space-y-1 text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#FF9933]" />
                            <span>{booking.source} → {booking.destination}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#FF9933]" />
                            <span>{booking.date}</span>
                          </div>
                          {booking.departureTime && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-[#FF9933]" />
                              <span>{booking.departureTime} - {booking.arrivalTime}</span>
                            </div>
                          )}
                          {booking.selectedSeats && booking.selectedSeats.length > 0 && (
                            <div>
                              <span>Seats: {booking.selectedSeats.join(", ")}</span>
                            </div>
                          )}
                        </div>
                        <p className={`mt-3 font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                          ₹{booking.totalPrice}
                        </p>
                        <p className={`text-xs ${isLight ? "text-neutral-500" : "text-white/45"}`}>
                          Booking ID: {booking.bookingId}
                        </p>
                      </div>
                    </div>
                    {!isCancelled && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default MyBookingsPage;
