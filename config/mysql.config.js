const mysql = require("mysql2/promise"); // Promise 버전 사용
require("dotenv").config();

console.log(
  "Connecting to:",
  process.env.DB_HOST,
  "Port:",
  process.env.DB_PORT,
);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
