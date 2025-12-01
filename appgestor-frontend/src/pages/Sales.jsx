// src/pages/Sales.jsx

import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import DeleteSaleModal from '../components/modals/DeleteSaleModal';

export default function Sales({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [lastSales, setLastSales] = useState([]);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  const [editingSaleId, setEditingSaleId] = useState(null);
  const [saleToDelete, setSaleToDelete] = useState(null);

  /* =========================================================================
   * Carregar produtos
   * ========================================================================= */
  async function loadProducts() {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  }

  /* =========================================================================
   * Carregar últimas vendas (compatível com /reports/last-sales)
   * ========================================================================= */
  async function loadLastSales() {
    try {
      const res = await api.get('/reports/last-sales');
      setLastSales(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar últimas vendas:', err);
    }
  }

  useEffect(() => {
    loadProducts();
    loadLastSales();
  }, []);

  /* =========================================================================
   * Registrar / Atualizar Venda
   * ========================================================================= */
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    if (!selectedProductId) {
      setMessage('Selecione um produto.');
      return;
    }

    if (quantity <= 0) {
      setMessage('Quantidade deve ser maior que zero.');
      return;
    }

    try {
      if (editingSaleId === null) {
        // Registrar nova venda
        await api.post('/sales', {
          product_id: Number(selectedProductId),
          quantity: Number(quantity),
        });

        setMessage('Venda registrada com sucesso!');
      } else {
        // Atualizar venda existente
        await api.put(`/sales/${editingSaleId}`, {
          product_id: Number(selectedProductId),
          quantity: Number(quantity),
        });

        setMessage('Venda atualizada com sucesso!');
      }

      // Resetar campos
      setQuantity(1);
      setSelectedProductId('');
      setEditingSaleId(null);

      // Recarregar listas
      await loadProducts();
      await loadLastSales();
    } catch (err) {
      console.error('Erro ao salvar venda:', err);
      setMessage('Erro ao salvar venda. Verifique o estoque.');
    }
  }

  /* =========================================================================
   * Editar venda
   * ========================================================================= */
  function handleEditClick(sale) {
    setEditingSaleId(sale.id);
    setSelectedProductId(String(sale.product_id));
    setQuantity(sale.quantity);
    setMessage('');
    // Rola a tela para cima suavemente para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* =========================================================================
   * Cancelar edição
   * ========================================================================= */
  function handleCancelEdit() {
    setEditingSaleId(null);
    setSelectedProductId('');
    setQuantity(1);
    setMessage('');
  }

  /* =========================================================================
   * Após exclusão no modal
   * ========================================================================= */
  async function handleSaleDeleted() {
    setMessage('Venda excluída com sucesso!');
    await loadProducts();
    await loadLastSales();
    setSaleToDelete(null);
  }

  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={onLogout} />

      {/* ALTERAÇÃO: Forçamos 1 coluna para empilhar os cards verticalmente */}
      <main className="sales-main" style={{ gridTemplateColumns: '1fr' }}>
        
        {/* ================================================================== */}
        {/* CARD 1 – FORMULÁRIO DE VENDA (EM CIMA)                             */}
        {/* ================================================================== */}
        <section className="card card-animated card-delay-1">
          <h2>{editingSaleId ? 'Editar Venda' : 'Registrar Nova Venda'}</h2>

          <form className="sales-form" onSubmit={handleSubmit}>
            {/* Linha com 2 colunas para Produto e Quantidade ficarem lado a lado */}
            <div className="form-row" style={{ marginBottom: '0' }}>
              <label style={{ flex: 3 }}>
                Produto
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  disabled={editingSaleId !== null} 
                >
                  <option value="">Selecione...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category || 'Geral'}) — Estoque: {p.stock_current}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ flex: 1 }}>
                Qtd.
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </label>
            </div>

            {message && <p className="info-msg" style={{ marginTop: '10px' }}>{message}</p>}

            <div className="form-row" style={{ marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1 }}>
                {editingSaleId ? 'Salvar Alterações' : 'Registrar Venda'}
              </button>

              {editingSaleId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ================================================================== */}
        {/* CARD 2 – LISTA DE ÚLTIMAS VENDAS (EMBAIXO)                         */}
        {/* ================================================================== */}
        <section className="card card-animated card-delay-2">
          <h2>Últimas Vendas</h2>

          {lastSales.length === 0 ? (
            <p>Nenhuma venda registrada ainda.</p>
          ) : (
            <ul style={{ padding: 0 }}>
              {lastSales.map((sale) => (
                <li
                  key={sale.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr auto', // Grid para alinhar colunas
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  {/* Coluna 1: Nome do Produto e Data */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: '15px', color: 'var(--text-main)' }}>
                      {sale.product || sale.product_name}
                    </strong>
                    <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      {new Date(sale.created_at).toLocaleString('pt-BR')}
                    </small>
                  </div>

                  {/* Coluna 2: Quantidade */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      padding: '4px 10px', 
                      borderRadius: '12px',
                      fontSize: '13px'
                    }}>
                      {sale.quantity} un.
                    </span>
                  </div>

                  {/* Coluna 3: Valor Total */}
                  <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--accent)' }}>
                    R$ {Number(sale.total_price || 0).toFixed(2)}
                  </div>

                  {/* Coluna 4: Botões de Ação */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleEditClick(sale)}
                      title="Editar"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => setSaleToDelete(sale)}
                      title="Excluir"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* ================================================================== */}
      {/* MODAL DE EXCLUSÃO                                                  */}
      {/* ================================================================== */}
      {saleToDelete && (
        <DeleteSaleModal
          sale={saleToDelete}
          onClose={() => setSaleToDelete(null)}
          onDeleted={handleSaleDeleted}
        />
      )}
    </div>
  );
}