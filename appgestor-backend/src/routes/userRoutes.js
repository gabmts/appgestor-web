const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // sem (), importa a função

// rota protegida: precisa estar logado e com token válido
router.get('/me', authMiddleware, userController.me);

module.exports = router;
