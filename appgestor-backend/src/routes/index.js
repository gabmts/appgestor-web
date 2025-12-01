// src/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const reportRoutes = require('./reportRoutes');
const salesRoutes = require('./salesRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/reports', reportRoutes);
router.use('/sales', salesRoutes);

module.exports = router;
