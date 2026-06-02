require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();

  const result = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
  );

  console.log(result.rows);

  await client.end();
}

main().catch((err) => {
  console.error("DB error:", err.message);
});
