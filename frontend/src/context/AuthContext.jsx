import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_USERS = {
  super_admin: {
    email: 'admin@redevelopease.in',
    password: 'admin123',
    label: 'Super Admin',
    desc: 'Platform Owner (Full Access)',
  },
  secretary: {
    email: 'secretary.greenview@gmail.com',
    password: 'sec123',
    label: 'Secretary',
    desc: 'Greenview Heights CHS',
  },
  committee_member: {
    email: 'committee.greenview@gmail.com',
    password: 'com123',
    label: 'Committee Member',
    desc: 'Sunita Patil (Reviewer)',
  },
  resident: {
    email: 'resident.rahul@gmail.com',
    password: 'res123',
    label: 'Approved Resident',
    desc: 'Rahul Deshmukh (Flat C-104)',
  },
  pending_resident: {
    email: 'pending.anita@gmail.com',
    password: 'res123',
    label: 'Pending Resident',
    desc: 'Anita Sharma (Needs Approval)',
  },
  builder: {
    email: 'builder.sharma@apexbuild.in',
    password: 'bld123',
    label: 'Builder Partner',
    desc: 'Apex Lifespaces & Infra',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('redevelopease_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('redevelopease_token');
      if (storedToken) {
        try {
          const res = await getMeApi();
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('[Auth Init Error]', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginApi({ email, password });
      if (res.data.success) {
        localStorage.setItem('redevelopease_token', res.data.token);
        localStorage.setItem('redevelopease_user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      const isPending = err.response?.data?.isPending || false;
      return { success: false, message: msg, isPending };
    }
  };

  const register = async (data) => {
    try {
      const res = await registerApi(data);
      return { success: true, message: res.data.message, data: res.data.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('redevelopease_token');
    localStorage.removeItem('redevelopease_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await getMeApi();
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('[Refresh User Error]', err);
    }
  };

  const quickLogin = async (roleKey) => {
    const creds = DEMO_USERS[roleKey];
    if (!creds) return;
    return await login(creds.email, creds.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        quickLogin,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
