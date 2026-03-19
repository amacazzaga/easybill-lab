import React, { createContext, useContext, useState, useEffect } from 'react';

// Estado inicial: no autenticado
const AuthContext = createContext({
  user: null,
  role: null,
  authHeader: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authHeader, setAuthHeader] = useState(null);

  // Opcional: persistencia en localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    const storedAuthHeader = localStorage.getItem('authHeader');
    if (storedUser && storedRole) {
      setUser(storedUser);
      try {
        setRole(JSON.parse(storedRole));
      } catch {
        setRole(storedRole);
      }
      setAuthHeader(storedAuthHeader || null);
    }
  }, []);

  const login = (username, role, authHeaderValue) => {
    setUser(username);
    setRole(role);
    setAuthHeader(authHeaderValue || null);
    localStorage.setItem('user', username);
    localStorage.setItem('role', JSON.stringify(role));
    if (authHeaderValue) localStorage.setItem('authHeader', authHeaderValue);
    else localStorage.removeItem('authHeader');
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setAuthHeader(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('authHeader');
  };

  return (
    <AuthContext.Provider value={{ user, role, authHeader, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
