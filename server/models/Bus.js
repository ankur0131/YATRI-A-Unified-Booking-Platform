const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  name: { type: String, required: true },
  operator: { type: String, required: true },
  type: { type: String, enum: ["AC", "Non-AC", "Sleeper", "Seater", "AC Sleeper", "AC Seater", "Non-AC Seater", "AC Semi-Sleeper"], required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  rating: { type: Number, default: 4.0 },
  amenities: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Bus", busSchema);
