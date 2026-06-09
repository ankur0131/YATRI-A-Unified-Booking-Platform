const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String, required: true },
  classes: [{
    type: { type: String, enum: ["Sleeper", "3A", "2A", "1A", "CC", "2S"], required: true },
    price: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
  }],
  rating: { type: Number, default: 4.0 },
  amenities: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Train", trainSchema);
