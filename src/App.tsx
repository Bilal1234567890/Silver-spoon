import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Services/AuthContext';
import { ThemeProvider } from './Services/ThemeContext';
import HomePage from './Services/HomePage';
import RegistrationForm from './Services/RegistrationForm';
import LoginForm from './Services/LoginForm';
import Dashboard from './Services/Dashboard';
import ForgotPassword from './Services/ForgotPassword';
import Mine from './Services/Mine';
import Task from './Services/Task';
import AdminDashboard from './Services/AdminDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  useEffect(() => {
    document.title = 'SILVER-SPOON';
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/mine" element={<ProtectedRoute><Mine /></ProtectedRoute>} />
            <Route path="/task" element={<ProtectedRoute><Task /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;