/**
 * Authentication Context
 * Global state management for authentication
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [club, setClub] = useState(null);
  const [enabledModules, setEnabledModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedClub = localStorage.getItem('club');
      const storedModules = localStorage.getItem('enabledModules');

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setClub(storedClub ? JSON.parse(storedClub) : null);
        setEnabledModules(storedModules ? JSON.parse(storedModules) : []);
        setIsAuthenticated(true);

        // Verify token is still valid by fetching current user
        try {
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data.user);
            setClub(response.data.club);
            setEnabledModules(response.data.enabledModules || []);

            // Update localStorage
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('club', JSON.stringify(response.data.club));
            localStorage.setItem('enabledModules', JSON.stringify(response.data.enabledModules || []));
          }
        } catch (error) {
          // Token invalid, clear auth
          clearAuth();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const clearAuth = () => {
    setUser(null);
    setClub(null);
    setEnabledModules([]);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('club');
    localStorage.removeItem('enabledModules');
  };

  const login = async (loginData) => {
    try {
      const response = await authService.login(loginData);
      
      if (response.success) {
        const { user, club, enabledModules, token } = response.data;

        // Store in state
        setUser(user);
        setClub(club);
        setEnabledModules(enabledModules || []);
        setIsAuthenticated(true);

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('club', JSON.stringify(club));
        localStorage.setItem('enabledModules', JSON.stringify(enabledModules || []));

        return { success: true };
      }

      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.',
      };
    }
  };

  const signup = async (signupData) => {
    try {
      const response = await authService.signup(signupData);
      
      if (response.success) {
        const { user, club, enabledModules, token } = response.data;

        // Store in state
        setUser(user);
        setClub(club);
        setEnabledModules(enabledModules || []);
        setIsAuthenticated(true);

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('club', JSON.stringify(club));
        localStorage.setItem('enabledModules', JSON.stringify(enabledModules || []));

        return { success: true };
      }

      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Signup failed. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore error, clear auth anyway
    } finally {
      clearAuth();
    }
  };

  const hasModule = (module) => {
    return enabledModules.includes(module);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isSuperAdmin = () => {
    return user?.role === 'SUPER_ADMIN';
  };

  const value = {
    user,
    club,
    enabledModules,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    hasModule,
    hasRole,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
