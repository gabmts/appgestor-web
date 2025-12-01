import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';

export default function Stock({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLowStock() {
      try {
        setLoading(true);
        setError('');

        const res = await api.get('/reports/low-stock');
        setItems(res.data || []);
      } catch (err) {
        console.error('Erro ao buscar estoque crítico:', err);
        setError('Erro ao carregar estoque crítico.');
      } finally {
        setLoading(false);
      }
    }

    loadLowStock();
  }, []);

  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={onLogout} />

      <main className="dashboard-main">
        <section className="card card-animated card-delay-1">
          <h2>Estoque Crítico</h2>

          {loading && <p className="info-msg">Carregando produtos...</p>}
          {error && <p className="error-msg">{error}</p>}

          {!loading && !error && items.length === 0 && (
            <p>
              Nenhum produto em nível crítico no momento. <br />
              <small>(Estoque atual maior que o mínimo configurado.)</small>
            </p>
          )}

          {!loading && !error && items.length > 0 && (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Estoque atual</th>
                  <th>Mínimo</th>
                  <th>Sugestão</th>
                </tr>
              </thead>

              <tbody>
                {items.map((p) => {
                  const current = Number(p.stock_current || 0);
                  const min = Number(p.stock_min || 0);
                  const diff = min - current;
                  const suggested = diff > 0 ? diff + 5 : 0;

                  let statusLabel = 'OK';
                  if (current <= min && current > 0) statusLabel = 'Baixo';
                  if (current === 0) statusLabel = 'Zerado';

                  return (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.category || '-'}</td>
                      <td>
                        <strong>{current}</strong>{' '}
                        <small style={{ opacity: 0.7 }}>({statusLabel})</small>
                      </td>
                      <td><strong>{min}</strong></td>
                      <td>
                        {suggested > 0 ? (
                          <span>Comprar pelo menos <strong>{suggested} un.</strong></span>
                        ) : (
                          <span>Sem necessidade imediata</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}