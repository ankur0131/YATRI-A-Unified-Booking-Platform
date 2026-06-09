const Booking = require("../models/Booking");
const Bus = require("../models/Bus");
const Train = require("../models/Train");
const Cab = require("../models/Cab");

function resolveModel(type) {
  if (type === "bus") return Bus;
  if (type === "train") return Train;
  if (type === "cab") return Cab;
  return null;
}

function normalizeTrainPayload(payload) {
  const classes = Array.isArray(payload.classes) ? payload.classes : [];
  return {
    ...payload,
    classes: classes.map((item) => ({
      type: item.type,
      price: Number(item.price),
      availableSeats: Number(item.availableSeats),
    })),
  };
}

const getAllBookingsForAdmin = async (req, res) => {
  try {
    const { status, type, userEmail } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (userEmail) query.userEmail = { $regex: new RegExp(userEmail, "i") };

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    return res.json({ bookings });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

const getTransportsForAdmin = async (req, res) => {
  try {
    const { type } = req.query;
    const Model = resolveModel(type);
    if (!Model) {
      return res.status(400).json({ message: "Invalid transport type. Use bus/train/cab." });
    }
    const items = await Model.find({}).sort({ createdAt: -1 });
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch transports", error: error.message });
  }
};

const createTransportForAdmin = async (req, res) => {
  try {
    const { type } = req.params;
    const Model = resolveModel(type);
    if (!Model) {
      return res.status(400).json({ message: "Invalid transport type. Use bus/train/cab." });
    }

    const payload = type === "train" ? normalizeTrainPayload(req.body) : req.body;
    const created = await Model.create(payload);
    return res.status(201).json({ message: "Created successfully", item: created });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create transport", error: error.message });
  }
};

const updateTransportForAdmin = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = resolveModel(type);
    if (!Model) {
      return res.status(400).json({ message: "Invalid transport type. Use bus/train/cab." });
    }

    const payload = type === "train" ? normalizeTrainPayload(req.body) : req.body;
    const updated = await Model.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ message: "Transport not found" });
    }
    return res.json({ message: "Updated successfully", item: updated });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update transport", error: error.message });
  }
};

const deleteTransportForAdmin = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = resolveModel(type);
    if (!Model) {
      return res.status(400).json({ message: "Invalid transport type. Use bus/train/cab." });
    }

    const deleted = await Model.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Transport not found" });
    }
    return res.json({ message: "Deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete transport", error: error.message });
  }
};

module.exports = {
  getAllBookingsForAdmin,
  getTransportsForAdmin,
  createTransportForAdmin,
  updateTransportForAdmin,
  deleteTransportForAdmin,
};
