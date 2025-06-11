const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken } = require("../middleware/auth.middleware");

// POST /insight - Create or Update order_insight for a given OID
router.post("/insight", authenticateToken, async (req, res) => {
  const {
    OID,
    start_date,
    end_date,
    call_tracking_type,
    forward_calls_to,
    qr_code_type,
    scan_destination,
    email_results_to
  } = req.body;

  try {
    // Use null if a field is missing or empty
    const safeValues = [
      start_date || null,
      end_date || null,
      call_tracking_type || null,
      forward_calls_to || null,
      qr_code_type || null,
      scan_destination || null,
      email_results_to || null
    ];

    // Check if insight already exists for this order
    const [existing] = await db.query("SELECT * FROM order_insight WHERE OID = ?", [OID]);

    if (existing.length > 0) {
      // Update existing
      await db.query(`
        UPDATE order_insight SET
          start_date = ?, end_date = ?, call_tracking_type = ?, forward_calls_to = ?,
          qr_code_type = ?, scan_destination = ?, email_results_to = ?
        WHERE OID = ?
      `, [...safeValues, OID]);

      return res.json({ message: "Insight updated" });
    }

    // Insert new
    await db.query(`
      INSERT INTO order_insight (
        OID, start_date, end_date, call_tracking_type,
        forward_calls_to, qr_code_type, scan_destination, email_results_to
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [OID, ...safeValues]);

    res.status(201).json({ message: "Insight created" });

  } catch (err) {
    console.error("Insight POST error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /insight/:oid - Fetch insight by order ID
router.get("/insight/:oid", authenticateToken, async (req, res) => {
  const { oid } = req.params;

  try {
    const [rows] = await db.query("SELECT * FROM order_insight WHERE OID = ?", [oid]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Insight not found for this order" });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error("Insight GET error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
