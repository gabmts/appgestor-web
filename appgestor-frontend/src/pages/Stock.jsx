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

  // Estilo base para os cabeçalhos (TH)
  const thStyle = {
    paddingBottom: '8px',        // Reduzi um pouco para compensar a quebra de linha
    verticalAlign: 'bottom',
    color: 'var(--text-muted)',
    fontSize: '10px',            // Reduzi 1px para caber melhor
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',     // Reduzi o espaçamento entre letras
    lineHeight: '1.2'            // Permite que linhas fiquem próximas se quebrar
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
                  {/* Produto: 30% */}
                  <th style={{ ...thStyle, width: '30%', textAlign: 'left' }}>
                    Produto
                  </th>
                  
                  {/* Categoria: 15% */}
                  <th style={{ ...thStyle, width: '15%', textAlign: 'left' }}>
                    Categoria
                  </th>
                  
                  {/* Atual: 15% - Centralizado e com quebra de linha forçada */}
                  <th style={{ ...thStyle, width: '15%', textAlign: 'center' }}>
                    Estoque<br />Atual
                  </th>
                  
                  {/* Mínimo: 15% - Centralizado */}
                  <th style={{ ...thStyle, width: '15%', textAlign: 'center' }}>
                    Estoque<br />Mínimo
                  </th>
                  
                  {/* Sugestão: 25% - Alinhado à direita */}
                  <th style={{ ...thStyle, width: '25%', textAlign: 'right' }}>
                    Sugestão<br />de Compra
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
                      <td style={{ textAlign: 'left' }}>
                        {p.name}
                      </td>
                      
                      <td style={{ textAlign: 'left' }}>
                        {p.category || '-'}
                      </td>
                      
                      {/* Célula Estoque Atual */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <strong style={{ fontSize: '14px', color: '#fff' }}>{current}</strong>
                          <span style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px', textTransform: 'uppercase' }}>
                            {statusLabel}
                          </span>
                        </div>
                      </td>
                      
                      {/* Célula Mínimo */}
                      <td style={{ textAlign: 'center' }}>
                        <strong style={{ color: 'var(--text-muted)' }}>{min}</strong>
                      </td>
                      
                      {/* Célula Sugestão */}
                      <td style={{ textAlign: 'right' }}>
                        {suggested > 0 ? (
                          <span style={{ color: 'var(--accent)' }}>
                            + <strong>{suggested}</strong> un.
                          </span>
                        ) : (
                          <span style={{ opacity: 0.3 }}>-</span>
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