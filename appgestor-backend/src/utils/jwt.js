// src/utils/jwt.js

const jwt = require('jsonwebtoken');

/**
 * Gera um JWT com dados essenciais do usuário.
 * Expira em 8 horas.
 */
function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado no ambiente.');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '8h',
    }
  );
}

/**
 * Valida e decodifica o token.
 * Se for inválido ou expirado, gera exceção.
 */
function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado no ambiente.');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  generateToken,
  verifyToken,
};
