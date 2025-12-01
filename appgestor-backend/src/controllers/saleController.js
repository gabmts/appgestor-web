// src/controllers/saleController.js
// Controlador de vendas — AGORA COM TRANSAÇÕES (ACID)

const db = require('../config/db');

// Funções utilitárias (mantidas)
// ...

/* ============================================================================
 * CRIAR VENDA (COM TRANSAÇÃO)
 * ============================================================================ */
async function createSale(req, res) {
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || Number(quantity) <= 0) {
    return res.status(400).json({ error: 'Produto e quantidade são obrigatórios' });
  }

  try {
    // 1) Inicia a Transação
    const result = await db.transaction(async (trx) => {
      
      // 1.1) Buscar produto (usando trx)
      const product = await trx('products')
        .select('id', 'name', 'sale_price', 'stock_current')
        .where({ id: product_id })
        .first();

      if (!product) {
        throw new Error('Produto não encontrado');
      }

      const qty = Number(quantity);

      // 1.2) Verificar estoque
      if (Number(product.stock_current) < qty) {
        throw new Error('Estoque insuficiente para registrar a venda');
      }

      // 1.3) Calcular preços
      const unitPrice = Number(product.sale_price);
      const totalPrice = unitPrice * qty;

      // 1.4) Inserir venda (usando trx e retornando dados)
      // Ajuste para compatibilidade Postgres (retornar a linha inserida)
      const insertedSales = await trx('sales').insert({
        product_id,
        quantity: qty,
        total_price: totalPrice,
        created_at: db.fn.now(),
      }).returning(['id', 'created_at']); // Retorna ID e data

      const newSale = insertedSales[0];

      // 1.5) Atualizar estoque (usando trx)
      await trx('products')
        .where({ id: product_id })
        .update({
          stock_current: Number(product.stock_current) - qty,
          updated_at: db.fn.now(),
        });
      
      // 1.6) Retornar resultado da transação
      return {
        id: newSale.id,
        product_id,
        product_name: product.name,
        quantity: qty,
        unit_price: unitPrice,
        total_price: totalPrice,
        created_at: newSale.created_at
      };
    });

    return res.status(201).json({
      message: 'Venda registrada com sucesso',
      sale: result,
    });
  } catch (err) {
    const status = err.message.includes('Estoque') || err.message.includes('Produto') ? 400 : 500;
    console.error('Erro ao criar venda:', err.message);
    return res.status(status).json({ error: err.message.includes('Estoque') ? err.message : 'Erro ao criar venda' });
  }
}

/* ============================================================================
 * ATUALIZAR VENDA (COM TRANSAÇÃO)
 * ============================================================================ */
async function updateSale(req, res) {
  const { id } = req.params;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || Number(quantity) <= 0) {
    return res.status(400).json({ error: 'Produto e quantidade são obrigatórios' });
  }

  try {
    const result = await db.transaction(async (trx) => {
      // 1) Buscar venda antiga
      const oldSale = await trx('sales').where({ id }).first();
      if (!oldSale) throw new Error('Venda não encontrada');

      // 2) Buscar produto atual (e novo, se for o caso)
      const product = await trx('products')
        .select('id', 'name', 'sale_price', 'stock_current')
        .where({ id: product_id })
        .first();
      if (!product) throw new Error('Produto não encontrado');

      const newQty = Number(quantity);
      let stockChange = 0; // Quantidade líquida a ser retirada (negativo) ou devolvida (positivo)

      if (oldSale.product_id !== Number(product_id)) {
        // A) Produto mudou: devolve o antigo e retira o novo
        await trx('products').where({ id: oldSale.product_id }).increment('stock_current', oldSale.quantity);
        stockChange = -newQty;
      } else {
        // B) Mesmo produto: calcula a diferença
        stockChange = oldSale.quantity - newQty; // Se positivo, devolve. Se negativo, retira.
      }
      
      // 3) Checagem de estoque após devolver o antigo
      if (stockChange < 0 && (Number(product.stock_current) + oldSale.quantity) < newQty) {
          throw new Error('Estoque insuficiente para a nova quantidade.');
      }

      // 4) Atualiza o estoque (calculando o saldo líquido)
      if (stockChange !== 0) {
        await trx('products')
          .where({ id: product_id })
          .increment('stock_current', stockChange); // Knex lida com incremento/decremento automaticamente
      }
      
      // 5) Atualizar venda
      await trx('sales')
        .where({ id })
        .update({ product_id, quantity: newQty });

      // 6) Retornar dados
      const unitPrice = Number(product.sale_price);
      const totalValue = unitPrice * newQty;
      return { id: Number(id), product_id, product_name: product.name, quantity: newQty, unit_price: unitPrice, total_value: totalValue };
    });

    return res.json({ message: 'Venda atualizada com sucesso', sale: result });
  } catch (err) {
    const status = err.message.includes('Estoque') || err.message.includes('Produto') ? 400 : 500;
    console.error('Erro ao atualizar venda:', err.message);
    return res.status(status).json({ error: err.message.includes('Estoque') ? err.message : 'Erro ao atualizar venda' });
  }
}

/* ============================================================================
 * EXCLUIR VENDA (COM TRANSAÇÃO)
 * ============================================================================ */
async function deleteSale(req, res) {
  const { id } = req.params;

  try {
    await db.transaction(async (trx) => {
      // 1) Buscar venda antiga
      const sale = await trx('sales').where({ id }).first();
      if (!sale) throw new Error('Venda não encontrada');

      // 2) Devolve estoque
      await trx('products')
        .where({ id: sale.product_id })
        .increment('stock_current', sale.quantity);

      // 3) Exclui venda
      const deletedCount = await trx('sales').where({ id }).del();
      
      if (deletedCount === 0) {
        throw new Error('Venda não encontrada para exclusão.');
      }
    });

    return res.json({ message: 'Venda excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir venda:', err);
    return res.status(400).json({ error: 'Erro ao excluir venda' });
  }
}

// Funções não transacionais (mantidas)

/* ============================================================================
 * LISTAR VENDAS (NÃO REQUER TRANSAÇÃO)
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
        db.raw('(s.quantity * p.sale_price) AS total_price') // Corrigido para total_price para não quebrar o frontend
      )
      .orderBy('s.created_at', 'desc')
      .orderBy('s.id', 'desc');

    return res.json(rows);
  } catch (err) {
    console.error('Erro ao listar vendas:', err);
    return res.status(500).json({ error: 'Erro ao listar vendas' });
  }
}


module.exports = {
  listSales,
  createSale,
  updateSale,
  deleteSale,
};