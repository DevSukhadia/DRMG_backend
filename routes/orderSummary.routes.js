const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken } = require("../middleware/auth.middleware");

// GET /api/order-summary?month=May&year=2025
router.get("/order-summary", async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ message: "Month and year are required" });

  const formatted = `${month.toUpperCase().substring(0, 3)} ${String(year).slice(-2)}`; // e.g., "May" + "2025" -> "MAY 25"

  const [rows] = await db.execute(`
    SELECT 
      c.CNAME AS clientName,
      c.CID,
      r.MONTH,
      SUM(r.QTY * r.RATE) AS total
    FROM order_row r
    JOIN orders o ON r.OID = o.OID
    JOIN customer c ON o.CID = c.CID
    WHERE r.MONTH = ? AND r.QTY > 0
    GROUP BY c.CID, r.MONTH
    ORDER BY c.CNAME ASC
  `, [formatted]);

  res.json(rows);
});

module.exports = router;
