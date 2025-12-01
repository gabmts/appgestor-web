// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// -----------------------------------------------------------------------------
// REGISTRO DE USUÁRIO
// POST /auth/register
// -----------------------------------------------------------------------------
router.post('/register', authController.register);

// -----------------------------------------------------------------------------
// LOGIN
// POST /auth/login
// -----------------------------------------------------------------------------
router.post('/login', authController.login);

module.exports = router;
