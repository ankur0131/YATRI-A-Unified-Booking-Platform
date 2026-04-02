const express = require("express");
const router = express.Router();
const protect = require("../../middleware/authMiddleware");
const { createBooking, getBookings, cancelBooking } = require("../controllers/bookingController");

// Create booking
router.post("/",protect, createBooking);

// Get all bookings
router.get("/",protect, getBookings);
router.delete("/:id", protect, cancelBooking);

module.exports = router;