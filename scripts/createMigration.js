const fs = require("fs");
const path = require("path");

const migrationName = process.argv[2];

if (!migrationName) {
    console.log("❌ Please provide a migration name.");
    console.log("Example: npm run migration create_users_table");
    process.exit(1);
}

const migrationsDir = path.join(__dirname, "..", "migrations");

// Create migrations folder if not exists
if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir);
}

// Get existing files
const files = fs.readdirSync(migrationsDir);

// Extract numbers
const numbers = files
    .map(file => {
        const match = file.match(/^(\d+)_/);
        return match ? parseInt(match[1], 10) : 0;
    })
    .filter(Boolean);

const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

// Pad number like 001, 002
const paddedNumber = String(nextNumber).padStart(3, "0");

const fileName = `${paddedNumber}_${migrationName}.sql`;
const filePath = path.join(migrationsDir, fileName);

// SQL template
const template = `-- Migration: ${migrationName}
-- Created at: ${new Date().toISOString()}

BEGIN;

-- Write your SQL here


COMMIT;
`;

fs.writeFileSync(filePath, template);

console.log(`✅ Migration created: migrations/${fileName}`);