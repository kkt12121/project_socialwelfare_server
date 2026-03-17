const pool = require("../config/config");
const bcrypt = require("bcrypt");

exports.createUser = async (
  name,
  email,
  password,
  birth,
  address,
  phone,
  gender,
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql =
    "INSERT INTO users (name, email, password, birth, address, phone, gender) VALUES (?, ?, ?, ?, ?, ?, ?)";

  const [result] = await pool.execute(sql, [
    name,
    email,
    hashedPassword,
    birth,
    address,
    phone,
    gender,
  ]);

  return result;
};

exports.getUserByEmail = async (email) => {
  const sql = "SELECT * FROM users WHERE email = ?";

  const [rows] = await pool.execute(sql, [email]);

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
