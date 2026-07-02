import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import spoonLogo from '../assets/spoon.jpg';

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row transition-colors duration-300">
        {/* Left: Spoon Image - full, no circle */}
        <div className="md:w-1/2 h-48 md:h-auto bg-orange-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          <img 
            src={spoonLogo} 
            alt="Spoon" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: Form */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
          {/* Go Back button */}
          <button
            onClick={() => navigate('/')}
            className="self-start mb-4 text-sm text-gray-500 dark:text-gray-400 hover:text-orange dark:hover:text-orange transition flex items-center gap-1"
          >
            ← Go Back
          </button>

          <h2 className="text-2xl font-bold font-fraunces text-gray-800 dark:text-gray-100 mb-6">Welcome Back</h2>
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email or Username</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange focus:border-transparent transition"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-orange"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange hover:bg-orange-dark text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm mt-4 text-gray-600 dark:text-gray-400">
            Don't have an account? <Link to="/register" className="text-orange hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;