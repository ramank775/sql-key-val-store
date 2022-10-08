const express = require('express');
const app = express();
const { db } = require('../db');
app.use(express.json());

function epoch() {
  return Math.floor(Date.now() / 1000);
}
app.use((req, res, next) => {
  console.log(`[${req.method}] [${req.path}]`);
  next();
})
app.get('/:key', async (req, res) => {
  const { key } = req.params;
  const curr_time = epoch();
  const query = 'SELECT key, value FROM stores WHERE key = $1 AND ttl > $2 Limit 1;';
  const result = await db.query(query, [key, curr_time]);
  const [response] = result.rows;
  return res.json(response);
});

app.put('/:key', async (req, res) => {
  const { key } = req.params
  const { value, ttl } = req.body
  const expire_at = epoch() + ttl;
  await db.query(`INSERT INTO stores (key, value, ttl) values($1, $2, $3) 
    ON CONFLICT(key) DO UPDATE SET value = $2, ttl = $3;`,
    [key, value, expire_at],
  );
  return res.sendStatus(200);
});

app.delete('/:key', async (req, res) => {
  const { key } = req.params;
  const curr_time = epoch();
  await db.query('UPDATE stores SET ttl = -1 WHERE key = $1 AND ttl > $2;', [key, curr_time]);
  return res.sendStatus(200);
});

app.put('/:key/ttl', async (req, res) => {
  const { key } = req.params;
  const { ttl } = req.body;
  const curr_time = epoch();
  const expire_at = curr_time + ttl;
  await db.query('UPDATE stores SET ttl = $2 WHERE key = $1 AND ttl > $2;', [key, expire_at, curr_time]);
  return res.sendStatus(200);
});

async function delete_tombstone() {
  console.log('Deleting tombstone');
  const curr_time = epoch();
  const query = 'DELETE FROM stores WHERE ttl <= $1;';
  await db.query(query, [curr_time]);
}

let tombstone_removal
async function setup() {
  await db.connect();
  tombstone_removal = setInterval(delete_tombstone, 10000);
}

async function close() {
  clearInterval(tombstone_removal);
  await db.end();
}

module.exports = {
  setup,
  instance: app,
  close,
}