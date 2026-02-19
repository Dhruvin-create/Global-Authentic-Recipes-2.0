'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        // Verify token with server
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);

        // Show success notification
        showNotification('Login successful! Welcome back.', 'success');

        // Role-based redirect
        const role = data.data.user.role;
        setTimeout(() => {
          if (role === 'SUPER_ADMIN') {
            router.push('/super-admin/dashboard');
          } else if (role === 'ADMIN') {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
        }, 1500);

        return { success: true };
      } else {
        showNotification(data.message || 'Login failed', 'error');
        return { success: false, message: data.message };
      }
    } catch (error) {
      showNotification('Network error. Please try again.', 'error');
      return { success: false, message: 'Network error' };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Account created successfully! Please verify your account.', 'success');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return { success: true };
      } else {
        showNotification(data.message || 'Registration failed', 'error');
        return { success: false, message: data.message };
      }
    } catch (error) {
      showNotification('Network error. Please try again.', 'error');
      return { success: false, message: 'Network error' };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    showNotification('Logged out successfully', 'success');
    router.push('/login');
  }, [router, showNotification]);

  const value = {
    user,
    loading,
    notification,
    login,
    signup,
    logout,
    checkAuth,
    showNotification,
    isAuthenticated: !!user,
    isAdmin: user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role),
    isSuperAdmin: user && user.role === 'SUPER_ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {notification && <Notification {...notification} />}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Notification Component
function Notification({ message, type }) {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-orange-500'
  }[type] || 'bg-blue-500';

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white px-6 py-4 rounded-2xl shadow-lg max-w-sm`}>
        <p className="font-bold">{message}</p>
      </div>
    </div>
  );
}