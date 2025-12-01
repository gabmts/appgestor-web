import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Financial({ user, onLogout }) {
  const [data, setData] = useState({ items: [], totals: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = new Date();
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year, setYear] = useState(String(today.getFullYear()));

  useEffect(() => {
    async function loadFinancial() {
      try {
        setLoading(true); setError('');
        const res = await api.get(`/reports/financial`, { params: { month, year } });
        setData(res.data);
      } catch (err) { console.error(err); setError('Erro ao carregar dados.'); } 
      finally { setLoading(false); }
    }
    if (user && user.role === 'GESTOR') loadFinancial();
  }, [month, year, user]);

  if (user && user.role !== 'GESTOR') {
    return (
      <div className="dashboard-container">
        <Header user={user} onLogout={onLogout} />
        <main className="dashboard-main" style={{ gridTemplateColumns: '1fr' }}><section className="card"><h2>⛔ Acesso Restrito</h2></section></main>
        <Footer />
      </div>
    );
  }

  const { items, totals } = data;
  const months = [{ value: '1', label: 'Jan' }, { value: '2', label: 'Fev' }, { value: '3', label: 'Mar' }, { value: '4', label: 'Abr' }, { value: '5', label: 'Mai' }, { value: '6', label: 'Jun' }, { value: '7', label: 'Jul' }, { value: '8', label: 'Ago' }, { value: '9', label: 'Set' }, { value: '10', label: 'Out' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dez' }];

  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={onLogout} />
      <main className="dashboard-main" style={{ gridTemplateColumns: '1fr' }}>
        <section className="card card-animated card-delay-1">
          <h2>💰 Resumo Financeiro</h2>
          <div className="form-row" style={{ maxWidth: '400px', marginBottom: '20px' }}>
            <label>Mês <select value={month} onChange={(e) => setMonth(e.target.value)}>{months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
            <label>Ano <input type="number" value={year} onChange={(e) => setYear(e.target.value)} /></label>
          </div>

          {loading && <p className="info-msg">Calculando...</p>}
          {!loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                <small style={{ color: 'var(--text-muted)' }}>Receita</small>
                <strong style={{ display: 'block', fontSize: '18px', color: 'var(--accent)' }}>R$ {Number(totals?.total_revenue || 0).toFixed(2)}</strong>
              </div>
              <div style={{ background: 'rgba(20, 255, 100, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(20, 255, 100, 0.2)' }}>
                <small style={{ color: 'var(--success)' }}>Lucro Líquido</small>
                <strong style={{ display: 'block', fontSize: '18px', color: 'var(--success)' }}>R$ {Number(totals?.total_profit || 0).toFixed(2)}</strong>
              </div>
            </div>
          )}
        </section>

        {!loading && !error && items && items.length > 0 && (
          <section className="card card-animated card-delay-2">
            <h3>Detalhes por Produto</h3>
            <table className="products-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th style={{textAlign: 'center'}}>Qtd.</th>
                  <th style={{textAlign: 'right'}}>Receita</th>
                  <th style={{textAlign: 'right'}}>Lucro</th>
                  <th style={{textAlign: 'center'}}>Margem</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.product_id}>
                    <td data-label="Produto" style={{ fontWeight: '500' }}>{item.name}</td>
                    <td data-label="Qtd. Vendida" style={{ textAlign: 'center' }}>{item.total_quantity}</td>
                    <td data-label="Receita" style={{ textAlign: 'right', color: 'var(--accent)' }}>R$ {Number(item.total_revenue).toFixed(2)}</td>
                    <td data-label="Lucro" style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 'bold' }}>R$ {Number(item.profit).toFixed(2)}</td>
                    <td data-label="Margem" style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{item.margin_percent}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}