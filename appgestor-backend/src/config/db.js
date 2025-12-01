const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: process.env.DB_FILE || path.join(__dirname, '..', '..', 'dev.sqlite3')
  },
  useNullAsDefault: true
});

module.exports = db;

// LOG DE TODAS AS QUERIES DO BANCO
db.on('query', (queryData) => {
  console.log("🟦 SQL EXECUTADO:", queryData.sql, queryData.bindings);
});

db.on('query-error', (err) => {
  console.error("❌ ERRO SQL:", err);
});
