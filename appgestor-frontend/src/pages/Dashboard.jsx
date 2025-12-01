// src/pages/Dashboard.jsx

import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';

export default function Dashboard({ user, onLogout }) {
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [lastSales, setLastSales] = useState([]);

  /* ============================================================================
   * Carregar dados do dashboard
   *  - Top 3 produtos mais vendidos
   *  - Produtos com estoque crítico
   *  - Últimas vendas
   * ============================================================================
   */
  useEffect(() => {
    async function loadData() {
      try {
        const [topRes, lowRes, lastRes] = await Promise.all([
          api.get('/reports/top-products'),
          api.get('/reports/low-stock'),
          api.get('/reports/last-sales'),
        ]);

        setTopProducts(topRes.data || []);
        setLowStock(lowRes.data || []);
        setLastSales(lastRes.data || []);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      }
    }

    loadData();
  }, []);

  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={onLogout} />

      <main className="dashboard-main dashboard-main-animated">
        {/* =============================================================== */}
        {/* TOP 3 PRODUTOS MAIS VENDIDOS                                    */}
        {/* =============================================================== */}
        <section className="card card-animated card-delay-1">
          <h2>Top 3 Produtos Mais Vendidos</h2>

          {topProducts.length === 0 ? (
            <p>Sem dados de vendas ainda.</p>
          ) : (
            <ul>
              {topProducts.map((item) => (
                <li key={item.id}>
                  {/* Esquerda: nome + categoria */}
                  <span>
                    <strong>{item.name}</strong>
                    {' — '}
                    {item.category || 'Sem categoria'}
                  </span>

                  {/* Direita: quantidade + faturamento */}
                  <span>
                    {item.total_quantity} un. —{' '}
                    <strong>
                      R$ {Number(item.total_revenue || 0).toFixed(2)}
                    </strong>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* =============================================================== */}
        {/* ESTOQUE BAIXO                                                   */}
        {/* =============================================================== */}
        <section className="card card-animated card-delay-2">
          <h2>Estoque Baixo</h2>

          {lowStock.length === 0 ? (
            <p>Nenhum item com estoque crítico.</p>
          ) : (
            <ul>
              {lowStock.map((item) => (
                <li key={item.id}>
                  {/* Esquerda: produto + categoria */}
                  <span>
                    <strong>{item.name}</strong>
                    {item.category ? ` — ${item.category}` : ''}
                  </span>

                  {/* Direita: estoque atual / mínimo */}
                  <span>
                    Estoque:{' '}
                    <strong>{Number(item.stock_current || 0)}</strong> / Mín:{' '}
                    <strong>{Number(item.stock_min || 0)}</strong>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* =============================================================== */}
        {/* ÚLTIMAS VENDAS                                                  */}
        {/* =============================================================== */}
        <section className="card card-animated card-delay-3">
          <h2>Últimas Vendas</h2>

          {lastSales.length === 0 ? (
            <p>Nenhuma venda registrada ainda.</p>
          ) : (
            <ul>
              {lastSales.map((sale) => (
                <li key={sale.id}>
                  {/* Esquerda: produto + quantidade */}
                  <span>
                    <strong>{sale.product || sale.product_name}</strong> —{' '}
                    <strong>{sale.quantity} un.</strong>
                  </span>

                  {/* Direita: valor + data */}
                  <span>
                    <strong>
                      R$ {Number(sale.total_price || 0).toFixed(2)}
                    </strong>
                    <br />
                    <small>
                      {new Date(sale.created_at).toLocaleString('pt-BR')}
                    </small>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
