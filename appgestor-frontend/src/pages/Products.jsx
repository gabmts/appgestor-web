// src/pages/Products.jsx

import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import EditProductModal from '../components/modals/EditProductModal';
import DeleteProductModal from '../components/modals/DeleteProductModal';

export default function Products({ user, onLogout }) {
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    name: '',
    category: '',
    purchase_price: '',
    sale_price: '',
    stock_current: '',
    stock_min: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --- estados para modal de edição ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // --- estados para modal de exclusão ---
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  /* ============================================================================
   * Carrega produtos da API
   * ============================================================================ */
  async function loadProducts() {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar produtos', err);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  /* ============================================================================
   * Controle do formulário de cadastro
   * ============================================================================ */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm({
      name: '',
      category: '',
      purchase_price: '',
      sale_price: '',
      stock_current: '',
      stock_min: '',
    });
  }

  /* ============================================================================
   * Envio do formulário de cadastro (POST /products)
   * ============================================================================ */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/products', {
        name: form.name,
        category: form.category,
        purchase_price: Number(form.purchase_price),
        sale_price: Number(form.sale_price),
        stock_current: Number(form.stock_current || 0),
        stock_min: Number(form.stock_min || 0),
      });

      setSuccess('Produto cadastrado com sucesso!');
      resetForm();
      loadProducts();
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error || 'Erro ao cadastrar produto. Verifique os dados.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================================
   * Ações de EDIÇÃO
   * ============================================================================ */
  function handleEditClick(product) {
    setProductToEdit(product);
    setIsEditOpen(true);
  }

  function handleCloseEditModal() {
    setIsEditOpen(false);
    setProductToEdit(null);
  }

  async function handleSavedFromEditModal() {
    await loadProducts();
  }

  /* ============================================================================
   * Ações de EXCLUSÃO
   * ============================================================================ */
  function handleDeleteClick(product) {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  }

  function handleCloseDeleteModal() {
    setIsDeleteOpen(false);
    setProductToDelete(null);
  }

  async function handleDeletedFromDeleteModal() {
    await loadProducts();
  }

  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={onLogout} />

      <main className="products-main">
        {/* ================================================================== */}
        {/* CARD 1 – FORMULÁRIO DE CADASTRO                                   */}
        {/* ================================================================== */}
        <section className="card card-animated card-delay-1">
          <h2>Cadastrar Produto</h2>

          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                Nome
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Categoria
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Vinho, Espumante, Prato..."
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Preço de compra (R$)
                <input
                  name="purchase_price"
                  type="number"
                  step="0.01"
                  value={form.purchase_price}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Preço de venda (R$)
                <input
                  name="sale_price"
                  type="number"
                  step="0.01"
                  value={form.sale_price}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Estoque atual
                <input
                  name="stock_current"
                  type="number"
                  value={form.stock_current}
                  onChange={handleChange}
                />
              </label>

              <label>
                Estoque mínimo
                <input
                  name="stock_min"
                  type="number"
                  value={form.stock_min}
                  onChange={handleChange}
                />
              </label>
            </div>

            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </form>
        </section>

        {/* ================================================================== */}
        {/* CARD 2 – TABELA DE PRODUTOS                                       */}
        {/* ================================================================== */}
        <section className="card card-animated card-delay-2">
          <h2>Produtos Cadastrados</h2>

          {products.length === 0 ? (
            <p>Nenhum produto cadastrado ainda.</p>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Compra</th>
                  <th>Venda</th>
                  <th>Estoque</th>
                  <th>Mínimo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category || '-'}</td>
                    <td>
                      <strong>R$ {Number(p.purchase_price).toFixed(2)}</strong>
                    </td>
                    <td>
                      <strong>R$ {Number(p.sale_price).toFixed(2)}</strong>
                    </td>
                    <td>
                      <strong>{p.stock_current}</strong>
                    </td>
                    <td>
                      <strong>{p.stock_min}</strong>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          onClick={() => handleEditClick(p)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(p)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* MODAL DE EDIÇÃO */}
      {isEditOpen && productToEdit && (
        <EditProductModal
          product={productToEdit}
          onClose={handleCloseEditModal}
          onSaved={handleSavedFromEditModal}
        />
      )}

      {/* POPUP DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {isDeleteOpen && productToDelete && (
        <DeleteProductModal
          product={productToDelete}
          onClose={handleCloseDeleteModal}
          onDeleted={handleDeletedFromDeleteModal}
        />
      )}
    </div>
  );
}
