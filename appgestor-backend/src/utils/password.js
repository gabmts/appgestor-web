// src/utils/password.js

const bcrypt = require('bcryptjs');

/**
 * Gera o hash da senha usando bcrypt.
 * Cost padrão: 10 rounds.
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compara uma senha em texto puro com o hash armazenado.
 * Retorna true/false.
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  hashPassword,
  comparePassword
};
