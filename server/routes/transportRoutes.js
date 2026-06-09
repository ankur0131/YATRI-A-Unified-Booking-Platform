const express = require("express");
const router = express.Router();

const {
  searchBuses,
  searchTrains,
  searchCabs,
  getBusById,
  getTrainById,
  getCabById,
  initializeSampleData
} = require("../controllers/transportController");

// Search routes
router.get("/buses/search", searchBuses);
router.get("/trains/search", searchTrains);
router.get("/cabs/search", searchCabs);

// Get by ID routes
router.get("/buses/:id", getBusById);
router.get("/trains/:id", getTrainById);
router.get("/cabs/:id", getCabById);

// Initialize sample data
router.post("/initialize", initializeSampleData);

module.exports = router;
