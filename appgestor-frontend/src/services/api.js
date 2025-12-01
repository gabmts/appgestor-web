// src/services/api.js

import axios from 'axios';

/* ============================================================================
 * CONFIGURAÇÃO PRINCIPAL DO AXIOS
 * ============================================================================
 * - baseURL centralizada (pode ajustar conforme ambiente)
 * - interceptores para enviar token automaticamente
 * - estrutura limpa e profissional
 * ============================================================================
 */

const api = axios.create({
  baseURL: "https://appgestor-backend.onrender.com/api", // <- adicionamos /api aqui
});

/* ============================================================================
 * INTERCEPTOR DE REQUEST
 * ============================================================================
 * Antes de cada requisição:
 * - adiciona Authorization: Bearer <token> caso exista no localStorage
 * ============================================================================
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('appgestor_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* ============================================================================
 * (OPCIONAL) INTERCEPTOR DE RESPONSE – TRATAMENTO GLOBAL DE ERROS
 * ============================================================================
 * Aqui você pode:
 * - Redirecionar usuário para login caso receba 401
 * - Mostrar alertas globais
 * - Logar erros para debug
 *
 * Não habilitei nada que altere seu fluxo atual.
 * ============================================================================
 */

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.warn('Token expirado / não autorizado');
//       // Aqui poderia forçar logout automático, se quiser no futuro
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
