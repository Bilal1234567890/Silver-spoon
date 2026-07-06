import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useNavigate } from 'react-router-dom';
import backgroundVideo from '../assets/ai.mp4';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Dashboard Overview</h2>
            <p className="text-gray-600 dark:text-gray-300">Welcome Admin! Here you can manage the platform.</p>
            {/* Add stats or summary cards here */}
          </div>
        );
      case 'withdrawals':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Withdrawal Requests</h2>
            <p className="text-gray-600 dark:text-gray-300">List of pending withdrawal requests.</p>
          </div>
        );
      case 'add-balance':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Add Balance</h2>
            <p className="text-gray-600 dark:text-gray-300">Manually add balance to user accounts.</p>
          </div>
        );
      case 'leaderboard':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Leaderboard</h2>
            <p className="text-gray-600 dark:text-gray-300">Top investors and earners.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 pb-20 relative overflow-hidden">
      {/* Background Video */}
      {theme === 'dark' && (
        <video
          src={backgroundVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
        />
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-md mx-auto px-4 pt-4 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-fraunces text-gray-800 dark:text-gray-100">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={handleLogout}
              className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-around bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-2 mb-6 backdrop-blur-sm">
          {['dashboard', 'withdrawals', 'add-balance', 'leaderboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-6 backdrop-blur-sm transition-colors duration-300">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation (simplified for admin) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300 backdrop-blur-sm">
        <div className="max-w-md mx-auto flex justify-around py-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center ${activeTab === 'dashboard' ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex flex-col items-center ${activeTab === 'withdrawals' ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <span className="text-xl">💰</span>
            <span className="text-xs">Withdrawals</span>
          </button>
          <button
            onClick={() => setActiveTab('add-balance')}
            className={`flex flex-col items-center ${activeTab === 'add-balance' ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <span className="text-xl">➕</span>
            <span className="text-xs">Add Balance</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex flex-col items-center ${activeTab === 'leaderboard' ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <span className="text-xl">🏆</span>
            <span className="text-xs">Leaderboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;