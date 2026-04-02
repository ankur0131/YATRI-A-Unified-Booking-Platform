const User = require("../models/User");
const jwt = require("jsonwebtoken");

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

    // Create user
    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: "User registered successfully ✅",
      user,
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
      return res.status(404).json({ message: "User not found ❌" });
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password ❌" });
    }
     const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({
      message: "Login successful ✅",
      token,
      user,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error ❌", error });
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

module.exports = { registerUser, loginUser, getUsers };