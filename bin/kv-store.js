#! /usr/bin/env node

const app = require('../app');
const db = require('../db');
const dotenv = require('dotenv');
dotenv.config();

const command = process.argv[2];

function setup_resources() {
  db.setup()
    .then(() => {
      console.log('Database setup successfully!');
      process.exit(0);
    }).catch((err) => {
      console.error("Error while setting up database", err);
      process.exit(1);
    });
}

function help() {
  console.log("./kv-store.js [command] [args]");
  console.log("Command:");
  console.log("  help");
  console.log("  setup");
  console.log("  run [port]");
}

async function run() {
  const http = require('http');
  const port = process.argv[3] || 3000;
  await app.setup();
  const server = http.createServer(app.instance);
  server.listen(port, () => {
    console.log("KV Store api server started @ %s", server.address());
  });
  process.on('SIGINT', () => app.close());
  process.on('SIGTERM', () => app.close());
}

switch (command) {
  case 'setup':
    setup_resources();
    break;
  case 'run':
    run();
    break;
  default:
    help();
}

