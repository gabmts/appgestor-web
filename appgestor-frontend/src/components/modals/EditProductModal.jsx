import { useState, useEffect } from 'react';
import api from '../../services/api';

// Renomeei 'product' para 'productToEdit' e 'onSaved' para 'onSuccess' 
// para ficar igual ao que está no Products.jsx
export default function EditProductModal({ productToEdit, onClose, onSuccess }) {
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

  /* ============================================================================
   * Preencher formulário se for EDIÇÃO
   * ============================================================================
   */
  useEffect(() => {
    if (productToEdit) {
      setForm({
        name: productToEdit.name || '',
        category: productToEdit.category || '',
        purchase_price: productToEdit.purchase_price,
        sale_price: productToEdit.sale_price,
        stock_current: productToEdit.stock_current,
        stock_min: productToEdit.stock_min,
      });
    }
  }, [productToEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        category: form.category,
        purchase_price: Number(form.purchase_price),
        sale_price: Number(form.sale_price),
        stock_current: Number(form.stock_current || 0),
        stock_min: Number(form.stock_min || 0),
      };

      if (productToEdit) {
        // MODO EDIÇÃO (PUT)
        await api.put(`/products/${productToEdit.id}`, payload);
      } else {
        // MODO CRIAÇÃO (POST)
        await api.post('/products', payload);
      }

      onSuccess(); // Fecha e atualiza a lista
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      setError('Erro ao salvar produto. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{productToEdit ? 'Editar Produto' : 'Novo Produto'}</h2>

        <form className="modal-form" onSubmit={handleSubmit}>

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
              placeholder="Vinho, Espumante..."
            />
          </label>

          <div className="form-row">
            <label>
              Preço Compra (R$)
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
              Preço Venda (R$)
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
              Estoque Atual
              <input
                name="stock_current"
                type="number"
                value={form.stock_current}
                onChange={handleChange}
              />
            </label>

            <label>
              Estoque Mínimo
              <input
                name="stock_min"
                type="number"
                value={form.stock_min}
                onChange={handleChange}
              />
            </label>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}