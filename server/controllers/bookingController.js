const Booking = require("../models/Booking");

// Create Booking
const createBooking = async (req, res) => {
  try {
    const { type, source, destination, price, date } = req.body;

    if (!req.user?.id || !type || !source || !destination || !price || !date) {
      return res.status(400).json({ message: "All fields required ❌" });
    }

    const booking = await Booking.create({
      userId: req.user.id, 
      type,
      source,
      destination,
      price,
      date,
    });

    res.status(201).json({
      message: "Booking successful ✅",
      booking,
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Server error ❌" });
  }
};

// Get all bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings ❌" });
  }
};
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found ❌" });
    }

    // check ownership
   if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized ❌" });
    }

    await booking.deleteOne();

    res.json({ message: "Booking cancelled ✅" });

  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
};

module.exports = { createBooking, getBookings,cancelBooking };