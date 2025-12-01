// src/pages/Finance.jsx

import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';

export default function Finance({ user, onLogout }) {
  const [sales, setSales] = useState([]);
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mês atual no formato YYYY-MM (para <input type="month">)
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  /* ============================================================================
   * Carregar dados financeiros e últimas vendas, com filtro de mês/ano
   * ============================================================================ */
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const [yearStr, monthStr] = selectedMonth.split('-') || [];
        const year = yearStr;
        const month = monthStr;

        const [finRes, salesRes] = await Promise.all([
          api.get('/reports/financial', {
            params: { month, year },
          }),
          api.get('/reports/last-sales', {
            params: { limit: 500 },
          }),
        ]);

        setFinanceData(finRes.data || null);
        setSales(salesRes.data || []);
      } catch (err) {
        console.error('Erro ao carregar dados financeiros:', err);
        setError('Erro ao carregar dados financeiros.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedMonth]);

  /* ============================================================================
   * Função auxiliar: converte data em YYYY-MM para comparar com selectedMonth
   * ============================================================================ */
  function getMonthKey(dateStr) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  /* ============================================================================
   * Vendas do mês selecionado (filtradas no front, compatível com last-sales)
   * ============================================================================ */
  const salesOfMonth = useMemo(
    () => sales.filter((s) => getMonthKey(s.created_at) === selectedMonth),
    [sales, selectedMonth]
  );

  /* ============================================================================
   * Cálculos financeiros:
   * usa agregados do backend (totals) + detalhes de vendas do mês
   * ============================================================================ */
  const {
    grossRevenue,
    totalCost,
    netProfit,
    totalQuantity,
    numSales,
    ticketMedio,
    profitMargin,
  } = useMemo(() => {
    let gross = 0;
    let cost = 0;
    let net = 0;
    let quantity = 0;

    if (financeData && financeData.totals) {
      gross = Number(financeData.totals.total_revenue || 0);
      cost = Number(financeData.totals.total_cost || 0);
      net = Number(financeData.totals.total_profit || 0);
    }

    if (financeData && Array.isArray(financeData.items)) {
      quantity = financeData.items.reduce(
        (acc, item) => acc + Number(item.total_quantity || 0),
        0
      );
    }

    const num = salesOfMonth.length;
    const ticket = num > 0 ? gross / num : 0;
    const margin = gross > 0 ? (net / gross) * 100 : 0;

    return {
      grossRevenue: gross,
      totalCost: cost,
      netProfit: net,
      totalQuantity: quantity,
      numSales: num,
      ticketMedio: ticket,
      profitMargin: margin,
    };
  }, [financeData, salesOfMonth]);

  /* ============================================================================
   * Segurança: apenas GESTOR pode acessar esta tela
   * ============================================================================ */
  if (user && user.role && user.role !== 'GESTOR') {
    return (
      <div className="dashboard-container">
        <Header user={user} onLogout={onLogout} />
        <main className="dashboard-main">
          <section className="card card-animated card-delay-1">
            <h2>Financeiro</h2>
            <p>Apenas gestores têm acesso a esta área.</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={onLogout} />

      <main className="dashboard-main">
        {/* ================================================================== */}
        {/* CARD 1 – Filtros + Resumo Financeiro                               */}
        {/* ================================================================== */}
        <section className="card card-animated card-delay-1">
          <h2>Resumo Financeiro</h2>

          <div
            style={{
              marginBottom: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <label>
              Mês de referência
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </label>

            {loading && <p className="info-msg">Carregando dados...</p>}
            {error && <p className="error-msg">{error}</p>}
          </div>

          <ul>
            <li>
              <span>Receita bruta</span>
              <span>
                <strong>R$ {grossRevenue.toFixed(2)}</strong>
              </span>
            </li>
            <li>
              <span>Custo estimado</span>
              <span>
                <strong>R$ {totalCost.toFixed(2)}</strong>
              </span>
            </li>
            <li>
              <span>Lucro “líquido” estimado</span>
              <span>
                <strong>R$ {netProfit.toFixed(2)}</strong>
              </span>
            </li>
            <li>
              <span>Margem (%)</span>
              <span>
                <strong>{profitMargin.toFixed(1)}%</strong>
              </span>
            </li>
            <li>
              <span>Nº de vendas (mês)</span>
              <span>
                <strong>{numSales}</strong>
              </span>
            </li>
            <li>
              <span>Quantidade total vendida</span>
              <span>
                <strong>{totalQuantity} un.</strong>
              </span>
            </li>
            <li>
              <span>Ticket médio por venda</span>
              <span>
                <strong>R$ {ticketMedio.toFixed(2)}</strong>
              </span>
            </li>
          </ul>
        </section>

        {/* ================================================================== */}
        {/* CARD 2 – Lista das vendas do mês selecionado                       */}
        {/* ================================================================== */}
        <section className="card card-animated card-delay-2">
          <h2>Vendas no mês selecionado</h2>

          {salesOfMonth.length === 0 ? (
            <p>Nenhuma venda registrada para este mês.</p>
          ) : (
            <ul>
              {salesOfMonth.map((s) => (
                <li
                  key={s.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <span>
                    <strong>{s.product || s.product_name}</strong> —{' '}
                    <strong>{s.quantity} un.</strong> —{' '}
                    <strong>R$ {Number(s.total_price).toFixed(2)}</strong>
                  </span>

                  <span>
                    <small>
                      {new Date(s.created_at).toLocaleString('pt-BR')}
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
