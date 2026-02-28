require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const server = http.createServer(app);
const pool = require("./config/config");

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// db 연결 확인
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ DB 연결 성공!");
    connection.release();
  } catch (error) {
    console.error("❌ DB 연결 실패:", error.message);
  }
})();

// app.use("/api", require("./routes/api"));

module.exports = server;
