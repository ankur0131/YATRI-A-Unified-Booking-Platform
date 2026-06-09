export function generateBookingId() {
  return `YATRI-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now()
    .toString()
    .slice(-4)}`;
}

export function formatCurrency(value) {
  return `Rs. ${value}`;
}

export function formatType(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function seatPrice(basePrice) {
  return Math.round(basePrice / 10);
}

export function createSeatLayout() {
  const rows = ["A", "B", "C", "D"];
  return rows.flatMap((row) => Array.from({ length: 10 }, (_, index) => `${row}${index + 1}`));
}
