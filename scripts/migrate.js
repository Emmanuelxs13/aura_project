const fs = require("fs");
const path = require("path");
const { pool } = require("../config/database");

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "..", "db", "migrations");
  if (!fs.existsSync(migrationsDir)) {
    console.error("No migrations directory found:", migrationsDir);
    process.exit(1);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  if (files.length === 0) {
    console.log("No migration files found.");
    return;
  }

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, "utf8");
    if (!sql.trim()) continue;

    const client = await pool.connect();
    try {
      console.log(`Applying ${file}...`);
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
      console.log(`Applied ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`Failed to apply ${file}:`, err.message || err);
      client.release();
      process.exit(1);
    }
    client.release();
  }

  console.log("All migrations applied.");
  await pool.end();
}

runMigrations().catch((err) => {
  console.error("Migration runner failed:", err);
  process.exit(1);
});
