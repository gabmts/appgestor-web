// src/controllers/reportController.js

const db = require('../config/db');

/**
 * Timezone oficial da Casa da Luna / Belém
 * (usaremos sempre esse fuso para regras de negócio)
 */
const BRAZIL_TZ = 'America/Belem';

/**
 * Retorna a data "de hoje" no Brasil (UTC-3) no formato YYYY-MM-DD
 * Ex: "2025-11-30"
 */
function getBrazilTodayDateString() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: BRAZIL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === 'year').value;
  const month = parts.find((p) => p.type === 'month').value;
  const day = parts.find((p) => p.type === 'day').value;

  return `${year}-${month}-${day}`;
}

/**
 * Formata um Date/string qualquer para string já no horário do Brasil,
 * pronto para exibição no frontend.
 *
 * Exemplo de retorno: "30/11/2025 23:50:54"
 */
function formatDateTimeToBrazilString(dateValue) {
  if (!dateValue) return null;

  const d = new Date(dateValue);

  return d.toLocaleString('pt-BR', {
    timeZone: BRAZIL_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
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
  //
  // Aqui já devolvemos o horário convertido para o fuso do Brasil (Belém),
  // para não aparecer venda “virando o dia/mês” no dashboard.
  // ---------------------------------------------------------------------------
  async lastSales(req, res) {
    try {
      const rows = await db('sales')
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

      const sales = rows.map((row) => ({
        id: row.id,
        product_id: row.product_id,
        product: row.product,
        quantity: row.quantity,
        total_price: row.total_price,
        created_at: row.created_at, // valor bruto do banco (UTC)
        created_at_brazil: formatDateTimeToBrazilString(row.created_at), // valor já no horário do Brasil
      }));

      return res.json(sales);
    } catch (error) {
      console.error('Erro em lastSales:', error);
      return res.status(500).json({ error: 'Erro ao listar últimas vendas' });
    }
  },

  // ---------------------------------------------------------------------------
  // RELATÓRIO FINANCEIRO (SOMENTE GESTOR)
  // GET /reports/financial?month=11&year=2025
  //
  // IMPORTANTE: usamos datetime(sales.created_at, '-3 hours') no SQLite
  // para aplicar os filtros de mês/ano considerando UTC-3 (Brasil).
  // Assim, uma venda feita às 23h em Belém não cai no mês errado.
  // ---------------------------------------------------------------------------
  async financial(req, res) {
    try {
      // Permissão mínima
      if (req.user.role !== 'GESTOR') {
        return res
          .status(403)
          .json({ error: 'Apenas gestores podem ver o relatório financeiro' });
      }

      const { month, year } = req.query;

      let query = db('sales').join(
        'products',
        'sales.product_id',
        'products.id'
      );

      // Filtro opcional por mês/ano (sempre no fuso do Brasil)
      if (month && year) {
        const m = parseInt(month, 10);
        const y = parseInt(year, 10);

        if (!Number.isNaN(m) && !Number.isNaN(y)) {
          const monthStr = String(m).padStart(2, '0');
          const yearStr = String(y);

          // Usamos datetime(..., '-3 hours') para "trazer" o created_at para UTC-3
          query = query.whereRaw(
            `
              strftime("%m", datetime(sales.created_at, '-3 hours')) = ?
              AND strftime("%Y", datetime(sales.created_at, '-3 hours')) = ?
            `,
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
          db.raw(
            'SUM(sales.quantity * products.purchase_price) AS total_cost'
          )
        )
        .groupBy('products.id', 'products.name', 'products.category');

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
