const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute("SELECT id, email, username, role FROM users WHERE status = 'active'");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, username, role, password } = req.body;

  try {
    let query = "UPDATE users SET email = ?, username = ?, role = ?";
    const params = [email, username, role];

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query += ", password = ?";
      params.push(hashed);
    }

    query += " WHERE id = ?";
    params.push(id);

    await db.execute(query, params);
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  const { email, username, password, role } = req.body;

  try {
    const [exists] = await db.execute("SELECT id FROM users WHERE email = ? OR username = ?", [email, username]);
    if (exists.length) {
      return res.status(409).json({ message: "Email or username already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.execute("INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)", [email, username, hashed, role || "user"]);
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deactivateUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute("UPDATE users SET status = 'inactive' WHERE id = ?", [id]);
    res.json({ message: "User marked as inactive successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  const [user] = await db.execute("SELECT id, role FROM users WHERE id = ?", [req.user.id]);
  res.json({ user: user[0] });
};
