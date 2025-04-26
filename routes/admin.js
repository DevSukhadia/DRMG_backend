const express = require("express");
const db = require("../db");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Get all users (admin only)
router.get("/users", authenticateToken, authorizeRoles("admin"), async (req, res) => {
    try {
        const [users] = await db.execute("SELECT id, email, username, role, password FROM users WHERE status = 'active'");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user (admin only)
router.put("/users/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
    const { id } = req.params;
    const { email, username, role, password } = req.body;
  
    try {
      let query = "UPDATE users SET email = ?, username = ?, role = ?";
      let params = [email, username, role];
  
      if (password && password.trim() !== "") {
        const hashed = await bcrypt.hash(password, 10);
        query += ", password = ?";
        params.push(hashed);
      }
  
      query += " WHERE id = ?";
      params.push(id);
  
      await db.execute(query, params);
  
      res.json({ message: "User updated successfully" });
    } catch (err) {
      console.error("UPDATE USER ERROR:", err.message);
      res.status(500).json({ error: err.message });
    }
});

// ─── ADMIN: CREATE NEW USER ─────────────────────────────
router.post("/users", authenticateToken, authorizeRoles("admin"), async (req, res) => {
    console.log("Received body:", req.body);

    const { email, username, password, role } = req.body;
  
    try {
      const [exists] = await db.execute(
        "SELECT id FROM users WHERE email = ? OR username = ?",
        [email, username]
      );
      if (exists.length) {
        return res.status(409).json({ message: "Email or username already exists" });
      }
  
      const hashed = await bcrypt.hash(password, 10);
      await db.execute(
        "INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)",
        [email, username, hashed, role || "user"]
      );
      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// ───soft DELETE USER ────────────────────────────────
router.delete(
  "/users/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      await db.execute("UPDATE users SET status = 'inactive' WHERE id = ?", [id]);
      res.json({ message: "User marked as inactive successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
