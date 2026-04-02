const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: String,
  type: String, // train / bus / cab
  source: String,
  destination: String,
  price: Number,
  date: String,
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);