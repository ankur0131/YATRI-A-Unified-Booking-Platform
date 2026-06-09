const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  type: { type: String, enum: ["bus", "train", "cab"], required: true },
  transportId: { type: mongoose.Schema.Types.ObjectId, required: true },
  transportName: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  date: { type: String, required: true },
  departureTime: { type: String },
  arrivalTime: { type: String },
  duration: { type: String },
  selectedSeats: [{ type: String }],
  passengers: { type: Number, default: 1 },
  passengerDetails: [
    {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["confirmed", "cancelled", "completed"], default: "confirmed" },
  bookingId: { type: String, unique: true, required: true },
  class: { type: String }, // For trains
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);