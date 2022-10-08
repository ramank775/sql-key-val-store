const pg = require('pg');
const fs = require('fs');
const path = require('path');

const db = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  max: process.env.DB_POOL_SIZE || 10,
});

async function connect() {
  await db.connect();
}

async function setup() {
  await connect();
  const seed_script_path = path.join(__dirname, 'scripts/seed.sql');
  const query = fs.readFileSync(seed_script_path);
  await db.query(query.toString());
}

module.exports = {
  db,
  setup,
  connect,
}