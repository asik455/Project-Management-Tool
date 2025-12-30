import React, { createContext, useContext, useState, useEffect } from 'react';

// Demo roles: 'admin', 'manager', 'member'
const defaultUser = {
  name: '',
  email: '',
  role: 'member',
  isAuthenticated: false,
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (saved && saved !== 'undefined' && token) {
        const parsedUser = JSON.parse(saved);
        return {
          ...parsedUser,
          isAuthenticated: true
        };
      }
      return { ...defaultUser };
    } catch (error) {
      console.warn('Error parsing user data from localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return { ...defaultUser };
    }
  });

  useEffect(() => {
    if (user.isAuthenticated) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  // Demo login (would be replaced by real auth)
  const login = (email, role = 'member', name = '') => {
    setUser({
      name: name || email.split('@')[0],
      email,
      role,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    setUser({ ...defaultUser });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/signin';
  };

  // For demo: allow switching roles
  const setRole = (role) => {
    if (user.isAuthenticated) {
      setUser((u) => ({ ...u, role }));
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      logout, 
      setRole,
      isAuthenticated: user.isAuthenticated 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); 