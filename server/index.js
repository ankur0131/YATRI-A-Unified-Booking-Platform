
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Yatri Backend Running 🚀");
});

const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
 
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);

// Port
const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();