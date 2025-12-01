// src/components/Header.jsx

import { useNavigate, NavLink } from 'react-router-dom';

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();

  function handleLogoutClick() {
    // limpar dados de sessão
    localStorage.removeItem('appgestor_token');
    localStorage.removeItem('appgestor_user');

    if (onLogout) onLogout();

    navigate('/login', { replace: true });
  }

  return (
    <header className="dashboard-header">
      {/* LADO ESQUERDO – TÍTULO + USUÁRIO */}
      <div className="header-left">
        <h1 className="header-title">
          <span className="header-title-dot" />
          AppGestor – A Casa da Luna 🍷
        </h1>

        {user && (
          <p className="header-user">
            Logado como:{' '}
            <strong>{user.name || 'Usuário'}</strong>
            {user.role && (
              <span className="header-role-badge">
                {user.role}
              </span>
            )}
          </p>
        )}
      </div>

      {/* CENTRO – NAV EM ESTILO “SEGMENTED CONTROL” */}
      <nav className="nav-links">
        <NavLink to="/" end>
          Dashboard
        </NavLink>

        <NavLink to="/products">
          Produtos
        </NavLink>

        <NavLink to="/sales">
          Vendas
        </NavLink>

        <NavLink to="/finance">
          Financeiro
        </NavLink>

        <NavLink to="/stock">
          Estoque
        </NavLink>
      </nav>

      {/* LADO DIREITO – BOTÃO SAIR */}
      <button
        type="button"
        className="btn-logout"
        onClick={handleLogoutClick}
      >
        Sair
      </button>
    </header>
  );
}
