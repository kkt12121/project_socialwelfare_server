const pool = require("../config/mysql.config");

exports.createNotice = async (user_id, title, content) => {
  const sql = "INSERT INTO notices (user_id, title, content) VALUES (?, ?, ?)";

  const [result] = await pool.execute(sql, [user_id, title, content]);

  return result;
};

exports.createNoticeImage = async (notice_id, images) => {
  const sql =
    "INSERT INTO notice_images (notice_id, public_id, image_url) VALUES ?";

  const values = images.map((img) => [notice_id, img.public_id, img.url]);

  await pool.query(sql, [values]);
};

exports.getNoticeById = async (id) => {
  const sql = "SELECT * FROM notices WHERE id = ?";

  const [rows] = await pool.execute(sql, [id]);

  return rows[0];
};

exports.getNoticeImageByNoticeId = async (id) => {
  const sql = "SELECT * FROM notice_images WHERE notice_id = ?";

  const [rows] = await pool.execute(sql, [id]);

  return rows;
};

exports.getNoticeImageById = async (id) => {
  const sql = "SELECT * FROM notice_images WHERE id = ?";

  const [rows] = await pool.execute(sql, [id]);

  return rows[0];
};

exports.deleteNoticeImage = async (id) => {
  const sql = "DELETE FROM notice_images WHERE id = ?";

  await pool.query(sql, [id]);
};

exports.getAllNotices = async () => {
  const sql = "SELECT * FROM notices";

  const [rows] = await pool.execute(sql);

  return rows;
};

exports.updateNotice = async (id, title, content) => {
  const sql = "UPDATE notices SET title = ?, content = ? WHERE id = ?";

  await pool.execute(sql, [title, content, id]);
};

exports.deleteNotice = async (id) => {
  const sql = "DELETE FROM notices WHERE id = ?";

  await pool.query(sql, [id]);
};
