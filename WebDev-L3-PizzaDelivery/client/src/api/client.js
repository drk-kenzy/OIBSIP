import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({ baseURL: `${API_URL}/api` });

// Attache automatiquement le token utilisateur, sauf si l'appelant a deja
// fourni un Authorization (cas des requetes admin, voir adminRequest).
api.interceptors.request.use(config => {
  if (!config.headers.Authorization) {
    const token = localStorage.getItem('pizza_user_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function adminRequest(config) {
  const token = localStorage.getItem('pizza_admin_token');
  return api({
    ...config,
    headers: { ...(config.headers || {}), Authorization: token ? `Bearer ${token}` : undefined },
  });
}

export { API_URL };
