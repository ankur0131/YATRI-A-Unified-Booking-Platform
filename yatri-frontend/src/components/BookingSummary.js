import { motion } from "framer-motion";
import { Ticket, UserRound } from "lucide-react";
import { formatCurrency, formatType } from "../utils/booking";

function BookingSummary({ booking, seats, totalPrice, userDetails, theme, cta }) {
  const isLight = theme === "light";

  if (!booking) {
    return null;
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[28px] border p-6 ${isLight ? "border-neutral-900/8 bg-white/78" : "border-white/10 bg-white/5"} ${cta ? "lg:sticky lg:top-24" : ""}`}
    >
      <p className={`text-xs uppercase tracking-[0.28em] ${isLight ? "text-neutral-500" : "text-white/45"}`}>
        Summary
      </p>
      <h3 className={`mt-3 font-display text-2xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
        {booking.name}
      </h3>
      <p className={`mt-2 text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>
        {booking.from} to {booking.to} · {formatType(booking.type)}
      </p>

      <div className="mt-6 space-y-3">
        <div className={`rounded-2xl border p-4 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}>
          <div className="flex items-center gap-3">
            <Ticket className="h-4.5 w-4.5 text-[#FF9933]" />
            <div className="text-sm">
              <p className={isLight ? "text-neutral-900" : "text-white"}>{booking.departure} - {booking.arrival}</p>
              <p className={isLight ? "text-neutral-500" : "text-white/45"}>{booking.duration}</p>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl border p-4 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}>
          <p className={`text-sm ${isLight ? "text-neutral-600" : "text-white/55"}`}>Selected seats</p>
          <p className={`mt-2 font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
            {booking.type === "cab" ? "Cab booking" : seats.length ? seats.join(", ") : "No seats selected"}
          </p>
        </div>
        {userDetails ? (
          <div className={`rounded-2xl border p-4 ${isLight ? "border-neutral-900/8 bg-[#FFF9F3]" : "border-white/10 bg-black/20"}`}>
            <div className="flex items-center gap-3">
              <UserRound className="h-4.5 w-4.5 text-[#FF9933]" />
              <div className="text-sm">
                <p className={isLight ? "text-neutral-900" : "text-white"}>{userDetails.name || "Guest details pending"}</p>
                <p className={isLight ? "text-neutral-500" : "text-white/45"}>{userDetails.email || "No email yet"}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className={`mt-6 flex items-center justify-between rounded-2xl border px-4 py-4 ${isLight ? "border-neutral-900/8 bg-[#FFF3E0]" : "border-white/10 bg-[#FF9933]/8"}`}>
        <span className={`text-sm ${isLight ? "text-neutral-600" : "text-white/60"}`}>Total price</span>
        <span className={`font-display text-2xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
          {formatCurrency(totalPrice)}
        </span>
      </div>

      {cta || null}
    </motion.aside>
  );
}

export default BookingSummary;
