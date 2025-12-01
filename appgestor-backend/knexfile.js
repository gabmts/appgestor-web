require('dotenv').config();
const path = require('path');

module.exports = {
  // --------------------------------------------------------
  // AMBIENTE DE DESENVOLVIMENTO (Seu computador)
  // Usa SQLite para ser rápido e fácil.
  // --------------------------------------------------------
  development: {
    client: 'sqlite3',
    connection: {
      // O arquivo do banco fica na raiz do projeto backend
      filename: path.join(__dirname, 'dev.sqlite3')
    },
    useNullAsDefault: true, // Obrigatório para SQLite
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds') // Caso crie seeds no futuro
    },
    // Habilita chaves estrangeiras no SQLite
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  },

  // --------------------------------------------------------
  // AMBIENTE DE PRODUÇÃO (Render / Nuvem)
  // Usa PostgreSQL para performance e persistência real.
  // --------------------------------------------------------
  production: {
    client: 'pg', // Mudamos o cliente para Postgres
    connection: {
      connectionString: process.env.DATABASE_URL, // O Render fornece isso automaticamente
      ssl: { rejectUnauthorized: false } // Necessário para conexões seguras na nuvem
    },
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};