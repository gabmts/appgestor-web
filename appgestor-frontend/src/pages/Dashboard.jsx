import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
// 1. Importando o Rodapé
import Footer from '../components/Footer';

export default function Dashboard({ user, onLogout }) {
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [lastSales, setLastSales] = useState([]);

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

      {/* LAYOUT RESPONSIVO:
          No PC: Cria colunas lado a lado.
          No Celular: Empilha um card embaixo do outro.
      */}
      <main 
        className="dashboard-main dashboard-main-animated"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px' 
        }}
      >
        
        {/* === CARD 1: TOP 3 PRODUTOS === */}
        <section className="card card-animated card-delay-1" style={{ minHeight: '320px' }}>
          <h2>🏆 Top 3 Mais Vendidos</h2>

          {topProducts.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>
              😴 <br/>Sem vendas ainda.
            </div>
          ) : (
            <ul style={{ padding: 0 }}>
              {topProducts.map((item, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const medal = medals[index] || `#${index + 1}`;

                return (
                  <li key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{medal}</span>
                      <div>
                        <strong style={{ display: 'block', fontSize: '14px' }}>{item.name}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-soft)' }}>
                          {item.category || 'Geral'}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>
                        {item.total_quantity} un.
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--accent)' }}>
                        R$ {Number(item.total_revenue || 0).toFixed(2)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* === CARD 2: ESTOQUE BAIXO === */}
        <section className="card card-animated card-delay-2" style={{ minHeight: '320px' }}>
          <h2>📦 Atenção ao Estoque</h2>

          {lowStock.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <span style={{ fontSize: '40px' }}>✅</span>
              <p style={{ marginTop: '10px' }}>Estoque saudável!</p>
            </div>
          ) : (
            <ul style={{ padding: 0 }}>
              {lowStock.map((item) => {
                const current = Number(item.stock_current || 0);
                const isZero = current === 0;

                return (
                  <li key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isZero && <span title="Zerado">🚨</span>}
                        <strong style={{ color: isZero ? 'var(--danger)' : 'var(--text-main)', fontSize: '14px' }}>
                          {item.name}
                        </strong>
                      </div>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-soft)' }}>
                        Mínimo ideal: {Number(item.stock_min || 0)}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        background: isZero ? 'var(--danger)' : 'rgba(245, 193, 108, 0.2)', 
                        color: isZero ? '#fff' : 'var(--accent)', 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '11px', 
                        fontWeight: 'bold' 
                      }}>
                        Restam {current}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* === CARD 3: FEED DE VENDAS (LARGURA TOTAL) === */}
        <section 
          className="card card-animated card-delay-3" 
          style={{ 
            gridColumn: '1 / -1', // Ocupa toda a largura disponível
            marginTop: '8px'
          }}
        >
          <h2>🧾 Últimas Vendas Realizadas</h2>

          {lastSales.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>
              Nenhuma venda registrada hoje.
            </div>
          ) : (
            // Wrapper com scroll horizontal para não quebrar no celular
            <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>PRODUTO</th>
                    <th style={{ textAlign: 'center', padding: '10px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>QTD</th>
                    <th style={{ textAlign: 'right', padding: '10px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>VALOR</th>
                    <th style={{ textAlign: 'right', padding: '10px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>DATA/HORA</th>
                  </tr>
                </thead>
                <tbody>
                  {lastSales.map((sale) => (
                    <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: '500' }}>
                        {sale.product || sale.product_name}
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px 10px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          {sale.quantity}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 'bold', color: 'var(--accent)' }}>
                        R$ {Number(sale.total_price || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px 10px', fontSize: '11px', color: 'var(--text-soft)' }}>
                        {new Date(sale.created_at).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>

      {/* 2. Rodapé inserido aqui no final */}
      <Footer />
      
    </div>
  );
}