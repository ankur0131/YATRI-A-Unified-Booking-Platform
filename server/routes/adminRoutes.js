const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAllBookingsForAdmin,
  getTransportsForAdmin,
  createTransportForAdmin,
  updateTransportForAdmin,
  deleteTransportForAdmin,
} = require("../controllers/adminController");

router.get("/bookings", protect, adminOnly, getAllBookingsForAdmin);
router.get("/transports", protect, adminOnly, getTransportsForAdmin);
router.post("/transports/:type", protect, adminOnly, createTransportForAdmin);
router.put("/transports/:type/:id", protect, adminOnly, updateTransportForAdmin);
router.delete("/transports/:type/:id", protect, adminOnly, deleteTransportForAdmin);

module.exports = router;
