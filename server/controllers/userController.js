const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role || "user",
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required ❌" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists ❌" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({ name, email, password: hashedPassword, role: "user" });

    res.status(201).json({
      message: "User registered successfully ",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error ❌", error });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required ❌" });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found " });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = generateToken(user);
    res.json({
      message: "Login successful ",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error ❌", error });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required ❌" });
    }

    const adminFromDb = await User.findOne({ email, role: "admin" });
    if (adminFromDb) {
      const isPasswordValid = await bcrypt.compare(password, adminFromDb.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }
      return res.json({
        message: "Admin login successful",
        token: generateToken(adminFromDb),
        user: {
          id: adminFromDb._id,
          name: adminFromDb.name,
          email: adminFromDb.email,
          role: adminFromDb.role,
        },
      });
    }

    const fallbackEmail = process.env.ADMIN_EMAIL || "admin@yatri.com";
    const fallbackPassword = process.env.ADMIN_PASSWORD || "admin123";
    if (email === fallbackEmail && password === fallbackPassword) {
      const fallbackAdmin = {
        _id: "admin-fallback",
        name: "YATRI Admin",
        email: fallbackEmail,
        role: "admin",
      };
      return res.json({
        message: "Admin login successful",
        token: generateToken(fallbackAdmin),
        user: {
          id: fallbackAdmin._id,
          name: fallbackAdmin.name,
          email: fallbackAdmin.email,
          role: fallbackAdmin.role,
        },
      });
    }

    return res.status(401).json({ message: "Invalid admin credentials" });
  } catch (error) {
    return res.status(500).json({ message: "Server error ❌", error });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users ❌" });
  }
};

module.exports = { registerUser, loginUser, adminLogin, getUsers };