const Booking = require("../models/Booking");
const Bus = require("../models/Bus");
const Train = require("../models/Train");
const { sendBookingConfirmation } = require("../utils/email");

// Create Booking
const createBooking = async (req, res) => {
  try {
    const {
      userName,
      userEmail,
      type,
      transportId,
      transportName,
      source,
      destination,
      date,
      departureTime,
      arrivalTime,
      duration,
      selectedSeats,
      passengers,
      passengerDetails,
      totalPrice,
      bookingClass
    } = req.body;

    // Use authenticated user ID from token
    const userId = req.user?.id || req.user?.userId;

    if (!userId || !type || !transportId || !source || !destination || !totalPrice || !date) {
      return res.status(400).json({ message: "All required fields must be provided ❌" });
    }

    const requestedSeats = Array.isArray(selectedSeats)
      ? selectedSeats.map((seat) => String(seat).trim()).filter(Boolean)
      : [];
    const seatCount = type === "cab"
      ? 1
      : (requestedSeats.length || Number(passengers) || 1);

    // Prevent double-booking of the same seat for same transport and travel date.
    // Applies to bus/train where seats are selected. Cab bookings are excluded.
    if (type !== "cab" && requestedSeats.length > 0) {
      const conflictingBookings = await Booking.find({
        type,
        transportId,
        date,
        status: "confirmed",
        selectedSeats: { $in: requestedSeats },
      }).select("selectedSeats bookingId");

      if (conflictingBookings.length > 0) {
        const alreadyBookedSeats = [
          ...new Set(
            conflictingBookings
              .flatMap((booking) => booking.selectedSeats || [])
              .filter((seat) => requestedSeats.includes(String(seat)))
          ),
        ];

        return res.status(409).json({
          message: `Seat(s) already booked: ${alreadyBookedSeats.join(", ")}`,
          conflictingSeats: alreadyBookedSeats,
        });
      }
    }

    // Keep transport inventory in sync with booking.
    if (type === "bus") {
      const bus = await Bus.findById(transportId);
      if (!bus) {
        return res.status(404).json({ message: "Bus not found ❌" });
      }
      if (bus.availableSeats < seatCount) {
        return res.status(409).json({ message: "Not enough seats available on this bus" });
      }
      bus.availableSeats -= seatCount;
      await bus.save();
    }

    if (type === "train") {
      const train = await Train.findById(transportId);
      if (!train) {
        return res.status(404).json({ message: "Train not found ❌" });
      }
      if (!bookingClass) {
        return res.status(400).json({ message: "Train class is required" });
      }
      const cls = train.classes.find((item) => item.type === bookingClass);
      if (!cls) {
        return res.status(404).json({ message: "Selected train class not found" });
      }
      if (cls.availableSeats < seatCount) {
        return res.status(409).json({ message: `Not enough seats in class ${bookingClass}` });
      }
      cls.availableSeats -= seatCount;
      await train.save();
    }

    // Generate unique booking ID
    const bookingId = `YAT${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const booking = await Booking.create({
      userId,
      userName: userName || req.user?.name || "User",
      userEmail: userEmail || req.user?.email || "user@example.com",
      type,
      transportId,
      transportName,
      source,
      destination,
      date,
      departureTime,
      arrivalTime,
      duration,
      selectedSeats: selectedSeats || [],
      passengers: passengers || 1,
      passengerDetails: Array.isArray(passengerDetails) ? passengerDetails : [],
      totalPrice,
      bookingId,
      class: bookingClass
    });

    const recipientEmails = new Set();
    recipientEmails.add(booking.userEmail);
    if (Array.isArray(booking.passengerDetails)) {
      booking.passengerDetails.forEach((passenger) => {
        if (passenger?.email) {
          recipientEmails.add(passenger.email);
        }
      });
    }

    const emailPromises = [...recipientEmails].map((email) =>
      sendBookingConfirmation({ email, booking })
    );

    const emailResults = await Promise.allSettled(emailPromises);
    const emailSent = emailResults.some(
      (result) => result.status === "fulfilled" && result.value === true
    );

    if (!emailSent) {
      console.warn("Booking confirmed but email notification could not be sent.");
      emailResults.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Email promise rejected for recipient ${[...recipientEmails][index]}:`, result.reason);
        }
      });
    }

    res.status(201).json({
      message: "Booking successful ✅",
      booking,
      emailNotificationSent: emailSent,
      emailDetails: emailResults.map((result, index) => ({
        email: [...recipientEmails][index],
        status: result.status,
        reason: result.status === "rejected" ? result.reason?.message || String(result.reason) : undefined,
      })),
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Server error ❌", error: error.message });
  }
};

// Get all bookings for a user
const getBookings = async (req, res) => {
  try {
    // Use authenticated user ID from token
    const userId = req.user?.id || req.user?.userId;
    const query = userId ? { userId } : {};
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings ❌" });
  }
};

// Get single booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found ❌" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking ❌" });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found ❌" });
    }

    if (booking.status === "cancelled") {
      return res.json({ message: "Booking already cancelled", booking });
    }

    const seatCount = booking.type === "cab"
      ? 1
      : ((Array.isArray(booking.selectedSeats) && booking.selectedSeats.length) || Number(booking.passengers) || 1);

    // Restore transport inventory when cancelling confirmed booking.
    if (booking.type === "bus") {
      const bus = await Bus.findById(booking.transportId);
      if (bus) {
        bus.availableSeats += seatCount;
        if (bus.availableSeats > bus.totalSeats) {
          bus.availableSeats = bus.totalSeats;
        }
        await bus.save();
      }
    }

    if (booking.type === "train") {
      const train = await Train.findById(booking.transportId);
      if (train && booking.class) {
        const cls = train.classes.find((item) => item.type === booking.class);
        if (cls) {
          cls.availableSeats += seatCount;
          await train.save();
        }
      }
    }

    // Update status to cancelled instead of deleting
    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled ✅", booking });

  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
};

module.exports = { createBooking, getBookings, getBookingById, cancelBooking };