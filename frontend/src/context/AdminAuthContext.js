import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminLogin as apiAdminLogin, getAdminMe } from '../services/adminApi';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('kv_admin_token');
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getAdminMe();
      if (data && data.role === 'admin') {
        setAdmin(data);
        setAuthError(null);
      } else {
        localStorage.removeItem('kv_admin_token');
        setAdmin(null);
        setAuthError('Access denied: You do not possess administrator privileges.');
      }
    } catch (err) {
      localStorage.removeItem('kv_admin_token');
      setAdmin(null);
      setAuthError(err.error || 'Admin session expired');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await apiAdminLogin(email, password);
      if (data.token && data.user && data.user.role === 'admin') {
        localStorage.setItem('kv_admin_token', data.token);
        setAdmin(data.user);
        return data;
      }
      throw new Error('Account does not possess administrator privileges.');
    } catch (err) {
      const errorMsg = err.error || err.message || 'Login failed';
      setAuthError(errorMsg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('kv_admin_token');
    setAdmin(null);
    setAuthError(null);
  };

  return (
    <AdminAuthContext.Provider value={{
      admin,
      loading,
      authError,
      login,
      logout,
      checkAuth,
      isAuthenticated: Boolean(admin && admin.role === 'admin')
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;
