import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import backgroundVideo from '../assets/ai.mp4';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Placeholder user data – will come from DB later
  const userBalance = 0.00;
  const userTotalIncome = 0.00;
  const userTotalOrders = 0;

  // Update time
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

  // Video playback
  useEffect(() => {
    if (!videoRef.current) return;
    if (theme === 'dark') {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [theme]);

  // Investment plans data (SILVER SPOON 1 to 10)
  const plans = [
    { name: 'SILVER SPOON 1', amount: 3000, dailyEarning: 810, totalEarning: 36450, duration: '45 days' },
    { name: 'SILVER SPOON 2', amount: 6000, dailyEarning: 1620, totalEarning: 72900, duration: '45 days' },
    { name: 'SILVER SPOON 3', amount: 10000, dailyEarning: 2700, totalEarning: 121500, duration: '45 days' },
    { name: 'SILVER SPOON 4', amount: 20000, dailyEarning: 5400, totalEarning: 243000, duration: '45 days' },
    { name: 'SILVER SPOON 5', amount: 30000, dailyEarning: 8100, totalEarning: 364500, duration: '45 days' },
    { name: 'SILVER SPOON 6', amount: 50000, dailyEarning: 13500, totalEarning: 607500, duration: '45 days' },
    { name: 'SILVER SPOON 7', amount: 100000, dailyEarning: 27000, totalEarning: 1215000, duration: '45 days' },
    { name: 'SILVER SPOON 8', amount: 200000, dailyEarning: 54000, totalEarning: 2430000, duration: '45 days' },
    { name: 'SILVER SPOON 9', amount: 300000, dailyEarning: 81000, totalEarning: 3645000, duration: '45 days' },
    { name: 'SILVER SPOON 10', amount: 500000, dailyEarning: 135000, totalEarning: 6075000, duration: '45 days' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 pb-20 relative overflow-hidden">
      {/* Background Video */}
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
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {currentTime}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.username || 'User'}
            </span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
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

        {/* Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl p-4 mb-4 text-white">
          <h2 className="text-lg font-bold">AI Work for You while sleeping</h2>
        </div>

        {/* Balance Card */}
        <div className="bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-4 mb-4 transition-colors duration-300 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-orange-400">Account Balance (₦)</p>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-xl text-gray-500 dark:text-gray-400 hover:text-orange transition"
              aria-label="Toggle balance visibility"
            >
              {showBalance ? '👁️' : '🙈'}
            </button>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {showBalance ? userBalance.toFixed(2) : '••••••'}
          </p>
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
            <p className="text-xl font-bold text-gray-900 dark:text-white">{userTotalOrders}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
          </div>
          <div className="bg-white dark:bg-gray-800/90 rounded-lg shadow p-3 text-center transition-colors duration-300 backdrop-blur-sm">
            <p className="text-xl font-bold text-orange-500">₦{userTotalIncome.toFixed(2)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
          </div>
          <div className="bg-white dark:bg-gray-800/90 rounded-lg shadow p-3 text-center transition-colors duration-300 backdrop-blur-sm">
            <p className="text-xl font-bold text-gray-900 dark:text-white">0</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Referrals</p>
          </div>
          <div className="bg-white dark:bg-gray-800/90 rounded-lg shadow p-3 text-center transition-colors duration-300 backdrop-blur-sm">
            <p className="text-xl font-bold text-gray-900 dark:text-white">0</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Bonus</p>
          </div>
        </div>

        {/* Featured Products / Investment Plans */}
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">★ Investment Plans</h3>

        {/* Plans Table – mobile responsive */}
        <div className="bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-3 transition-colors duration-300 backdrop-blur-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-1 text-gray-700 dark:text-gray-300">Plan</th>
                <th className="text-left py-2 px-1 text-gray-700 dark:text-gray-300">Amount (₦)</th>
                <th className="text-left py-2 px-1 text-gray-700 dark:text-gray-300">Daily (₦)</th>
                <th className="text-left py-2 px-1 text-gray-700 dark:text-gray-300">Total (₦)</th>
                <th className="text-left py-2 px-1 text-gray-700 dark:text-gray-300">Duration</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <td className="py-2 px-1 font-semibold text-gray-800 dark:text-gray-200">{plan.name}</td>
                  <td className="py-2 px-1 text-orange-500 font-medium">{plan.amount.toLocaleString()}</td>
                  <td className="py-2 px-1 text-gray-600 dark:text-gray-300">{plan.dailyEarning.toLocaleString()}</td>
                  <td className="py-2 px-1 text-green-600 dark:text-green-400 font-medium">{plan.totalEarning.toLocaleString()}</td>
                  <td className="py-2 px-1 text-gray-500 dark:text-gray-400 text-xs">{plan.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
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