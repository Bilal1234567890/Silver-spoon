import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import backgroundVideo from '../assets/ai.mp4';

// Investment plans (same as Dashboard)
const PLANS = [
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

const Task: React.FC = () => {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Intersection Observer for iPhone-style blur effect
  useEffect(() => {
    if (!cardRefs.current.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.remove('blur-md', 'scale-95', 'opacity-40');
            el.classList.add('scale-100', 'opacity-100', 'z-10');
          } else {
            el.classList.remove('scale-100', 'opacity-100', 'z-10');
            el.classList.add('blur-md', 'scale-95', 'opacity-40');
          }
        });
      },
      { threshold: 0.6, rootMargin: '0px' }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold font-fraunces text-gray-800 dark:text-gray-100">Investment Plans</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
          Select a plan to invest and start earning daily returns
        </p>

        {/* Cards */}
        <div className="space-y-6">
          {PLANS.map((plan, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg p-5 backdrop-blur-sm transition-all duration-500 ease-out transform-gpu"
            >
              {/* Top: Name + Duration */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold font-fraunces text-gray-800 dark:text-gray-100">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{plan.duration}</p>
                </div>
                <span className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 text-xs font-semibold px-2 py-1 rounded-full">
                  Active
                </span>
              </div>

              {/* Middle: Daily & Total */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Daily Income</p>
                  <p className="text-lg font-bold text-orange-500">₦{plan.dailyEarning.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Income</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">₦{plan.totalEarning.toLocaleString()}</p>
                </div>
              </div>

              {/* Bottom: Price + Buy button */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  ₦{plan.amount.toLocaleString()}
                </span>
                <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2 rounded-lg transition">
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300 backdrop-blur-sm">
        <div className="max-w-md mx-auto flex justify-around py-2">
          <Link to="/dashboard" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Home</span>
          </Link>
          <button className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">📋</span>
            <span className="text-xs">Orders</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">👥</span>
            <span className="text-xs">Team</span>
          </button>
          <Link to="/task" className="flex flex-col items-center text-orange-500">
            <span className="text-xl">📝</span>
            <span className="text-xs">Task</span>
          </Link>
          <Link to="/mine" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">👤</span>
            <span className="text-xs">Mine</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Task;