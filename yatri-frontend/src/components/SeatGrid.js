import { motion } from "framer-motion";
import { createSeatLayout } from "../utils/booking";

const seatLayout = createSeatLayout();

function SeatGrid({ bookedSeats, selectedSeats, onToggle, theme, seatType = "seater" }) {
  const isLight = theme === "light";
  
  // Determine seat icon based on type
  const getSeatIcon = (seat) => {
    if (seatType === "sleeper") {
      return "💤";
    }
    return seat;
  };
  const bookedSeatsArray = bookedSeats || [];
  const selectedSeatsArray = selectedSeats || [];

  return (
    <div className="grid grid-cols-4 gap-3">
      {seatLayout.map((seat) => {
        const isBooked = bookedSeatsArray.includes(seat);
        const isSelected = selectedSeatsArray.includes(seat);
        return (
          <motion.button
            key={seat}
            whileTap={!isBooked ? { scale: 0.96 } : undefined}
            type="button"
            disabled={isBooked}
            onClick={() => onToggle(seat)}
            className={`rounded-2xl border px-3 py-4 text-sm font-semibold transition ${
              isBooked
                ? isLight
                  ? "cursor-not-allowed border-neutral-300 bg-neutral-200 text-neutral-400"
                  : "cursor-not-allowed border-white/8 bg-white/6 text-white/25"
                : isSelected
                  ? "border-[#FF9933]/30 bg-gradient-to-br from-[#FF9933] to-[#E65100] text-neutral-950 shadow-[0_14px_34px_rgba(255,153,51,0.24)]"
                  : isLight
                    ? "border-neutral-900/8 bg-white hover:border-[#FF9933]/30 hover:text-[#E65100]"
                    : "border-white/10 bg-white/5 text-white/80 hover:border-[#FF9933]/25 hover:text-[#FFCC80]"
            }`}
          >
            {getSeatIcon(seat)}
          </motion.button>
        );
      })}
    </div>
  );
}

export default SeatGrid;
