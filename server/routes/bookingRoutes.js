const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createBooking, getBookings, getBookingById, cancelBooking } = require("../controllers/bookingController");

// Create booking
router.post("/", protect, createBooking);

// Get all bookings
router.get("/", protect, getBookings);

// Get single booking
router.get("/:id", protect, getBookingById);

// Cancel booking
router.delete("/:id", protect, cancelBooking);

module.exports = router;