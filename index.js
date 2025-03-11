const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: "*",
  credentials: true,
};
app.use(cors(corsOptions));
// app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
