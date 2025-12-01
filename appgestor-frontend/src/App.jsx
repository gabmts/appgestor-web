// src/App.jsx

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Finance from './pages/Finance';
import Stock from './pages/Stock';

export default function App() {
  const [auth, setAuth] = useState({
    token: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('appgestor_token');
    const user = localStorage.getItem('appgestor_user');

    if (token && user) {
      setAuth({
        token,
        user: JSON.parse(user),
        loading: false,
      });
    } else {
      setAuth({
        token: null,
        user: null,
        loading: false,
      });
    }
  }, []);

  function handleLoginSuccess({ token, user }) {
    setAuth({ token, user, loading: false });
  }

  function handleLogout() {
    setAuth({ token: null, user: null, loading: false });
  }

  if (auth.loading) {
    return <div className="app-container">Carregando...</div>;
  }

  const isAuthenticated = !!auth.token;

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Dashboard user={auth.user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Produtos */}
        <Route
          path="/products"
          element={
            isAuthenticated ? (
              <Products user={auth.user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Vendas */}
        <Route
          path="/sales"
          element={
            isAuthenticated ? (
              <Sales user={auth.user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Financeiro */}
        <Route
          path="/finance"
          element={
            isAuthenticated ? (
              <Finance user={auth.user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Estoque Crítico */}
        <Route
          path="/stock"
          element={
            isAuthenticated ? (
              <Stock user={auth.user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
