import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EditProductModal from '../components/modals/EditProductModal';
import DeleteProductModal from '../components/modals/DeleteProductModal';

export default function Products({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  function handleNewProduct() { setEditingProduct(null); setIsModalOpen(true); }
  function handleEditProduct(product) { setEditingProduct(product); setIsModalOpen(true); }
  function handleDeleteClick(product) { setProductToDelete(product); }
  async function handleSaveSuccess() { setIsModalOpen(false); await loadProducts(); }
  async function handleDeleteSuccess() { setProductToDelete(null); await loadProducts(); }

  function getCategoryEmoji(category) {
    const cat = (category || '').toLowerCase();
    if (cat.includes('vinho')) return '🍷';
    if (cat.includes('espumante')) return '🍾';
    if (cat.includes('uva')) return '🍇';
    return '📦';
  }

  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={onLogout} />

      <main className="dashboard-main" style={{ gridTemplateColumns: '1fr' }}>
        <section className="card card-animated card-delay-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h2>🍷 Gerenciar Produtos</h2>
            <button className="btn-primary" onClick={handleNewProduct}>+ Novo Produto</button>
          </div>

          {loading && <p className="info-msg">Carregando adega...</p>}
          {error && <p className="error-msg">{error}</p>}
          {!loading && !error && products.length === 0 && <p>Nenhum produto cadastrado.</p>}

          {!loading && !error && products.length > 0 && (
            // AQUI MUDOU: Removemos o div de scroll e deixamos a tabela livre para o CSS transformar
            <table className="products-table">
              <thead>
                <tr>
                  <th style={{textAlign: 'left'}}>Nome</th>
                  <th style={{textAlign: 'left'}}>Categoria</th>
                  <th style={{textAlign: 'right'}}>Compra</th>
                  <th style={{textAlign: 'right'}}>Venda</th>
                  <th style={{textAlign: 'center'}}>Estoque</th>
                  <th style={{textAlign: 'center'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    {/* data-label é usado pelo CSS no mobile */}
                    <td data-label="Nome">{p.name}</td>
                    <td data-label="Categoria">{getCategoryEmoji(p.category)} {p.category || '-'}</td>
                    <td data-label="Preço Compra" style={{color: 'var(--text-muted)'}}>R$ {Number(p.purchase_price).toFixed(2)}</td>
                    <td data-label="Preço Venda" style={{color: 'var(--accent)', fontWeight: 'bold'}}>R$ {Number(p.sale_price).toFixed(2)}</td>
                    <td data-label="Estoque">
                      <span style={{ 
                        background: Number(p.stock_current) <= Number(p.stock_min) ? 'rgba(255, 75, 75, 0.2)' : 'rgba(255,255,255,0.05)',
                        color: Number(p.stock_current) <= Number(p.stock_min) ? 'var(--danger)' : '#fff',
                        padding: '2px 8px', borderRadius: '4px', fontSize: '12px'
                      }}>
                        {p.stock_current}
                      </span>
                    </td>
                    <td data-label="Ações">
                      <div className="table-actions">
                        <button onClick={() => handleEditProduct(p)}>Editar</button>
                        <button onClick={() => handleDeleteClick(p)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {isModalOpen && <EditProductModal productToEdit={editingProduct} onClose={() => setIsModalOpen(false)} onSuccess={handleSaveSuccess} />}
      {productToDelete && <DeleteProductModal product={productToDelete} onClose={() => setProductToDelete(null)} onDeleted={handleDeleteSuccess} />}
      <Footer />
    </div>
  );
}