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

  // Estilo base limpo para os cabeçalhos (sem quebras forçadas)
  const thStyle = {
    paddingBottom: '12px',
    verticalAlign: 'bottom',
    color: 'var(--text-muted)',
    fontSize: '12px', // Aumentei um pouco pois agora temos espaço
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600'
  };

  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={onLogout} />

      {/* A MÁGICA ESTÁ AQUI:
         style={{ gridTemplateColumns: '1fr' }} 
         Isso força o layout a ter apenas UMA coluna larga, 
         fazendo o card ocupar a tela toda (igual ao Header).
      */}
      <main className="dashboard-main" style={{ gridTemplateColumns: '1fr' }}>
        <section className="card card-animated card-delay-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2>Estoque Crítico</h2>
            {!loading && !error && (
              <span style={{ color: 'var(--text-soft)', fontSize: '13px' }}>
                {items.length} {items.length === 1 ? 'item encontrado' : 'itens encontrados'}
              </span>
            )}
          </div>

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
                  {/* Agora com espaço de sobra, podemos distribuir melhor */}
                  <th style={{ ...thStyle, width: '40%', textAlign: 'left' }}>
                    Produto
                  </th>
                  
                  <th style={{ ...thStyle, width: '20%', textAlign: 'left' }}>
                    Categoria
                  </th>
                  
                  {/* Sem <br/>, tudo na mesma linha */}
                  <th style={{ ...thStyle, width: '15%', textAlign: 'center' }}>
                    Estoque Atual
                  </th>
                  
                  <th style={{ ...thStyle, width: '10%', textAlign: 'center' }}>
                    Mínimo
                  </th>
                  
                  <th style={{ ...thStyle, width: '15%', textAlign: 'right' }}>
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
                  let statusColor = 'var(--success)';
                  
                  if (current <= min && current > 0) {
                    statusLabel = 'BAIXO';
                    statusColor = 'var(--accent)';
                  }
                  if (current === 0) {
                    statusLabel = 'ZERADO';
                    statusColor = 'var(--danger)';
                  }

                  return (
                    <tr key={p.id}>
                      <td style={{ textAlign: 'left', fontWeight: '500' }}>
                        {p.name}
                      </td>
                      
                      <td style={{ textAlign: 'left', color: 'var(--text-soft)' }}>
                        {p.category || '-'}
                      </td>
                      
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '15px', color: '#fff' }}>{current}</strong>
                          <span style={{ 
                            fontSize: '9px', 
                            border: `1px solid ${statusColor}`, 
                            color: statusColor,
                            padding: '1px 4px',
                            borderRadius: '4px' 
                          }}>
                            {statusLabel}
                          </span>
                        </div>
                      </td>
                      
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{min}</span>
                      </td>
                      
                      <td style={{ textAlign: 'right' }}>
                        {suggested > 0 ? (
                          <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                            + {suggested} un.
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