import React, { createContext, useContext, useState, useEffect } from 'react';

// Estado inicial: no autenticado
const AuthContext = createContext({
  user: null,
  role: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // Opcional: persistencia en localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    if (storedUser && storedRole) {
      setUser(storedUser);
      try {
        setRole(JSON.parse(storedRole));
      } catch {
        setRole(storedRole);
      }
    }
  }, []);

  const login = (username, role) => {
    setUser(username);
    setRole(role);
    localStorage.setItem('user', username);
    localStorage.setItem('role', JSON.stringify(role));
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
