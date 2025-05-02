// routes/regions.routes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // assuming this is mysql2/promise

router.get("/regions-ms", async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT REGION, QUANTITY FROM REGIONS_MS WHERE ISACTIVE = 1"
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;