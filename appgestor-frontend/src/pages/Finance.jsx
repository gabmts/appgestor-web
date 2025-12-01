import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';

export default function Financial({ user, onLogout }) {
  const [data, setData] = useState({ items: [], totals: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros de Mês/Ano
  const today = new Date();
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year, setYear] = useState(String(today.getFullYear()));

  useEffect(() => {
    async function loadFinancial() {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/reports/financial`, {
          params: { month, year },
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados financeiros.');
      } finally {
        setLoading(false);
      }
    }

    if (user && user.role === 'GESTOR') {
      loadFinancial();
    }
  }, [month, year, user]);

  if (user && user.role !== 'GESTOR') {
    return (
      <div className="dashboard-container">
        <Header user={user} onLogout={onLogout} />
        <main className="dashboard-main" style={{ gridTemplateColumns: '1fr' }}>
          <section className="card">
            <h2>⛔ Acesso Restrito</h2>
            <p>Apenas gestores podem visualizar o financeiro.</p>
          </section>
        </main>
      </div>
    );
  }

  const { items, totals } = data;

  // Meses para o select
  const months = [
    { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' }, { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' }, { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' },
  ];

  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={onLogout} />

      <main className="dashboard-main" style={{ gridTemplateColumns: '1fr' }}>
        
        {/* FILTROS E RESUMO */}
        <section className="card card-animated card-delay-1">
          <h2>💰 Resumo Financeiro</h2>
          
          <div className="form-row" style={{ maxWidth: '400px', marginBottom: '20px' }}>
            <label>
              Mês
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>
            <label>
              Ano
              <input 
                type="number" 
                value={year} 
                onChange={(e) => setYear(e.target.value)} 
              />
            </label>
          </div>

          {loading && <p className="info-msg">Calculando...</p>}
          {error && <p className="error-msg">{error}</p>}

          {!loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <small style={{ color: 'var(--text-muted)' }}>Receita Bruta</small>
                <strong style={{ display: 'block', fontSize: '20px', color: 'var(--accent)' }}>
                  R$ {Number(totals?.total_revenue || 0).toFixed(2)}
                </strong>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <small style={{ color: 'var(--text-muted)' }}>Custo Produtos</small>
                <strong style={{ display: 'block', fontSize: '20px', color: '#fff' }}>
                  R$ {Number(totals?.total_cost || 0).toFixed(2)}
                </strong>
              </div>

              <div style={{ background: 'rgba(20, 255, 100, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(20, 255, 100, 0.2)' }}>
                <small style={{ color: 'var(--success)' }}>Lucro Líquido</small>
                <strong style={{ display: 'block', fontSize: '20px', color: 'var(--success)' }}>
                  R$ {Number(totals?.total_profit || 0).toFixed(2)}
                </strong>
              </div>
            </div>
          )}
        </section>

        {/* TABELA DETALHADA */}
        {!loading && !error && items && items.length > 0 && (
          <section className="card card-animated card-delay-2">
            <h3>Detalhes por Produto</h3>
            
            {/* WRAPPER MÁGICO PARA MOBILE */}
            <div style={{ overflowX: 'auto', marginTop: '10px' }}>
              <table className="products-table" style={{ minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', paddingLeft: '10px' }}>Produto</th>
                    <th style={{ textAlign: 'center' }}>Qtd. Vendida</th>
                    <th style={{ textAlign: 'right' }}>Receita</th>
                    <th style={{ textAlign: 'right' }}>Custo</th>
                    <th style={{ textAlign: 'right' }}>Lucro</th>
                    <th style={{ textAlign: 'center' }}>Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.product_id}>
                      <td style={{ paddingLeft: '10px', fontWeight: '500' }}>{item.name}</td>
                      <td style={{ textAlign: 'center' }}>{item.total_quantity}</td>
                      <td style={{ textAlign: 'right', color: 'var(--accent)' }}>
                        R$ {Number(item.total_revenue).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', opacity: 0.7 }}>
                        R$ {Number(item.total_cost).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 'bold' }}>
                        R$ {Number(item.profit).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          background: 'rgba(255,255,255,0.1)', 
                          padding: '2px 6px', 
                          borderRadius: '4px' 
                        }}>
                          {item.margin_percent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}