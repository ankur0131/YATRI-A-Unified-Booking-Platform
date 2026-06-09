const Bus = require("../models/Bus");
const Train = require("../models/Train");
const Cab = require("../models/Cab");
const Booking = require("../models/Booking");

const getBookedSeats = async (type, transportId, date) => {
  if (!date) return [];
  const bookings = await Booking.find({
    type,
    transportId,
    date,
    status: "confirmed",
  }).select("selectedSeats");

  return [...new Set(bookings.flatMap((booking) => booking.selectedSeats || []))];
};

// Search buses
const searchBuses = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    // Require search parameters
    if (!from || !to) {
      return res.status(400).json({ 
        message: "Please enter source and destination to search",
        buses: []
      });
    }

    // Build query with filters
    const query = { availableSeats: { $gt: 0 } };
    if (from) query.from = { $regex: new RegExp(from, "i") };
    if (to) query.to = { $regex: new RegExp(to, "i") };

    const buses = await Bus.find(query).sort({ price: 1 });

    res.json({ buses });
  } catch (error) {
    res.status(500).json({ message: "Error searching buses", error });
  }
};

// Search trains
const searchTrains = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    // Require search parameters
    if (!from || !to) {
      return res.status(400).json({ 
        message: "Please enter source and destination to search",
        trains: []
      });
    }

    // Build query with filters
    const query = { "classes.availableSeats": { $gt: 0 } };
    if (from) query.from = { $regex: new RegExp(from, "i") };
    if (to) query.to = { $regex: new RegExp(to, "i") };

    const trains = await Train.find(query).sort({ "classes.0.price": 1 });

    res.json({ trains });
  } catch (error) {
    res.status(500).json({ message: "Error searching trains", error });
  }
};

// Search cabs
const searchCabs = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    // Require search parameters
    if (!from || !to) {
      return res.status(400).json({ 
        message: "Please enter source and destination to search",
        cabs: []
      });
    }

    // Build query with filters
    const query = { available: true };
    if (from) query.from = { $regex: new RegExp(from, "i") };
    if (to) query.to = { $regex: new RegExp(to, "i") };

    const cabs = await Cab.find(query).sort({ estimatedPrice: 1 });

    res.json({ cabs });
  } catch (error) {
    res.status(500).json({ message: "Error searching cabs", error });
  }
};

// Get single bus by ID
const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    const bookedSeats = await getBookedSeats("bus", req.params.id, req.query.date);
    res.json({ bus: { ...bus.toObject(), bookedSeats } });
  } catch (error) {
    res.status(500).json({ message: "Error fetching bus", error });
  }
};

// Get single train by ID
const getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    const bookedSeats = await getBookedSeats("train", req.params.id, req.query.date);
    res.json({ train: { ...train.toObject(), bookedSeats } });
  } catch (error) {
    res.status(500).json({ message: "Error fetching train", error });
  }
};

// Get single cab by ID
const getCabById = async (req, res) => {
  try {
    const cab = await Cab.findById(req.params.id);
    if (!cab) {
      return res.status(404).json({ message: "Cab not found" });
    }

    const bookedSeats = await getBookedSeats("cab", req.params.id, req.query.date);
    res.json({ cab: { ...cab.toObject(), bookedSeats } });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cab", error });
  }
};

