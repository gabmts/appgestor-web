// src/routes/reportRoutes.js

const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// -----------------------------------------------------------------------------
// TODAS AS ROTAS DE RELATÓRIOS EXIGEM LOGIN
// -----------------------------------------------------------------------------
router.use(authMiddleware);

// -----------------------------------------------------------------------------
// TOP 3 PRODUTOS MAIS VENDIDOS
// GET /reports/top-products
// -----------------------------------------------------------------------------
router.get('/top-products', reportController.topProducts);

// -----------------------------------------------------------------------------
// ESTOQUE CRÍTICO / BAIXO
// GET /reports/low-stock
// -----------------------------------------------------------------------------
router.get('/low-stock', reportController.lowStock);

// -----------------------------------------------------------------------------
// ÚLTIMAS VENDAS REALIZADAS
// GET /reports/last-sales
// -----------------------------------------------------------------------------
router.get('/last-sales', reportController.lastSales);

// -----------------------------------------------------------------------------
// RELATÓRIO FINANCEIRO
// OBS: A checagem de role (GESTOR) ocorre no controller
// GET /reports/financial
// -----------------------------------------------------------------------------
router.get('/financial', reportController.financial);

module.exports = router;
