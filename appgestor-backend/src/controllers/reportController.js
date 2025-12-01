// src/controllers/reportController.js

const db = require('../config/db');

// Helper para considerar horário de Brasília / Belém (UTC-3)
function getBrazilTodayDateString() {
  const nowUtc = new Date();               // horário UTC do servidor
  const offsetMs = -3 * 60 * 60 * 1000;    // UTC-3
  const brazilNow = new Date(nowUtc.getTime() + offsetMs);

  // Retorna só a parte da data no formato YYYY-MM-DD
  return brazilNow.toISOString().slice(0, 10);
}

module.exports = {

  // ---------------------------------------------------------------------------
  // TOP 3 PRODUTOS MAIS VENDIDOS
  // GET /reports/top-products
  // ---------------------------------------------------------------------------
  async topProducts(req, res) {
    try {
      const top = await db('sales')
        .join('products', 'sales.product_id', 'products.id')
        .select(
          'products.id',
          'products.name',
          'products.category',
          db.raw('SUM(sales.quantity) AS total_quantity'),
          db.raw('SUM(sales.total_price) AS total_revenue')
        )
        .groupBy('products.id', 'products.name', 'products.category')
        .orderBy('total_quantity', 'desc')
        .limit(3);

      return res.json(top);

    } catch (error) {
      console.error('Erro em topProducts:', error);
      return res.status(500).json({ error: 'Erro ao carregar Top 3 produtos' });
    }
  },

  // ---------------------------------------------------------------------------
  // ESTOQUE BAIXO / CRÍTICO
  // GET /reports/low-stock
  // ---------------------------------------------------------------------------
  async lowStock(req, res) {
    try {
      const items = await db('products')
        .select('id', 'name', 'category', 'stock_current', 'stock_min')
        .where('stock_current', '<=', db.ref('stock_min'))
        .orderBy('stock_current', 'asc');

      return res.json(items);

    } catch (error) {
      console.error('Erro em lowStock:', error);
      return res.status(500).json({ error: 'Erro ao listar estoque baixo' });
    }
  },

  // ---------------------------------------------------------------------------
  // ÚLTIMAS VENDAS
  // GET /reports/last-sales
  // ---------------------------------------------------------------------------
  async lastSales(req, res) {
    try {
      const sales = await db('sales')
        .join('products', 'sales.product_id', 'products.id')
        .select(
          'sales.id',
          'sales.product_id',
          'products.name AS product',
          'sales.quantity',
          'sales.total_price',
          'sales.created_at'
        )
        .orderBy('sales.created_at', 'desc')
        .limit(10);

      return res.json(sales);

    } catch (error) {
      console.error('Erro em lastSales:', error);
      return res.status(500).json({ error: 'Erro ao listar últimas vendas' });
    }
  },

  // ---------------------------------------------------------------------------
  // RELATÓRIO FINANCEIRO (SOMENTE GESTOR)
  // GET /reports/financial?month=11&year=2025
  // ---------------------------------------------------------------------------
  async financial(req, res) {
    try {
      // Permissão mínima
      if (req.user.role !== 'GESTOR') {
        return res.status(403).json({ error: 'Apenas gestores podem ver o relatório financeiro' });
      }

      const { month, year } = req.query;

      // query base
      let query = db('sales')
        .join('products', 'sales.product_id', 'products.id');

      // filtro opcional por mês/ano (ajustando para UTC-3 no SQLite)
      if (month && year) {
        const m = parseInt(month, 10);
        const y = parseInt(year, 10);

        if (!Number.isNaN(m) && !Number.isNaN(y)) {
          const monthStr = String(m).padStart(2, '0');
          const yearStr = String(y);

          // IMPORTANTE: usamos datetime(sales.created_at, "-3 hours")
          // para que o mês/ano sejam calculados no fuso UTC-3
          query = query.whereRaw(
            'strftime("%m", datetime(sales.created_at, "-3 hours")) = ? AND strftime("%Y", datetime(sales.created_at, "-3 hours")) = ?',
            [monthStr, yearStr]
          );
        }
      }

      const rows = await query
        .select(
          'products.id',
          'products.name',
          'products.category',
          db.raw('SUM(sales.quantity) AS total_quantity'),
          db.raw('SUM(sales.total_price) AS total_revenue'),
          db.raw('SUM(sales.quantity * products.purchase_price) AS total_cost')
        )
        .groupBy('products.id', 'products.name', 'products.category');

      // montar resultado com lucro e margem
      const result = rows.map((row) => {
        const revenue = Number(row.total_revenue || 0);
        const cost = Number(row.total_cost || 0);
        const profit = revenue - cost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          product_id: row.id,
          name: row.name,
          category: row.category,
          total_quantity: Number(row.total_quantity || 0),
          total_revenue: revenue,
          total_cost: cost,
          profit,
          margin_percent: Number(margin.toFixed(2)),
        };
      });

      // totais gerais do relatório
      const totals = result.reduce(
        (acc, item) => {
          acc.total_revenue += item.total_revenue;
          acc.total_cost += item.total_cost;
          acc.total_profit += item.profit;
          return acc;
        },
        { total_revenue: 0, total_cost: 0, total_profit: 0 }
      );

      return res.json({
        items: result,
        totals,
      });

    } catch (error) {
      console.error('Erro em financial:', error);
      return res.status(500).json({ error: 'Erro ao gerar relatório financeiro' });
    }
  },
};
