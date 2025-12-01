// src/routes/productRoutes.js

const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// -----------------------------------------------------------------------------
// TODAS AS ROTAS DE PRODUTO EXIGEM AUTENTICAÇÃO
// -----------------------------------------------------------------------------
router.use(authMiddleware);

// -----------------------------------------------------------------------------
// CRIAR PRODUTO
// POST /products
// -----------------------------------------------------------------------------
router.post('/', productController.create);

// -----------------------------------------------------------------------------
// LISTAR PRODUTOS
// GET /products
// -----------------------------------------------------------------------------
router.get('/', productController.list);

// -----------------------------------------------------------------------------
// ATUALIZAR PRODUTO
// PUT /products/:id
// -----------------------------------------------------------------------------
router.put('/:id', productController.update);

// -----------------------------------------------------------------------------
// EXCLUIR PRODUTO
// DELETE /products/:id
// -----------------------------------------------------------------------------
router.delete('/:id', productController.remove);

module.exports = router;
