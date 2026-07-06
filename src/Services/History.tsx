import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../Services/api';
import backgroundVideo from '../assets/ai.mp4';

interface DepositItem {
  id: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

interface WithdrawalItem {
  id: number;
  amount: number;
  bankName: string;
  accountNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const History: React.FC = () => {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/auth/history');
        setDeposits(res.data.deposits);
        setWithdrawals(res.data.withdrawals);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setHistoryLoading(false);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  if (loading || historyLoading) {
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

      <div className="relative z-10 max-w-md mx-auto px-4 pt-4 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-fraunces text-gray-800 dark:text-gray-100">Transaction History</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        {/* Deposits */}
        {deposits.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">Deposits</h2>
            {deposits.map((dep) => (
              <div key={dep.id} className="bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-4 mb-3 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      +₦{Number(dep.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{dep.description || dep.type}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(dep.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Withdrawals */}
        {withdrawals.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">Withdrawals</h2>
            {withdrawals.map((wit) => (
              <div key={wit.id} className="bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-4 mb-3 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      -₦{Number(wit.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {wit.bankName} • {wit.accountNumber}
                    </p>
                    <span className={`text-xs font-medium ${
                      wit.status === 'approved' ? 'text-green-600' :
                      wit.status === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {wit.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(wit.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {deposits.length === 0 && withdrawals.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            <p>No transactions yet.</p>
          </div>
        )}
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
          <Link to="/history" className="flex flex-col items-center text-orange-500">
            <span className="text-xl">📊</span>
            <span className="text-xs">History</span>
          </Link>
          <Link to="/task" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
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

export default History;