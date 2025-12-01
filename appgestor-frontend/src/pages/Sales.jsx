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

      <main className="sales-main">
        {/* ================================================================== */}
        {/* CARD 1 – FORMULÁRIO DE VENDA                                      */}
        {/* ================================================================== */}
        <section className="card card-animated card-delay-1">
          <h2>{editingSaleId ? 'Editar Venda' : 'Registrar Nova Venda'}</h2>

          <form className="sales-form" onSubmit={handleSubmit}>
            <label>
              Produto
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={editingSaleId !== null} // impedir troca do produto ao editar
              >
                <option value="">Selecione...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category || 'Sem categoria'}) — estoque:{' '}
                    {p.stock_current}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Quantidade
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>

            {message && <p className="info-msg">{message}</p>}

            <div className="form-row">
              <button type="submit" style={{ flex: 1 }}>
                {editingSaleId ? 'Salvar Alterações' : 'Registrar Venda'}
              </button>

              {editingSaleId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{ flex: 1 }}
                >
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ================================================================== */}
        {/* CARD 2 – LISTA DE ÚLTIMAS VENDAS                                  */}
        {/* ================================================================== */}
        <section className="card card-animated card-delay-2">
          <h2>Últimas Vendas</h2>

          {lastSales.length === 0 ? (
            <p>Nenhuma venda registrada ainda.</p>
          ) : (
            <ul>
              {lastSales.map((sale) => (
                <li
                  key={sale.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {/* Linha principal: produto + qtd + valor */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>
                      <strong>{sale.product || sale.product_name}</strong> —{' '}
                      <strong>{sale.quantity} un.</strong>
                    </span>

                    <span>
                      <strong>
                        R$ {Number(sale.total_price || 0).toFixed(2)}
                      </strong>
                      <br />
                      <small>
                        {new Date(sale.created_at).toLocaleString('pt-BR')}
                      </small>
                    </span>
                  </div>

                  {/* Botões de ação alinhados à direita */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      justifyContent: 'flex-end',
                      marginTop: 4,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleEditClick(sale)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => setSaleToDelete(sale)}
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
      {/* MODAL DE EXCLUSÃO                                                 */}
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
