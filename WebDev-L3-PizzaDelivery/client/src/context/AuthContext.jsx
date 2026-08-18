import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('pizza_user_token');
    if (!token) {
      setReady(true);
      return;
    }
    api.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => localStorage.removeItem('pizza_user_token'))
      .finally(() => setReady(true));
  }, []);

  function login(token, userData) {
    localStorage.setItem('pizza_user_token', token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('pizza_user_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
