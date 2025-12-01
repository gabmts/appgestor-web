// src/middleware/authMiddleware.js

const { verifyToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // ---------------------------------------------------------
  // Ausência do header Authorization
  // ---------------------------------------------------------
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');

  // ---------------------------------------------------------
  // Authorization precisa ter exatamente duas partes
  // Ex.: "Bearer tokenAqui"
  // ---------------------------------------------------------
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token malformado' });
  }

  const [scheme, token] = parts;

  // ---------------------------------------------------------
  // Validação do prefixo "Bearer"
  // ---------------------------------------------------------
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  // ---------------------------------------------------------
  // Validação do token em si
  // ---------------------------------------------------------
  try {
    const decoded = verifyToken(token);

    // Token decodificado → anexar usuário no request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    return next();

  } catch (error) {
    console.error('Erro ao validar token:', error);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

module.exports = authMiddleware;
