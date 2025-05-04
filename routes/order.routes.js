const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken } = require("../middleware/auth.middleware");

router.post("/orders", authenticateToken, async (req, res) => {
  const { CId, ODate, rows, regionSelections = [], months = [] } = req.body;

  try {
    // Insert into orders
    const [orderResult] = await db.query(
      "INSERT INTO orders (CID, ODATE, USERID) VALUES (?, ?, ?)",
      [CId, ODate, req.user.id]
    );
    const OId = orderResult.insertId;

    // Insert into order_row
    const orderRowsData = rows.map(row => [
      OId,
      row.Month,
      row.ProductType,
      row.AdSize,
      row.DeliveryType,
      row.Qty,
      row.Rate
    ]);
    await db.query(
      `INSERT INTO order_row (OID, MONTH, PRODUCTTYPE, ADSIZE, DELIVERYTYPE, QTY, RATE) VALUES ?`,
      [orderRowsData]
    );

    // Insert into order_regions
    const orderRegionsData = [];
    regionSelections.forEach((regionList, idx) => {
      const monthLabel = months[idx];
      regionList.forEach(regionName => {
        orderRegionsData.push([OId, monthLabel, regionName]);
      });
    });

    if (orderRegionsData.length > 0) {
      await db.query(
        `INSERT INTO ORDER_REGIONS (OID, MONTH, REGION) VALUES ?`,
        [orderRegionsData]
      );
    }

    // res.json({ OId, message: "Order, rows, and regions saved!" });
    res.status(201).json({ OId: OId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update Order
router.put("/orders/:orderId", authenticateToken, async (req, res) => {
  const { OId, CId, ODate, rows } = req.body;
  try {
    await db.query("UPDATE orders SET CID = ?, ODATE = ? WHERE OID = ?", [CId, ODate, OId]);
    await db.query("DELETE FROM order_row WHERE OID = ?", [OId]);

    const orderRowsData = rows.map(row => [
      OId,
      row.Month,
      row.ProductType,
      row.AdSize,
      row.DeliveryType,
      row.Qty,
      row.Rate
    ]);
    await db.query(
      `INSERT INTO order_row (OID, MONTH, PRODUCTTYPE, ADSIZE, DELIVERYTYPE, QTY, RATE) VALUES ?`,
      [orderRowsData]
    );

    res.json({ message: "Order updated!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// router.get("/orders/:id", async (req, res) => {
//   const orderId = req.params.id;

//   try {
//     const [[order]] = await db.query(
//       "SELECT * FROM orders o JOIN customer c ON o.CID = c.CID WHERE OID = ?",
//       [orderId]
//     );

//     const [rows] = await db.query("SELECT * FROM order_row WHERE OID = ?", [orderId]);

//     const [regionRows] = await db.query(
//       "SELECT MONTH, REGION FROM ORDER_REGIONS WHERE OID = ?",
//       [orderId]
//     );

//     // Convert to format: Array(14).fill([]), with each index holding an array of regions
//     const months = rows.map(r => r.MONTH);
//     const regionSelections = months.map(month =>
//       regionRows
//         .filter(r => r.MONTH === month)
//         .map(r => r.REGION)
//     );

//     res.json({ order, rows, regionSelections });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// Fetch single order with region selections if MONEY SAVER
router.get("/orders/:orderId", authenticateToken, async (req, res) => {
  const orderId = req.params.orderId;

  console.log("Fetching order with ID:", orderId); // 👈 Log the orderId

  const orderQuery = `
    SELECT o.*, c.* 
    FROM orders o 
    JOIN customer c ON o.CID = c.CID 
    WHERE o.OID = ?`;

  const rowsQuery = `
    SELECT * FROM order_row WHERE OID = ? ORDER BY ROWID ASC`;

  const regionsQuery = `
    SELECT r.MONTH, GROUP_CONCAT(r.REGION) AS REGIONS
    FROM ORDER_REGIONS r 
    WHERE r.OID = ? 
    GROUP BY r.MONTH`;

  try {
    const [order] = await db.query(orderQuery, [orderId]);
    console.log("Fetched order:", order); // 👈 Log the fetched order

    const [rowResult] = await db.query(rowsQuery, [orderId]);
    console.log("Fetched rows:", rowResult); // 👈 Log the fetched rows

    const [regionResult] = await db.query(regionsQuery, [orderId]);
    console.log("Fetched regions:", regionResult); // 👈 Log the fetched regions
    
    const regionMap = {};
    for (const row of regionResult) {
      regionMap[row.MONTH] = row.REGIONS;
    }
  
    const rows = rowResult.map(row => {
      if (row.PRODUCTTYPE === "MONEY SAVER") {
        row.DELIVERYTYPE = regionMap[row.MONTH] || "";
      }
      return row;
    });
  
    console.log("rows with regions:", rows); // 👈 Log the rows with regions
  
    res.json({ order, rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }

  
});

router.get("/orders", authenticateToken, async (req, res) => {
  const user = req.user;

  const query = user.role === "admin"
    ? `SELECT o.OID, o.CID, o.USERID, o.ODATE, u.username AS createdBy, c.CCOMPANY 
       FROM orders o 
       JOIN customer c ON o.CID = c.CID 
       JOIN users u ON o.USERID = u.id
       ORDER BY o.ODATE DESC`
    : `SELECT o.OID, o.CID, o.USERID, o.ODATE, c.CCOMPANY 
       FROM orders o 
       JOIN customer c ON o.CID = c.CID 
       WHERE o.USERID = ?
       ORDER BY o.ODATE DESC`;

  const params = user.role === "admin" ? [] : [user.id];
  try {
    const [rows] = await db.query(query, params);
    console.log("Orders fetched:", rows); // 👈 Log the output

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;