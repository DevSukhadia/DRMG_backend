// routes/regions.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/regions-ms", (req, res) => {
  const sql = "SELECT REGION, QUANTITY FROM REGIONS_MS WHERE ISACTIVE = 1";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

module.exports = router;
