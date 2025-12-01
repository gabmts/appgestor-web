// src/routes/salesRoutes.js

const express = require('express');
const router = express.Router();

const saleController = require('../controllers/saleController');
const authMiddleware = require('../middleware/authMiddleware');

// -----------------------------------------------------------------------------
// TODAS AS ROTAS DE VENDAS EXIGEM AUTENTICAÇÃO
// Base: /api/sales
// -----------------------------------------------------------------------------
router.use(authMiddleware);

// -----------------------------------------------------------------------------
// LISTAR VENDAS
// GET /api/sales
// -----------------------------------------------------------------------------
router.get('/', saleController.listSales);

// -----------------------------------------------------------------------------
// CRIAR VENDA
// POST /api/sales
// -----------------------------------------------------------------------------
router.post('/', saleController.createSale);

// -----------------------------------------------------------------------------
// ATUALIZAR VENDA
// PUT /api/sales/:id
// -----------------------------------------------------------------------------
router.put('/:id', saleController.updateSale);

// -----------------------------------------------------------------------------
// EXCLUIR VENDA
// DELETE /api/sales/:id
// -----------------------------------------------------------------------------
router.delete('/:id', saleController.deleteSale);

module.exports = router;
