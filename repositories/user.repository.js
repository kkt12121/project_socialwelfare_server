const pool = require("../config/mysql.config");
const bcrypt = require("bcrypt");

exports.createUser = async (name, birth, email, password, phone) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql =
    "INSERT INTO users (name, birth, email, password, phone) VALUES (?, ?, ?, ?, ?)";

  const [result] = await pool.execute(sql, [
    name,
    birth,
    email,
    hashedPassword,
    phone,
  ]);

  return result;
};

exports.getUserById = async (id) => {
  const sql = "SELECT id, name, email, super FROM users WHERE id = ?";

  const [rows] = await pool.execute(sql, [id]);

  return rows[0];
};

exports.getUserByEmail = async (email) => {
  const sql = "SELECT * FROM users WHERE email = ?";

  const [rows] = await pool.execute(sql, [email]);

  return rows[0];
};

exports.getUserIdByRefreshToken = async (id, token) => {
  const sql = "SELECT * FROM users WHERE id = ? AND refreshToken = ?";

  const [rows] = await pool.execute(sql, [id, token]);

  return rows[0];
};

exports.getAllUsers = async () => {
  const sql = "SELECT * FROM users";

  const [rows] = await pool.execute(sql);

  return rows;
};

exports.updateUser = async (id, data) => {
  const fields = [];
  const values = [];

  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }

  values.push(id);

  const sql = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  const [result] = await pool.execute(sql, values);

  return result;
};

exports.getUserTokenVerify = async (token) => {
  const sql =
    "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()";

  const [rows] = await pool.execute(sql, [token]);

  return rows[0];
};
