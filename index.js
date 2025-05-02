const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const orderRoutes = require("./routes/order.routes");      
const customerRoutes = require("./routes/customer.routes");
const provinceRoutes = require("./routes/province.routes");
const regionRoutes = require("./routes/regions.routes");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", orderRoutes);      
app.use("/api", customerRoutes);   
app.use("/api", provinceRoutes);
app.use("/api", regionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
