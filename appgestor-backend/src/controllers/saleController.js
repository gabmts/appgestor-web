// src/controllers/saleController.js
// Controlador de vendas — compatível com SQLite e com cálculo dinâmico de preços

const db = require('../config/db');

/* ============================================================================
 * LISTAR VENDAS
 * GET /api/sales
 * Retorna:
 * - id, product_id
 * - nome do produto
 * - quantity
 * - unit_price (alias)
 * - total_value (alias)
 * ============================================================================ */
async function listSales(req, res) {
  try {
    const rows = await db('sales as s')
      .join('products as p', 'p.id', 's.product_id')
      .select(
        's.id',
        's.product_id',
        'p.name as product_name',
        's.quantity',
        's.created_at',
        db.raw('p.sale_price AS unit_price'),
        db.raw('(s.quantity * p.sale_price) AS total_value')
      )
      .orderBy('s.created_at', 'desc')
      .orderBy('s.id', 'desc');

    return res.json(rows);
  } catch (err) {
    console.error('Erro ao listar vendas:', err);
    return res.status(500).json({ error: 'Erro ao listar vendas' });
  }
}

/* ============================================================================
 * CRIAR VENDA
 * POST /api/sales
 * body: { product_id, quantity }
 *
 * Regras:
 * - Calcula total_price usando o product.sale_price
 * - Atualiza estoque
 * - Gera total_price REAL na tabela
 * ============================================================================ */
async function createSale(req, res) {
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || Number(quantity) <= 0) {
    return res
      .status(400)
      .json({ error: 'Produto e quantidade são obrigatórios' });
  }

  try {
    // 1) Buscar produto
    const product = await db('products')
      .select('id', 'name', 'sale_price', 'stock_current')
      .where({ id: product_id })
      .first();

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const qty = Number(quantity);

    // 2) Verificar estoque
    if (Number(product.stock_current) < qty) {
      return res.status(400).json({
        error: 'Estoque insuficiente para registrar a venda',
      });
    }

    // 3) Calcular preços
    const unitPrice = Number(product.sale_price);
    const totalPrice = unitPrice * qty;

    // 4) Inserir venda
    const insertIds = await db('sales').insert({
      product_id,
      quantity: qty,
      total_price: totalPrice,
      created_at: db.fn.now(),
    });

    const saleId = Array.isArray(insertIds) ? insertIds[0] : insertIds;

    // 5) Atualizar estoque
    await db('products')
      .where({ id: product_id })
      .update({
        stock_current: Number(product.stock_current) - qty,
        updated_at: db.fn.now(),
      });

    return res.status(201).json({
      message: 'Venda registrada com sucesso',
      sale: {
        id: saleId,
        product_id,
        product_name: product.name,
        quantity: qty,
        unit_price: unitPrice,
        total_price: totalPrice,
      },
    });
  } catch (err) {
    console.error('Erro ao criar venda:', err);
    return res.status(500).json({ error: 'Erro ao criar venda' });
  }
}

/* ============================================================================
 * ATUALIZAR VENDA
 * PUT /api/sales/:id
 * body: { product_id, quantity }
 *
 * Regras:
 * - devolve estoque da venda antiga
 * - debita estoque da nova configuração
 * - recalcula preço
 * ============================================================================ */
async function updateSale(req, res) {
  const { id } = req.params;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || Number(quantity) <= 0) {
    return res
      .status(400)
      .json({ error: 'Produto e quantidade são obrigatórios' });
  }

  try {
    // 1) Buscar venda antiga
    const oldSale = await db('sales').where({ id }).first();

    if (!oldSale) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    // 2) Buscar produto novo
    const product = await db('products')
      .select('id', 'name', 'sale_price', 'stock_current')
      .where({ id: product_id })
      .first();

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const newQty = Number(quantity);

    /* ===========================
     * 3) Ajuste de estoque
     * =========================== */
    if (oldSale.product_id !== Number(product_id)) {
      // devolve estoque ao produto antigo
      await db('products')
        .where({ id: oldSale.product_id })
        .increment('stock_current', oldSale.quantity);

      // verifica estoque do novo
      if (Number(product.stock_current) < newQty) {
        return res
          .status(400)
          .json({ error: 'Estoque insuficiente no novo produto' });
      }

      // debita estoque do novo produto
      await db('products')
        .where({ id: product_id })
        .decrement('stock_current', newQty);
    } else {
      // mesmo produto, só muda quantidade
      const diff = newQty - oldSale.quantity;

      if (diff > 0) {
        // precisa tirar mais estoque
        if (Number(product.stock_current) < diff) {
          return res.status(400).json({
            error: 'Estoque insuficiente para aumentar a quantidade',
          });
        }

        await db('products')
          .where({ id: product_id })
          .decrement('stock_current', diff);
      } else if (diff < 0) {
        // devolve ao estoque
        await db('products')
          .where({ id: product_id })
          .increment('stock_current', Math.abs(diff));
      }
    }

    /* ===========================
     * 4) Atualizar venda
     * =========================== */
    await db('sales')
      .where({ id })
      .update({
        product_id,
        quantity: newQty,
      });

    const unitPrice = Number(product.sale_price);
    const totalValue = unitPrice * newQty;

    return res.json({
      message: 'Venda atualizada com sucesso',
      sale: {
        id: Number(id),
        product_id,
        product_name: product.name,
        quantity: newQty,
        unit_price: unitPrice,
        total_value: totalValue,
      },
    });
  } catch (err) {
    console.error('Erro ao atualizar venda:', err);
    return res.status(500).json({ error: 'Erro ao atualizar venda' });
  }
}

/* ============================================================================
 * EXCLUIR VENDA
 * DELETE /api/sales/:id
 * Regras:
 * - devolve estoque
 * - exclui venda
 * ============================================================================ */
async function deleteSale(req, res) {
  const { id } = req.params;

  try {
    const sale = await db('sales')
      .select('product_id', 'quantity')
      .where({ id })
      .first();

    if (!sale) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    // devolve estoque
    await db('products')
      .where({ id: sale.product_id })
      .increment('stock_current', sale.quantity);

    // exclui venda
    await db('sales').where({ id }).del();

    return res.json({ message: 'Venda excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir venda:', err);
    return res.status(500).json({ error: 'Erro ao excluir venda' });
  }
}

module.exports = {
  listSales,
  createSale,
  updateSale,
  deleteSale,
};
