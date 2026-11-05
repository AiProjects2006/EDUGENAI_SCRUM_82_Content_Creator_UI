import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentCreatorUser,
  isCreatorAuthenticated,
  loginCreator as serviceLogin,
  registerCreator as serviceRegister,
  logoutCreator as serviceLogout
} from '../services/creatorAuthService';

const CreatorAuthContext = createContext(null);

export function CreatorAuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentCreatorUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => isCreatorAuthenticated());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getCurrentCreatorUser());
      setIsAuthenticated(isCreatorAuthenticated());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const result = await serviceLogin(credentials);
      setUser(result.user);
      setIsAuthenticated(true);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await serviceRegister(userData);
      if (result.user && result.token) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await serviceLogout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreatorAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </CreatorAuthContext.Provider>
  );
}

export function useCreatorAuth() {
  const context = useContext(CreatorAuthContext);
  if (!context) {
    throw new Error('useCreatorAuth must be used within a CreatorAuthProvider');
  }
  return context;
}

export default CreatorAuthContext;

