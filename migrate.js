const fs = require("fs");
const path = require("path");
const pool = require("./config/config");

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function runMigrations() {
  const connection = await pool.getConnection();

  try {
    console.log("🔎 Checking migrations table...");
    await ensureMigrationsTable();

    const migrationDir = path.join(__dirname, "migrations");
    const files = fs.readdirSync(migrationDir).sort();

    const [rows] = await connection.query("SELECT name FROM migrations");

    const executed = rows.map((row) => row.name);

    for (const file of files) {
      if (!executed.includes(file)) {
        console.log(`🚀 Running migration: ${file}`);

        const sql = fs.readFileSync(path.join(migrationDir, file), "utf8");

        await connection.beginTransaction();

        try {
          await connection.query(sql);

          await connection.query("INSERT INTO migrations (name) VALUES (?)", [
            file,
          ]);

          await connection.commit();
          console.log(`✅ Completed: ${file}`);
        } catch (err) {
          await connection.rollback();
          console.error(`❌ Failed: ${file}`);
          throw err;
        }
      }
    }

    console.log("🎉 All migrations up to date!");
  } catch (error) {
    console.error("Migration error:", error.message);
  } finally {
    connection.release();
    process.exit();
  }
}

runMigrations();
