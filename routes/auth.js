const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const router = express.Router();

require("dotenv").config();

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

  if (users.length === 0) return res.status(404).json({ message: "User not found" });

  const user = users[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.status(401).json({ message: "Incorrect password" });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token, role: user.role, username: user.username });
});

module.exports = router;
