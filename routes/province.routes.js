// const express = require("express");
// const router = express.Router();
// const db = require("../config/db");
// const { authenticateToken } = require("../middleware/auth.middleware");

// router.get("/provinces", authenticateToken, (req, res) => {
//   db.query(
//     "SELECT * FROM PROVINCE ORDER BY PNAME",
//     (err, result) => {
//       if (err) return res.status(500).json({ error: err });
//       res.json(result);
//     }
//   );
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/provinces", authenticateToken, async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT * FROM province ORDER BY PNAME"
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
