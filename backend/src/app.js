const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const devicesRoutes = require("./routes/devices");
const repairsRoutes = require("./routes/repairs");
const productsRoutes = require("./routes/products");
const salesRoutes = require("./routes/sales");
const suppliersRoutes = require("./routes/suppliers");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/repairs", repairsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/suppliers", suppliersRoutes);

app.get("/", (req, res) => {
  res.json({ message: "TechStock API çalışıyor" });
});

module.exports = app;
