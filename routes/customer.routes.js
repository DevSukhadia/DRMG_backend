const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken } = require("../middleware/auth.middleware");

// Get customer by ID
router.get("/customers/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `SELECT c.*, p.PTAX 
       FROM customer c 
       LEFT JOIN province p ON c.CPROVINCE = p.PNAME 
       WHERE c.CID = ?`,
      [id]);
    
    if (result.length === 0) return res.status(404).json({ error: "Customer not found" });
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }

  db.query(
    `SELECT c.*, p.PTAX 
     FROM customer c 
     LEFT JOIN province p ON c.CPROVINCE = p.PNAME 
     WHERE c.CID = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: "Customer not found" });
      res.json(results[0]);
    }
  );
});

// Get all active customers
router.get("/customers", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM customer WHERE cisactive = 1 ORDER BY CCOMPANY, CNAME"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create new customer
router.post("/customers", authenticateToken, async (req, res) => {
  const {
    CCOMPANY, CNAME, CEMAIL, CNUMBER, CSTREET, CCITY, CPROVINCE, CPOSTALCODE
  } = req.body;

  // Validation
  if (!CCOMPANY || !CNAME || !CSTREET || !CCITY || !CEMAIL || !CNUMBER || !CPROVINCE || !CPOSTALCODE) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(CEMAIL)) {
    return res.status(400).json({ error: "Invalid email address" });
  }
  if (!/^\d{10,}$/.test(CNUMBER.replace(/\D/g, ""))) {
    return res.status(400).json({ error: "Invalid phone number" });
  }
  if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(CPOSTALCODE)) {
    return res.status(400).json({ error: "Invalid postal code" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO customer 
      (CCOMPANY, CNAME, CEMAIL, CNUMBER, CSTREET, CCITY, CPOSTALCODE, CPROVINCE, CISACTIVE)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [CCOMPANY, CNAME, CEMAIL, CNUMBER, CSTREET, CCITY, CPOSTALCODE, CPROVINCE]
    );

    const [customerRows] = await db.query(
      "SELECT * FROM customer WHERE CID = ?", [result.insertId]
    );

    res.json(customerRows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