// Initialize sample data
const initializeSampleData = async (req, res) => {
  try {
    // Clear existing data
    await Bus.deleteMany({});
    await Train.deleteMany({});
    await Cab.deleteMany({});
    
    console.log("Existing data cleared");

    // Sample buses - RedBus-like data
    const buses = [
      // Delhi to Mumbai routes
      {
        name: "Volvo Multi-Axle A/C Sleeper (2+1)",
        operator: "Himachal Volvo",
        type: "AC Sleeper",
        from: "Delhi",
        to: "Mumbai",
        departureTime: "21:00",
        arrivalTime: "07:00",
        duration: "10h",
        price: 1499,
        totalSeats: 36,
        availableSeats: 24,
        rating: 4.6,
        amenities: ["WiFi", "Charging Point", "Water Bottle", "Blanket", "Pillow", "Reading Light"]
      },
      {
        name: "Scania A/C Multi-Axle Sleeper",
        operator: "Neeta Tours and Travels",
        type: "AC Sleeper",
        from: "Delhi",
        to: "Mumbai",
        departureTime: "20:30",
        arrivalTime: "06:30",
        duration: "10h",
        price: 1899,
        totalSeats: 36,
        availableSeats: 18,
        rating: 4.8,
        amenities: ["WiFi", "Charging Point", "Meals", "Blanket", "Pillow", "Reading Light", "CCTV"]
      },
      {
        name: "Bharat Benz A/C Seater (2+2)",
        operator: "Paulo Travels",
        type: "AC Seater",
        from: "Delhi",
        to: "Mumbai",
        departureTime: "22:00",
        arrivalTime: "08:00",
        duration: "10h",
        price: 899,
        totalSeats: 40,
        availableSeats: 32,
        rating: 4.3,
        amenities: ["WiFi", "Charging Point", "Water Bottle", "Reading Light"]
      },
      // Mumbai to Pune routes
      {
        name: "Volvo Multi-Axle A/C Seater",
        operator: "Shivneri Travels",
        type: "AC Seater",
        from: "Mumbai",
        to: "Pune",
        departureTime: "06:30",
        arrivalTime: "09:30",
        duration: "3h",
        price: 450,
        totalSeats: 40,
        availableSeats: 28,
        rating: 4.5,
        amenities: ["WiFi", "Charging Point", "Water Bottle", "Reading Light"]
      },
      {
        name: "Mercedes Benz A/C Multi-Axle",
        operator: "Neeta Travels",
        type: "AC Seater",
        from: "Mumbai",
        to: "Pune",
        departureTime: "07:00",
        arrivalTime: "10:00",
        duration: "3h",
        price: 550,
        totalSeats: 36,
        availableSeats: 24,
        rating: 4.7,
        amenities: ["WiFi", "Charging Point", "Water Bottle", "Blanket", "Reading Light"]
      },
      {
        name: "Non A/C Seater (2+2)",
        operator: "City Link Travels",
        type: "Non-AC Seater",
        from: "Mumbai",
        to: "Pune",
        departureTime: "08:00",
        arrivalTime: "11:30",
        duration: "3.5h",
        price: 250,
        totalSeats: 42,
        availableSeats: 38,
        rating: 3.8,
        amenities: ["Water Bottle"]
      },
      // Bangalore to Chennai routes
      {
        name: "Volvo Multi-Axle A/C Sleeper",
        operator: "Kallada Travels",
        type: "AC Sleeper",
        from: "Bangalore",
        to: "Chennai",
        departureTime: "22:00",
        arrivalTime: "05:00",
        duration: "7h",
        price: 1299,
        totalSeats: 36,
        availableSeats: 22,
        rating: 4.4,
        amenities: ["WiFi", "Charging Point", "Water Bottle", "Blanket", "Pillow"]
      },
      {
        name: "Scania A/C Semi Sleeper",
        operator: "SRS Travels",
        type: "AC Semi-Sleeper",
        from: "Bangalore",
        to: "Chennai",
        departureTime: "23:00",
        arrivalTime: "06:00",
        duration: "7h",
        price: 799,
        totalSeats: 40,
        availableSeats: 30,
        rating: 4.2,
        amenities: ["WiFi", "Charging Point", "Water Bottle", "Reading Light"]
      },
      // Hyderabad to Bangalore routes
      {
        name: "Volvo Multi-Axle A/C Sleeper",
        operator: "Orange Travels",
        type: "AC Sleeper",
        from: "Hyderabad",
        to: "Bangalore",
        departureTime: "21:30",
        arrivalTime: "06:30",
        duration: "9h",
        price: 1399,
        totalSeats: 36,
        availableSeats: 20,
        rating: 4.5,
        amenities: ["WiFi", "Charging Point", "Water Bottle", "Blanket", "Pillow", "Reading Light"]
      },
      {
        name: "Bharat Benz A/C Seater",
        operator: "Morning Star Travels",
        type: "AC Seater",
        from: "Hyderabad",
        to: "Bangalore",
        departureTime: "22:00",
        arrivalTime: "07:00",
        duration: "9h",
        price: 849,
        totalSeats: 40,
        availableSeats: 28,
        rating: 4.3,
        amenities: ["WiFi", "Charging Point", "Water Bottle", "Reading Light"]
      },
      // Chennai to Hyderabad routes
      {
        name: "Volvo Multi-Axle A/C Sleeper",
        operator: "KPN Travels",
        type: "AC Sleeper",
        from: "Chennai",
        to: "Hyderabad",
        departureTime: "20:00",
        arrivalTime: "05:00",
        duration: "9h",
        price: 1349,
        totalSeats: 36,
        availableSeats: 26,
        rating: 4.6,
        amenities: ["WiFi", "Charging Point", "Water Bottle", "Blanket", "Pillow"]
      },
      {
        name: "Scania A/C Multi-Axle",
        operator: "Parveen Travels",
        type: "AC Seater",
        from: "Chennai",
        to: "Hyderabad",
        departureTime: "21:00",
        arrivalTime: "06:00",
        duration: "9h",
        price: 999,
        totalSeats: 40,
        availableSeats: 32,
        rating: 4.4,
        amenities: ["WiFi", "Charging Point", "Meals", "Water Bottle", "Reading Light"]
      },
      // Delhi to Jaipur routes
      {
        name: "Volvo Multi-Axle A/C Seater",
        operator: "VRL Travels",
        type: "AC Seater",
        from: "Delhi",
        to: "Jaipur",
        departureTime: "06:00",
        arrivalTime: "10:30",
        duration: "4.5h",
        price: 499,
        totalSeats: 40,
        availableSeats: 35,
        rating: 4.4,
        amenities: ["WiFi", "Charging Point", "Water Bottle", "Reading Light"]
      },
      {
        name: "Mercedes Benz A/C Seater",
        operator: "Rajat Rani Tourist",
        type: "AC Seater",
        from: "Delhi",
        to: "Jaipur",
        departureTime: "07:30",
        arrivalTime: "12:00",
        duration: "4.5h",
        price: 649,
        totalSeats: 36,
        availableSeats: 28,
        rating: 4.5,
        amenities: ["WiFi", "Charging Point", "Water Bottle", "Blanket"]
      },
      // Pune to Mumbai routes
      {
        name: "Volvo Multi-Axle A/C Seater",
        operator: "Shivneri Travels",
        type: "AC Seater",
        from: "Pune",
        to: "Mumbai",
        departureTime: "14:00",
        arrivalTime: "17:00",
        duration: "3h",
        price: 450,
        totalSeats: 40,
        availableSeats: 30,
        rating: 4.5,
        amenities: ["WiFi", "Charging Point", "Water Bottle", "Reading Light"]
      },
      {
        name: "Mini A/C Seater",
        operator: "City Link Travels",
        type: "AC Seater",
        from: "Pune",
        to: "Mumbai",
        departureTime: "15:30",
        arrivalTime: "18:30",
        duration: "3h",
        price: 350,
        totalSeats: 18,
        availableSeats: 15,
        rating: 4.1,
        amenities: ["Charging Point", "Water Bottle"]
      }
    ];

    // Sample trains - Indian Railways data
    const trains = [
      // Mumbai to Delhi routes
      {
        name: "Mumbai Rajdhani Express",
        number: "12952",
        from: "Mumbai",
        to: "Delhi",
        departureTime: "17:00",
        arrivalTime: "08:30",
        duration: "15h 30m",
        classes: [
          { type: "1A", price: 3850, availableSeats: 8 },
          { type: "2A", price: 2450, availableSeats: 32 },
          { type: "3A", price: 1650, availableSeats: 98 }
        ],
        rating: 4.7,
        amenities: ["Pantry", "WiFi", "Charging Point", "CCTV"]
      },
      {
        name: "Mumbai Duronto Express",
        number: "12290",
        from: "Mumbai",
        to: "Delhi",
        departureTime: "20:15",
        arrivalTime: "11:45",
        duration: "15h 30m",
        classes: [
          { type: "1A", price: 4200, availableSeats: 6 },
          { type: "2A", price: 2650, availableSeats: 28 },
          { type: "3A", price: 1750, availableSeats: 85 },
          { type: "Sleeper", price: 650, availableSeats: 180 }
        ],
        rating: 4.5,
        amenities: ["Pantry", "Charging Point", "CCTV"]
      },
      {
        name: "August Kranti Express",
        number: "12954",
        from: "Mumbai",
        to: "Delhi",
        departureTime: "17:40",
        arrivalTime: "10:30",
        duration: "16h 50m",
        classes: [
          { type: "1A", price: 3550, availableSeats: 10 },
          { type: "2A", price: 2250, availableSeats: 40 },
          { type: "3A", price: 1550, availableSeats: 110 },
          { type: "Sleeper", price: 580, availableSeats: 220 }
        ],
        rating: 4.3,
        amenities: ["Pantry", "Charging Point"]
      },
      // Chennai to Bangalore routes
      {
        name: "Chennai Shatabdi Express",
        number: "12028",
        from: "Chennai",
        to: "Bangalore",
        departureTime: "06:00",
        arrivalTime: "10:50",
        duration: "4h 50m",
        classes: [
          { type: "CC", price: 1350, availableSeats: 125 },
          { type: "2S", price: 680, availableSeats: 280 }
        ],
        rating: 4.6,
        amenities: ["Pantry", "WiFi"]
      },
      {
        name: "Brindavan Express",
        number: "12640",
        from: "Chennai",
        to: "Bangalore",
        departureTime: "07:50",
        arrivalTime: "14:30",
        duration: "6h 40m",
        classes: [
          { type: "1A", price: 1850, availableSeats: 12 },
          { type: "2A", price: 1150, availableSeats: 45 },
          { type: "3A", price: 850, availableSeats: 120 },
          { type: "Sleeper", price: 320, availableSeats: 250 }
        ],
        rating: 4.4,
        amenities: ["Pantry", "Charging Point"]
      },
      {
        name: "Lalbagh Express",
        number: "12608",
        from: "Chennai",
        to: "Bangalore",
        departureTime: "15:30",
        arrivalTime: "22:00",
        duration: "6h 30m",
        classes: [
          { type: "2A", price: 1200, availableSeats: 38 },
          { type: "3A", price: 880, availableSeats: 95 },
          { type: "Sleeper", price: 340, availableSeats: 210 }
        ],
        rating: 4.2,
        amenities: ["Pantry"]
      },
      // Delhi to Chennai routes
      {
        name: "Grand Trunk Express",
        number: "12642",
        from: "Delhi",
        to: "Chennai",
        departureTime: "16:10",
        arrivalTime: "06:10",
        duration: "38h",
        classes: [
          { type: "1A", price: 4500, availableSeats: 8 },
          { type: "2A", price: 2850, availableSeats: 35 },
          { type: "3A", price: 1950, availableSeats: 100 },
          { type: "Sleeper", price: 750, availableSeats: 200 }
        ],
        rating: 4.1,
        amenities: ["Pantry", "Charging Point"]
      },
      {
        name: "Tamil Nadu Express",
        number: "12622",
        from: "Delhi",
        to: "Chennai",
        departureTime: "22:30",
        arrivalTime: "07:10",
        duration: "32h 40m",
        classes: [
          { type: "1A", price: 4300, availableSeats: 10 },
          { type: "2A", price: 2750, availableSeats: 42 },
          { type: "3A", price: 1850, availableSeats: 115 },
          { type: "Sleeper", price: 710, availableSeats: 230 }
        ],
        rating: 4.5,
        amenities: ["Pantry", "Charging Point", "CCTV"]
      },
      // New Delhi to Howrah routes
      {
        name: "Rajdhani Express",
        number: "12302",
        from: "New Delhi",
        to: "Howrah",
        departureTime: "16:55",
        arrivalTime: "09:55",
        duration: "17h",
        classes: [
          { type: "1A", price: 4650, availableSeats: 12 },
          { type: "2A", price: 3050, availableSeats: 48 },
          { type: "3A", price: 1950, availableSeats: 140 }
        ],
        rating: 4.8,
        amenities: ["Pantry", "WiFi", "Charging Point", "CCTV"]
      },
      {
        name: "Duronto Express",
        number: "12260",
        from: "New Delhi",
        to: "Howrah",
        departureTime: "20:10",
        arrivalTime: "14:10",
        duration: "18h",
        classes: [
          { type: "1A", price: 4850, availableSeats: 6 },
          { type: "2A", price: 3200, availableSeats: 30 },
          { type: "3A", price: 2050, availableSeats: 95 },
          { type: "Sleeper", price: 780, availableSeats: 190 }
        ],
        rating: 4.6,
        amenities: ["Pantry", "Charging Point", "CCTV"]
      },
      // Hyderabad to Bangalore routes
      {
        name: "Shatabdi Express",
        number: "12024",
        from: "Hyderabad",
        to: "Bangalore",
        departureTime: "06:25",
        arrivalTime: "12:50",
        duration: "6h 25m",
        classes: [
          { type: "CC", price: 1450, availableSeats: 110 },
          { type: "2S", price: 720, availableSeats: 260 }
        ],
        rating: 4.5,
        amenities: ["Pantry", "WiFi"]
      },
      {
        name: "Kacheguda Express",
        number: "12786",
        from: "Hyderabad",
        to: "Bangalore",
        departureTime: "18:20",
        arrivalTime: "06:00",
        duration: "11h 40m",
        classes: [
          { type: "1A", price: 2200, availableSeats: 8 },
          { type: "2A", price: 1400, availableSeats: 35 },
          { type: "3A", price: 950, availableSeats: 100 },
          { type: "Sleeper", price: 360, availableSeats: 200 }
        ],
        rating: 4.2,
        amenities: ["Pantry", "Charging Point"]
      }
    ];

    // Sample cabs - Cab booking data
    const cabs = [
      // Delhi to Noida routes
      {
        type: "Hatchback (Mini)",
        from: "Delhi",
        to: "Noida",
        pricePerKm: 10,
        estimatedDistance: 25,
        estimatedPrice: 300,
        estimatedDuration: "45m",
        driverRating: 4.3,
        features: ["AC", "4 Seats", "1 Luggage"],
        available: true
      },
      {
        type: "Sedan (Dzire/Etios)",
        from: "Delhi",
        to: "Noida",
        pricePerKm: 12,
        estimatedDistance: 25,
        estimatedPrice: 360,
        estimatedDuration: "45m",
        driverRating: 4.5,
        features: ["AC", "4 Seats", "2 Luggage", "Spacious"],
        available: true
      },
      {
        type: "SUV (Ertiga/Innova)",
        from: "Delhi",
        to: "Noida",
        pricePerKm: 16,
        estimatedDistance: 25,
        estimatedPrice: 480,
        estimatedDuration: "45m",
        driverRating: 4.7,
        features: ["AC", "6 Seats", "3 Luggage", "Spacious", "Premium"],
        available: true
      },
      // Delhi to Gurgaon routes
      {
        type: "Hatchback (Mini)",
        from: "Delhi",
        to: "Gurgaon",
        pricePerKm: 11,
        estimatedDistance: 30,
        estimatedPrice: 396,
        estimatedDuration: "1h",
        driverRating: 4.4,
        features: ["AC", "4 Seats", "1 Luggage"],
        available: true
      },
      {
        type: "Sedan (Dzire/Etios)",
        from: "Delhi",
        to: "Gurgaon",
        pricePerKm: 14,
        estimatedDistance: 30,
        estimatedPrice: 504,
        estimatedDuration: "1h",
        driverRating: 4.6,
        features: ["AC", "4 Seats", "2 Luggage", "Spacious"],
        available: true
      },
      {
        type: "SUV (Ertiga/Innova)",
        from: "Delhi",
        to: "Gurgaon",
        pricePerKm: 18,
        estimatedDistance: 30,
        estimatedPrice: 648,
        estimatedDuration: "1h",
        driverRating: 4.8,
        features: ["AC", "6 Seats", "3 Luggage", "Spacious", "Premium"],
        available: true
      },
      // Mumbai to Pune routes
      {
        type: "Hatchback (Mini)",
        from: "Mumbai",
        to: "Pune",
        pricePerKm: 13,
        estimatedDistance: 150,
        estimatedPrice: 2340,
        estimatedDuration: "3h",
        driverRating: 4.4,
        features: ["AC", "4 Seats", "1 Luggage"],
        available: true
      },
      {
        type: "Sedan (Dzire/Etios)",
        from: "Mumbai",
        to: "Pune",
        pricePerKm: 16,
        estimatedDistance: 150,
        estimatedPrice: 2880,
        estimatedDuration: "3h",
        driverRating: 4.6,
        features: ["AC", "4 Seats", "2 Luggage", "Spacious"],
        available: true
      },
      {
        type: "SUV (Ertiga/Innova)",
        from: "Mumbai",
        to: "Pune",
        pricePerKm: 22,
        estimatedDistance: 150,
        estimatedPrice: 3960,
        estimatedDuration: "3h",
        driverRating: 4.8,
        features: ["AC", "6 Seats", "3 Luggage", "Spacious", "Premium"],
        available: true
      },
      {
        type: "Innova Crysta",
        from: "Mumbai",
        to: "Pune",
        pricePerKm: 26,
        estimatedDistance: 150,
        estimatedPrice: 4680,
        estimatedDuration: "2.5h",
        driverRating: 4.9,
        features: ["AC", "7 Seats", "4 Luggage", "Luxury", "Premium"],
        available: true
      },
      // Bangalore to Chennai routes
      {
        type: "Hatchback (Mini)",
        from: "Bangalore",
        to: "Chennai",
        pricePerKm: 15,
        estimatedDistance: 350,
        estimatedPrice: 6300,
        estimatedDuration: "7h",
        driverRating: 4.5,
        features: ["AC", "4 Seats", "1 Luggage"],
        available: true
      },
      {
        type: "Sedan (Dzire/Etios)",
        from: "Bangalore",
        to: "Chennai",
        pricePerKm: 19,
        estimatedDistance: 350,
        estimatedPrice: 7980,
        estimatedDuration: "7h",
        driverRating: 4.7,
        features: ["AC", "4 Seats", "2 Luggage", "Spacious"],
        available: true
      },
      {
        type: "SUV (Ertiga/Innova)",
        from: "Bangalore",
        to: "Chennai",
        pricePerKm: 26,
        estimatedDistance: 350,
        estimatedPrice: 10920,
        estimatedDuration: "6.5h",
        driverRating: 4.9,
        features: ["AC", "6 Seats", "3 Luggage", "Spacious", "Premium"],
        available: true
      },
      {
        type: "Innova Crysta",
        from: "Bangalore",
        to: "Chennai",
        pricePerKm: 30,
        estimatedDistance: 350,
        estimatedPrice: 12600,
        estimatedDuration: "6h",
        driverRating: 4.9,
        features: ["AC", "7 Seats", "4 Luggage", "Luxury", "Premium"],
        available: true
      },
      // Hyderabad to Bangalore routes
      {
        type: "Hatchback (Mini)",
        from: "Hyderabad",
        to: "Bangalore",
        pricePerKm: 14,
        estimatedDistance: 575,
        estimatedPrice: 9100,
        estimatedDuration: "8h",
        driverRating: 4.4,
        features: ["AC", "4 Seats", "1 Luggage"],
        available: true
      },
      {
        type: "Sedan (Dzire/Etios)",
        from: "Hyderabad",
        to: "Bangalore",
        pricePerKm: 18,
        estimatedDistance: 575,
        estimatedPrice: 11700,
        estimatedDuration: "7.5h",
        driverRating: 4.6,
        features: ["AC", "4 Seats", "2 Luggage", "Spacious"],
        available: true
      },
      {
        type: "SUV (Ertiga/Innova)",
        from: "Hyderabad",
        to: "Bangalore",
        pricePerKm: 24,
        estimatedDistance: 575,
        estimatedPrice: 15600,
        estimatedDuration: "7h",
        driverRating: 4.8,
        features: ["AC", "6 Seats", "3 Luggage", "Spacious", "Premium"],
        available: true
      },
      // Chennai to Hyderabad routes
      {
        type: "Hatchback (Mini)",
        from: "Chennai",
        to: "Hyderabad",
        pricePerKm: 14,
        estimatedDistance: 625,
        estimatedPrice: 9875,
        estimatedDuration: "8.5h",
        driverRating: 4.5,
        features: ["AC", "4 Seats", "1 Luggage"],
        available: true
      },
      {
        type: "Sedan (Dzire/Etios)",
        from: "Chennai",
        to: "Hyderabad",
        pricePerKm: 18,
        estimatedDistance: 625,
        estimatedPrice: 12750,
        estimatedDuration: "8h",
        driverRating: 4.7,
        features: ["AC", "4 Seats", "2 Luggage", "Spacious"],
        available: true
      },
      {
        type: "SUV (Ertiga/Innova)",
        from: "Chennai",
        to: "Hyderabad",
        pricePerKm: 25,
        estimatedDistance: 625,
        estimatedPrice: 17625,
        estimatedDuration: "7.5h",
        driverRating: 4.9,
        features: ["AC", "6 Seats", "3 Luggage", "Spacious", "Premium"],
        available: true
      }
    ];

    await Bus.insertMany(buses);
    await Train.insertMany(trains);
    await Cab.insertMany(cabs);

    res.json({ 
      message: "Sample data initialized successfully",
      buses: buses.length,
      trains: trains.length,
      cabs: cabs.length
    });
  } catch (error) {
    res.status(500).json({ message: "Error initializing data", error });
  }
};

module.exports = {
  searchBuses,
  searchTrains,
  searchCabs,
  getBusById,
  getTrainById,
  getCabById,
  initializeSampleData
};
