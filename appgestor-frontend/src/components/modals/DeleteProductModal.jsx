// src/components/modals/DeleteProductModal.jsx

import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function DeleteProductModal({ product, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!product) return null;

  /* ============================================================================
   * Fechar modal com tecla ESC
   * ============================================================================
   */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);

    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  /* ============================================================================
   * Excluir produto
   * ============================================================================
   */
  async function handleDelete() {
    setLoading(true);
    setError('');

    try {
      await api.delete(`/products/${product.id}`);

      if (onDeleted) await onDeleted();

      onClose();
    } catch (err) {
      console.error('Erro ao excluir produto:', err);

      const msg =
        err.response?.data?.error ||
        'Erro ao excluir produto. Tente novamente.';

      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div
        className="alert-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
        aria-describedby="delete-product-description"
      >
        {/* Ícone de alerta */}
        <div className="alert-icon">!</div>

        <h2 id="delete-product-title" className="alert-title">
          Excluir produto?
        </h2>

        <p id="delete-product-description" className="alert-text">
          Tem certeza que deseja excluir o produto{' '}
          <strong>{product.name}</strong>?
          <br />
          <small>Essa ação não pode ser desfeita.</small>
        </p>

        {error && (
          <p className="error-msg" style={{ marginTop: 8 }}>
            {error}
          </p>
        )}

        <div className="alert-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="btn-danger"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Excluindo...' : 'Sim, excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}
