const pool = require("../config/mysql.config");

exports.createNotice = async (user_id, title, content) => {
  const sql = "INSERT INTO notices (user_id, title, content) VALUES (?, ?, ?)";

  const [result] = await pool.execute(sql, [user_id, title, content]);

  return result;
};

exports.createNoticeImage = async (public_id, image_url) => {
  const sql = "INSERT INTO notice_images (public_id, image_url) VALUES (?, ?)";

  const [result] = await pool.execute(sql, [public_id, image_url]);

  return result;
};

exports.updateNoticeImage = async (image_url, notice_id) => {
  const sql =
    "UPDATE notice_images SET notice_id = ?, visible = 1 WHERE image_url = ?";

  await pool.execute(sql, [notice_id, image_url]);
};

exports.updateNoticeImageVisible = async (imageArr, notice_id) => {
  const placeholders = imageArr.map(() => "?").join(",");

  const sql = `
    UPDATE notice_images
    SET visible = 0
    WHERE notice_id = ?
    AND image_url NOT IN (${placeholders})
  `;

  await pool.execute(sql, [notice_id, ...imageArr]);
};

exports.getNoticeById = async (id) => {
  const sql = "SELECT * FROM notices WHERE id = ?";

  const [rows] = await pool.execute(sql, [id]);

  return rows[0];
};

exports.getAllNoticeImage = async () => {
  const sql = "SELECT * FROM notice_images";

  const [rows] = await pool.execute(sql);

  return rows;
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
  const sql = "SELECT * FROM notices ORDER BY id DESC";

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
