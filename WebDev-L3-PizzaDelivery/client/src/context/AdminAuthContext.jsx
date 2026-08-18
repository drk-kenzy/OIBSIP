import { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('pizza_admin_info');
    return stored ? JSON.parse(stored) : null;
  });

  function login(token, adminData) {
    localStorage.setItem('pizza_admin_token', token);
    localStorage.setItem('pizza_admin_info', JSON.stringify(adminData));
    setAdmin(adminData);
  }

  function logout() {
    localStorage.removeItem('pizza_admin_token');
    localStorage.removeItem('pizza_admin_info');
    setAdmin(null);
  }

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
