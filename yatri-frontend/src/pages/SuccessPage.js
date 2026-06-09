import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useBooking } from "../context/BookingContext";
import { formatCurrency, formatType } from "../utils/booking";

function SuccessPage({ theme, onToggleTheme, pushToast }) {
  const { latestBooking, markLatestBookingCancelled } = useBooking();
  const [isCancelling, setIsCancelling] = useState(false);
  const isLight = theme === "light";
  const isCancelled = latestBooking?.status === "cancelled";

  if (!latestBooking) {
    return <Navigate to="/" replace />;
  }

  const handleCancelBooking = async () => {
    if (isCancelled || isCancelling) return;
    const bookingId = latestBooking.backendBooking?._id;
    if (!bookingId) {
      pushToast?.({
        type: "error",
        title: "Unable to cancel",
        message: "Booking reference is missing.",
      });
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    setIsCancelling(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel booking");
      }

      markLatestBookingCancelled();
      pushToast?.({
        type: "success",
        title: "Booking cancelled",
        message: "Your booking has been cancelled successfully.",
      });
    } catch (error) {
      pushToast?.({
        type: "error",
        title: "Cancellation failed",
        message: error.message || "Unable to cancel booking.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <PageShell theme={theme} onToggleTheme={onToggleTheme}>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mx-auto max-w-3xl rounded-[32px] border p-8 text-center ${
          isLight ? "border-neutral-900/8 bg-white/80" : "border-white/10 bg-white/5"
        }`}
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FF9933]/14 text-[#FF9933]">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <p className={`mt-6 text-xs uppercase tracking-[0.32em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
          Success
        </p>
        <h1 className={`mt-3 font-display text-4xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
          Booking confirmed
        </h1>
        <p className={`mt-4 text-sm leading-7 ${isLight ? "text-neutral-600" : "text-white/60"}`}>
          Your booking ID is <span className="font-semibold text-[#FF9933]">{latestBooking.id}</span>
        </p>
        {isCancelled ? (
          <p className="mt-2 text-sm font-medium text-rose-500">This booking has been cancelled.</p>
        ) : null}

        <div className={`mt-8 rounded-[28px] border p-6 text-left ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className={isLight ? "text-neutral-500" : "text-white/45"}>Transport</p>
              <p className={`mt-1 font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                {formatType(latestBooking.type)}
              </p>
            </div>
            <div>
              <p className={isLight ? "text-neutral-500" : "text-white/45"}>Route</p>
              <p className={`mt-1 font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                {latestBooking.details.from} to {latestBooking.details.to}
              </p>
            </div>
            <div>
              <p className={isLight ? "text-neutral-500" : "text-white/45"}>Seats</p>
              <p className={`mt-1 font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                {latestBooking.type === "cab" ? "Cab booking" : latestBooking.seats.join(", ")}
              </p>
            </div>
            <div>
              <p className={isLight ? "text-neutral-500" : "text-white/45"}>Total</p>
              <p className={`mt-1 font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                {formatCurrency(latestBooking.totalPrice)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/booking" className="inline-flex rounded-2xl saffron-gradient px-5 py-3 text-sm font-semibold text-neutral-950">
            Add Booking
          </Link>
          {!isCancelled ? (
            <button
              type="button"
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className="inline-flex rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCancelling ? "Cancelling..." : "Cancel Booking"}
            </button>
          ) : null}
          <Link
            to="/"
            className={`inline-flex rounded-2xl border px-5 py-3 text-sm font-semibold ${
              isLight
                ? "border-neutral-900/10 bg-white text-neutral-800 hover:bg-neutral-50"
                : "border-white/20 bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            Go Home
          </Link>
        </div>
      </motion.section>
    </PageShell>
  );
}

export default SuccessPage;
