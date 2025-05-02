const router = require("./order.routes");

router.get('/regions-ms', (req, res) => {
    db.query('SELECT * FROM REGIONS_MS WHERE ISACTIVE = 1', (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });
  
  module.exports = router;