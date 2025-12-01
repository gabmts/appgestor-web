require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      // arquivo do banco. Vai ficar na raiz do projeto
      filename: process.env.DB_FILE || path.join(__dirname, 'dev.sqlite3')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'migrations')
    }
  }
};
