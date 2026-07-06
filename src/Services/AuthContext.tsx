import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../Services/api';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  email: string;
  role?: 'admin' | 'user';
  phone: string;
  balance: number;
  totalIncome: number;
  totalOrders: number;
  bonus: string | null;
  invest: number;
  orders: number;
  referrals: number;
  // New bank details
  profilePicture: string | null;
  accountNumber: string | null;
  accountName: string | null;
  bankName: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<any>;
  sendCode: (email: string, phone: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => { setUser(res.data); setLoading(false); })
        .catch(() => { localStorage.removeItem('token'); setLoading(false); });
    } else setLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();
    const res = await api.post('/auth/login', { identifier: trimmedIdentifier, password: trimmedPassword });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    // ✅ Redirect based on role
    if (res.data.user.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const register = async (userData: any) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const sendCode = async (email: string, phone: string) => {
    await api.post('/auth/send-code', { email, phone });
  };

  const forgotPassword = async (email: string) => {
    await api.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    await api.post('/auth/reset-password', { email, code, newPassword });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, sendCode, forgotPassword, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};