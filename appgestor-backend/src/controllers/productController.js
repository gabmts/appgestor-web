// src/controllers/productController.js

const db = require('../config/db');

module.exports = {
  // ---------------------------------------------------------------------------
  // CRIAR PRODUTO (GESTOR)
  // POST /products
  // ---------------------------------------------------------------------------
  async create(req, res) {
    try {
      if (req.user.role !== 'GESTOR') {
        return res.status(403).json({ error: 'Apenas gestores podem cadastrar produtos' });
      }

      let {
        name,
        category,
        purchase_price,
        sale_price,
        stock_current,
        stock_min,
      } = req.body;

      // Normalizações básicas
      name = name?.trim();
      category = category?.trim() || null;

      if (!name || !purchase_price || !sale_price) {
        return res.status(400).json({
          error: 'Nome, preço de compra e preço de venda são obrigatórios',
        });
      }

      // Verifica se já existe um produto com esse nome exato
      const existing = await db('products').where({ name }).first();
      if (existing) {
        return res.status(400).json({ error: 'Já existe um produto com este nome.' });
      }

      // 1. INSERE O PRODUTO (Sem depender do retorno do ID)
      await db('products').insert({
        name,
        category,
        purchase_price,
        sale_price,
        stock_current: stock_current || 0,
        stock_min: stock_min || 0,
      });

      // 2. BUSCA O PRODUTO RECÉM-CRIADO PELO NOME (Garante o ID correto)
      const product = await db('products').where({ name }).first();

      return res.status(201).json({
        message: 'Produto criado com sucesso',
        product,
      });

    } catch (error) {
      console.error('Erro em create:', error);
      return res.status(500).json({ error: 'Erro ao criar produto' });
    }
  },

  // ---------------------------------------------------------------------------
  // LISTAR TODOS OS PRODUTOS
  // GET /products
  // ---------------------------------------------------------------------------
  async list(req, res) {
    try {
      const products = await db('products')
        .select('*')
        .orderBy('name', 'asc');

      return res.json(products);

    } catch (error) {
      console.error('Erro em list:', error);
      return res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  },

  // ---------------------------------------------------------------------------
  // ATUALIZAR PRODUTO (GESTOR)
  // PUT /products/:id
  // ---------------------------------------------------------------------------
  async update(req, res) {
    try {
      if (req.user.role !== 'GESTOR') {
        return res.status(403).json({ error: 'Apenas gestores podem editar produtos' });
      }

      const { id } = req.params;

      let {
        name,
        category,
        purchase_price,
        sale_price,
        stock_current,
        stock_min,
      } = req.body;

      const product = await db('products').where({ id }).first();

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      // Normalizações
      name = name?.trim() ?? product.name;
      category = category?.trim() ?? product.category;

      await db('products')
        .where({ id })
        .update({
          name,
          category,
          purchase_price: purchase_price ?? product.purchase_price,
          sale_price: sale_price ?? product.sale_price,
          stock_current: stock_current ?? product.stock_current,
          stock_min: stock_min ?? product.stock_min,
          updated_at: db.fn.now(),
        });

      const updated = await db('products').where({ id }).first();

      return res.json({
        message: 'Produto atualizado com sucesso',
        product: updated,
      });

    } catch (error) {
      console.error('Erro em update:', error);
      return res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  },

  // ---------------------------------------------------------------------------
  // EXCLUIR PRODUTO (GESTOR)
  // DELETE /products/:id
  // ---------------------------------------------------------------------------
  async remove(req, res) {
    try {
      if (req.user.role !== 'GESTOR') {
        return res.status(403).json({ error: 'Apenas gestores podem excluir produtos' });
      }

      const { id } = req.params;

      const product = await db('products').where({ id }).first();
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      // Verifica se existem vendas associadas
      const hasSales = await db('sales').where({ product_id: id }).first();
      if (hasSales) {
        return res.status(400).json({
          error: 'Não é possível excluir produto com vendas registradas.',
        });
      }

      await db('products').where({ id }).del();

      return res.json({ message: 'Produto excluído com sucesso' });

    } catch (error) {
      console.error('Erro em remove:', error);
      return res.status(500).json({ error: 'Erro ao excluir produto' });
    }
  },
};