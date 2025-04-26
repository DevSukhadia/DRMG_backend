// const express = require("express");
// const router = express.Router();
// const db = require("../config/db");
// const { authenticateToken } = require("../middleware/auth.middleware");

// // Create Order
// router.post("/orders", authenticateToken, (req, res) => {
//   const { CId, ODate, rows } = req.body;

//   const orderSql = "INSERT INTO ORDERS (CID, ODATE) VALUES (?, ?)";
//   db.query(orderSql, [CId, ODate], (err, orderResult) => {
//     if (err) return res.status(500).json({ error: err });
//     const OId = orderResult.insertId;

//     const orderRowsData = rows.map(row => [
//       OId,
//       row.Month,
//       row.ProductType,
//       row.AdSize,
//       row.DeliveryType,
//       row.Qty,
//       row.Rate
//     ]);

//     const orderRowsSql = `
//       INSERT INTO ORDER_ROW (OID, MONTH, PRODUCTTYPE, ADSIZE, DELIVERYTYPE, QTY, RATE)
//       VALUES ?
//     `;
//     db.query(orderRowsSql, [orderRowsData], (err) => {
//       if (err) return res.status(500).json({ error: err });
//       res.json({ OId, message: "Order and rows saved!" });
//     });
//   });
// });

// // Update Order
// router.put("/orders/:orderId", authenticateToken, (req, res) => {
//   const { OId, CId, ODate, rows } = req.body;
//   db.query("UPDATE ORDERS SET CID = ?, ODATE = ? WHERE OID = ?", [CId, ODate, OId], err => {
//     if (err) return res.status(500).json({ error: err });
//     db.query("DELETE FROM ORDER_ROW WHERE OID = ?", [OId], err => {
//       if (err) return res.status(500).json({ error: err });
//       const orderRowsData = rows.map(row => [
//         OId,
//         row.Month,
//         row.ProductType,
//         row.AdSize,
//         row.DeliveryType,
//         row.Qty,
//         row.Rate
//       ]);
//       const sql = `
//         INSERT INTO ORDER_ROW (OID, MONTH, PRODUCTTYPE, ADSIZE, DELIVERYTYPE, QTY, RATE)
//         VALUES ?
//       `;
//       db.query(sql, [orderRowsData], err => {
//         if (err) return res.status(500).json({ error: err });
//         res.json({ message: "Order updated!" });
//       });
//     });
//   });
// });

// // Get order by id (+ customer info)
// router.get("/orders/:orderId", authenticateToken, (req, res) => {
//   const orderId = req.params.orderId;
//   const sql = `
//     SELECT o.*, c.CNAME, c.CSTREET, c.CCITY, c.CPROVINCE, c.CPOSTALCODE, c.CEMAIL, c.CNUMBER, c.CCOMPANY
//     FROM ORDERS o
//     JOIN CUSTOMER c ON o.CID = c.CID
//     WHERE o.OID = ?
//   `;
//   db.query(sql, [orderId], (err, orderResults) => {
//     if (err) return res.status(500).json({ error: err });
//     if (!orderResults.length) return res.status(404).json({ error: "Order not found" });

//     db.query("SELECT * FROM ORDER_ROW WHERE OID = ?", [orderId], (err, rowResults) => {
//       if (err) return res.status(500).json({ error: err });

//       res.json({
//         order: orderResults[0],
//         rows: rowResults
//       });
//     });
//   });
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken } = require("../middleware/auth.middleware");

// Create Order
router.post("/orders", authenticateToken, async (req, res) => {
  const { CId, ODate, rows } = req.body;
  try {
    const [orderResult] = await db.query(
      "INSERT INTO orders (CID, ODATE) VALUES (?, ?)",
      [CId, ODate]
    );
    const OId = orderResult.insertId;

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

    res.json({ OId, message: "Order and rows saved!" });
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

// Get order by id (+ customer info)
router.get("/orders/:orderId", authenticateToken, async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const [orderResults] = await db.query(
      `SELECT o.*, c.CNAME, c.CSTREET, c.CCITY, c.CPROVINCE, c.CPOSTALCODE, c.CEMAIL, c.CNUMBER, c.CCOMPANY
       FROM \`orders\` o
       JOIN customer c ON o.CID = c.CID
       WHERE o.OID = ?`,
      [orderId]
    );
    
    if (!orderResults.length) return res.status(404).json({ error: "Order not found" });

    const [rowResults] = await db.query(
      "SELECT * FROM order_row WHERE OID = ?", [orderId]
    );

    res.json({
      order: orderResults[0],
      rows: rowResults
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
