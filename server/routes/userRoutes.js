const express = require("express");
const router = express.Router();

const { registerUser, getUsers, loginUser } = require("../controllers/userController");

// POST → Register user
router.post("/register", registerUser);
router.post("/login", loginUser);
// GET → Get all users
router.get("/", getUsers);

module.exports = router;
 
 