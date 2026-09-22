const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const logger = require("morgan");
const mainRoute = require("./routes/index.js");
const port = 5000;

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not defined in .env");
  process.exit(1);
}

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to mongoDb");
  } catch (error) {
    throw error;
  }
};

// middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(cors());

app.use("/api", mainRoute);

app.listen(port, () => {
  connect();
  console.log(`Sunucu ${port} portunda çalışıyor.`);
});
