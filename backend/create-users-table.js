require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();

  await client.query(
    "CREATE TABLE IF NOT EXISTS users (" +
      "id SERIAL PRIMARY KEY, " +
      "full_name VARCHAR(100) NOT NULL, " +
      "email VARCHAR(150) UNIQUE NOT NULL, " +
      "password VARCHAR(255) NOT NULL, " +
      "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
    ");"
  );

  console.log("users table created successfully");

  await client.end();
}

main().catch((err) => {
  console.error("DB error:", err.message);
});
