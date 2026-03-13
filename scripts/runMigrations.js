const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const migrationsDir = path.join(__dirname, "..", "migrations");

async function runMigrations() {
    const client = new Client({
        host: "localhost",
        port: 5432,
        user: "root",
        password: "root",
        database: "budget_free_db",
    });

    await client.connect();

    // Create migrations table if not exists
    await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    );
  `);

    const executed = await client.query("SELECT filename FROM migrations");
    const executedFiles = executed.rows.map(r => r.filename);

    const files = fs
        .readdirSync(migrationsDir)
        .filter(f => f.endsWith(".sql"))
        .sort();

    for (const file of files) {
        if (!executedFiles.includes(file)) {
            console.log(`Running: ${file}`);

            const sql = fs.readFileSync(
                path.join(migrationsDir, file),
                "utf-8"
            );

            await client.query(sql);
            await client.query(
                "INSERT INTO migrations(filename) VALUES($1)",
                [file]
            );

            console.log(`✅ Done: ${file}`);
        }
    }

    await client.end();
    console.log("🚀 All migrations complete.");
}

runMigrations().catch(err => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
});