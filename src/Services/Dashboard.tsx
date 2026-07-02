import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import backgroundVideo from '../assets/ai.mp4'; // adjust extension if needed

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle video playback based on theme
  useEffect(() => {
    if (!videoRef.current) return;
    if (theme === 'dark') {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 pb-20 relative overflow-hidden">
      {/* Background Video (only in dark mode) */}
      {theme === 'dark' && (
        <video
          ref={videoRef}
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
        {/* Header with time, user, theme toggle, logout */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {currentTime}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.username || 'User'}
            </span>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={logout}
              className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Banner / Hero */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl p-4 mb-4 text-white">
          <h2 className="text-lg font-bold">AI Work for You while sleeping</h2>
        </div>

        {/* Balance Card */}
        <div className="bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-4 mb-4 transition-colors duration-300 backdrop-blur-sm">
          <p className="text-sm text-gray-500 dark:text-orange-400">Account Balance (₦)</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">170,120.00</p>
          <div className="flex justify-between mt-3 gap-2">
            <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-lg transition">
              Invest
            </button>
            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-lg transition">
              Withdraw
            </button>
            <button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold py-2 rounded-lg transition">
              Daily Check
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-white dark:bg-gray-800/90 rounded-lg shadow p-3 text-center transition-colors duration-300 backdrop-blur-sm">
            <p className="text-xl font-bold text-gray-900 dark:text-white">1</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
          </div>
          <div className="bg-white dark:bg-gray-800/90 rounded-lg shadow p-3 text-center transition-colors duration-300 backdrop-blur-sm">
            <p className="text-xl font-bold text-orange-500">₦1,120</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
          </div>
          <div className="bg-white dark:bg-gray-800/90 rounded-lg shadow p-3 text-center transition-colors duration-300 backdrop-blur-sm">
            <p className="text-xl font-bold text-gray-900 dark:text-white">0</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
          </div>
          <div className="bg-white dark:bg-gray-800/90 rounded-lg shadow p-3 text-center transition-colors duration-300 backdrop-blur-sm">
            <p className="text-xl font-bold text-gray-900 dark:text-white">0</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
          </div>
        </div>

        {/* Featured Products */}
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">★ Featured Products</h3>

        {/* Product Card */}
        <div className="bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-4 transition-colors duration-300 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">VIP1</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">120 Days Investment Cycle</p>
            </div>
            <span className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 text-xs font-semibold px-2 py-1 rounded-full">
              Popular
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Daily Income</p>
              <p className="text-lg font-bold text-orange-500">₦280</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Income</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">₦33,695</p>
            </div>
          </div>

          <button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition">
            Buy Now / ₦3,500
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300 backdrop-blur-sm">
        <div className="max-w-md mx-auto flex justify-around py-2">
          <button className="flex flex-col items-center text-orange-500">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">📋</span>
            <span className="text-xs">Orders</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">👥</span>
            <span className="text-xs">Team</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">📝</span>
            <span className="text-xs">Task</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">👤</span>
            <span className="text-xs">Mine</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;