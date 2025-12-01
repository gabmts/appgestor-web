// src/pages/Login.jsx

import { useState } from 'react';
import api from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@luna.com'); // facilita testes
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ============================================================================
   * SUBMIT DO LOGIN
   * ============================================================================ */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });

      const { token, user } = res.data;

      localStorage.setItem('appgestor_token', token);
      localStorage.setItem('appgestor_user', JSON.stringify(user));

      onLoginSuccess({ token, user });
    } catch (err) {
      console.error('Erro login:', err);

      const msg =
        err.response?.data?.error ||
        'E-mail ou senha inválidos. Tente novamente.';

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Orbe decorativo de fundo (efeito Apple) */}
      <div className="login-orb login-orb-left" />
      <div className="login-orb login-orb-right" />

      <div className="login-container login-card-animated">
        <div className="login-header">
          <div className="login-logo-pill">
            <span className="login-logo-dot" />
            <span className="login-logo-text">A Casa da Luna</span>
          </div>

          <h1>AppGestor</h1>
          <h2>Painel de gestão do wine bar</h2>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              placeholder="admin@luna.com"
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={password}
              placeholder="Digite sua senha"
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              required
            />
          </label>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="hint">
          Dica para testes: <br />
          <strong>admin@luna.com</strong> — <strong>123456</strong>
        </p>
      </div>
    </div>
  );
}
