// src/components/modals/EditProductModal.jsx

import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function EditProductModal({ product, onClose, onSaved }) {
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

  /* ============================================================================
   * Preencher formulário inicial com dados do produto
   * ============================================================================
   */
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        category: product.category || '',
        purchase_price: product.purchase_price,
        sale_price: product.sale_price,
        stock_current: product.stock_current,
        stock_min: product.stock_min,
      });
    }
  }, [product]);

  /* ============================================================================
   * Controle do formulário
   * ============================================================================
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /* ============================================================================
   * Enviar alterações (PUT /products/:id)
   * ============================================================================
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.put(`/products/${product.id}`, {
        name: form.name,
        category: form.category,
        purchase_price: Number(form.purchase_price),
        sale_price: Number(form.sale_price),
        stock_current: Number(form.stock_current || 0),
        stock_min: Number(form.stock_min || 0),
      });

      setSuccess('Produto atualizado com sucesso!');

      if (onSaved) await onSaved();
      onClose();

    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      setError('Erro ao atualizar produto. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  }

  if (!product) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" role="dialog" aria-modal="true">
        <h2>Editar Produto</h2>

        <form className="modal-form" onSubmit={handleSubmit}>

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

          <div className="modal-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
