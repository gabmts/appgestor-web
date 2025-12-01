// src/pages/Stock.jsx

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

  // Estilo específico para garantir que os títulos não se atropelme
  const thStyle = {
    paddingBottom: '12px',       
    verticalAlign: 'bottom',     
    color: 'var(--text-muted)',  
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em'
  };

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
                  {/* Definindo larguras para evitar colisão */}
                  <th style={{ ...thStyle, width: '35%' }}>Produto</th>
                  <th style={{ ...thStyle, width: '20%' }}>Categoria</th>
                  
                  {/* Forçando quebra de linha manual para ficar bonito */}
                  <th style={{ ...thStyle, width: '15%', textAlign: 'right' }}>
                    Estoque<br/>Atual
                  </th>
                  
                  <th style={{ ...thStyle, width: '10%', textAlign: 'right' }}>
                    Mínimo
                  </th>
                  
                  <th style={{ ...thStyle, width: '20%', textAlign: 'center' }}>
                    Sugestão
                  </th>
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
                      
                      <td style={{ textAlign: 'right' }}>
                        <strong>{current}</strong>{' '}
                        <br/>
                        <small style={{ opacity: 0.7, fontSize: '10px' }}>({statusLabel})</small>
                      </td>
                      
                      <td style={{ textAlign: 'right' }}>
                        <strong>{min}</strong>
                      </td>
                      
                      <td style={{ textAlign: 'center' }}>
                        {suggested > 0 ? (
                          <span>
                            Comprar +<strong>{suggested}</strong>
                          </span>
                        ) : (
                          <span>-</span>
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