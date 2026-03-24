require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const server = http.createServer(app);
const cron = require("node-cron");
const pool = require("./config/mysql.config");

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

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

app.use("/api", require("./routes/api"));

const { cloudinaryDelete } = require("./modules/schedulers");

cron.schedule("0 0 0 * * *", function () {
  cloudinaryDelete();
});

module.exports = server;
