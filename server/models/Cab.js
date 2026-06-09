const mongoose = require("mongoose");

const cabSchema = new mongoose.Schema({
  type: { type: String, enum: ["Mini", "Sedan", "SUV", "Luxury", "Hatchback (Mini)", "Sedan (Dzire/Etios)", "SUV (Ertiga/Innova)", "Innova Crysta"], required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  pricePerKm: { type: Number, required: true },
  estimatedDistance: { type: Number, required: true },
  estimatedPrice: { type: Number, required: true },
  estimatedDuration: { type: String, required: true },
  driverRating: { type: Number, default: 4.0 },
  features: [{ type: String }],
  available: { type: Boolean, default: true },
  tripType: { type: String, enum: ["One-way", "Round-trip"], default: "One-way" },
}, { timestamps: true });

module.exports = mongoose.model("Cab", cabSchema);
