// src/components/modals/DeleteSaleModal.jsx

import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function DeleteSaleModal({ sale, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!sale) return null;

  // Compatibilidade com /reports/last-sales e /sales
  const productName = sale.product_name || sale.product || 'Produto';
  const qty = sale.quantity;
  const saleId = sale.id;

  /* ============================================================================
   * Fechar modal com ESC
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
   * Excluir venda
   * ============================================================================
   */
  async function handleDelete() {
    setError('');
    setLoading(true);

    try {
      await api.delete(`/sales/${saleId}`);

      if (onDeleted) {
        await onDeleted(); // recarregar listas
      }

      onClose();
    } catch (err) {
      console.error('Erro ao excluir venda:', err);
      setError('Erro ao excluir venda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div
        className="alert-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-sale-title"
        aria-describedby="delete-sale-description"
      >

        {/* Ícone de alerta visual */}
        <div className="alert-icon">!</div>

        <h3 id="delete-sale-title" className="alert-title">
          Excluir venda?
        </h3>

        <p id="delete-sale-description" className="alert-text">
          Tem certeza que deseja excluir a venda de{' '}
          <strong>{productName}</strong> —{' '}
          <strong>{qty} un.</strong>?
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
