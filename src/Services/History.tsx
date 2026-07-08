import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { Link } from 'react-router-dom';
import api from '../Services/api';
import backgroundVideo from '../assets/ai.mp4';

interface DepositItem {
  id: number;
  amount: number;
  type: string;
  description: string;
  status?: 'pending' | 'verified' | 'rejected';
  senderBank?: string;
  senderAccountNumber?: string;
  senderAccountName?: string;
  createdAt: string;
}

interface WithdrawalItem {
  id: number;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const getStatusDisplay = (status: string): { label: string; color: string } => {
  switch (status) {
    case 'verified':
      return { label: 'Successful', color: 'text-green-600' };
    case 'approved':
      return { label: 'Successful', color: 'text-green-600' };
    case 'rejected':
      return { label: 'Rejected', color: 'text-red-600' };
    case 'pending':
      return { label: 'Pending', color: 'text-yellow-600' };
    default:
      return { label: status, color: 'text-gray-600' };
  }
};

const History: React.FC = () => {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<DepositItem | WithdrawalItem | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

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

  const openReceipt = (item: DepositItem | WithdrawalItem) => {
    setSelectedTransaction(item);
    setShowReceipt(true);
  };

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

      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold font-fraunces text-gray-800 dark:text-gray-100">Transaction History</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-md mx-auto px-4 pt-4 pb-24">
        {/* Deposits */}
        {deposits.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">Deposits</h2>
            {deposits.map((dep) => {
              const statusInfo = dep.status ? getStatusDisplay(dep.status) : null;
              return (
                <div key={dep.id} className="bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-4 mb-3 backdrop-blur-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">+₦{Number(dep.amount).toFixed(2)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{dep.description || dep.type}</p>
                      {dep.type === 'deposit' && dep.status && (
                        <span className={`text-xs font-medium ${statusInfo?.color}`}>
                          {statusInfo?.label}
                        </span>
                      )}
                      {dep.senderBank && (
                        <p className="text-xs text-gray-400 mt-1">
                          From: {dep.senderBank} • {dep.senderAccountNumber} • {dep.senderAccountName}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400">
                        {new Date(dep.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => openReceipt(dep)}
                        className="mt-1 text-xs text-orange-500 hover:underline"
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Withdrawals */}
        {withdrawals.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3">Withdrawals</h2>
            {withdrawals.map((wit) => {
              const statusInfo = getStatusDisplay(wit.status);
              return (
                <div key={wit.id} className="bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-4 mb-3 backdrop-blur-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-red-600 dark:text-red-400">-₦{Number(wit.amount).toFixed(2)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {wit.bankName} • {wit.accountNumber}
                      </p>
                      <span className={`text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400">
                        {new Date(wit.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => openReceipt(wit)}
                        className="mt-1 text-xs text-orange-500 hover:underline"
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {deposits.length === 0 && withdrawals.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            <p>No transactions yet.</p>
          </div>
        )}
      </div>

      {/* ===== RECEIPT MODAL ===== */}
      {showReceipt && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold font-fraunces text-gray-800 dark:text-gray-100">SILVER SPOON</h2>
              <button onClick={() => setShowReceipt(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₦{Number(selectedTransaction.amount).toFixed(2)}
              </p>
              <p className={`text-sm font-semibold ${
                selectedTransaction.status === 'verified' || selectedTransaction.status === 'approved'
                  ? 'text-green-600'
                  : selectedTransaction.status === 'rejected'
                    ? 'text-red-600'
                    : 'text-yellow-600'
              }`}>
                {selectedTransaction.status === 'verified' || selectedTransaction.status === 'approved' ? 'Successful' :
                 selectedTransaction.status === 'rejected' ? 'Rejected' : 'Pending'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(selectedTransaction.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Receipt Details</p>

              {/* For withdrawals */}
              {'bankName' in selectedTransaction && (
                <>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Recipient Details</p>
                    <p className="text-sm text-gray-800 dark:text-gray-100">{selectedTransaction.accountName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedTransaction.bankName} | {selectedTransaction.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sender Details</p>
                    <p className="text-sm text-gray-800 dark:text-gray-100">{user?.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">SILVER SPOON</p>
                  </div>
                </>
              )}

              {/* For deposits */}
              {'senderBank' in selectedTransaction && selectedTransaction.senderBank && (
                <>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sender Details</p>
                    <p className="text-sm text-gray-800 dark:text-gray-100">{selectedTransaction.senderAccountName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedTransaction.senderBank} | {selectedTransaction.senderAccountNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Recipient Details</p>
                    <p className="text-sm text-gray-800 dark:text-gray-100">{user?.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">SILVER SPOON</p>
                  </div>
                </>
              )}

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Transaction No.</p>
                <p className="text-xs text-gray-800 dark:text-gray-100 font-mono">#{selectedTransaction.id}</p>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
              SILVER SPOON – Licensed by the Central Bank of Nigeria
            </div>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 backdrop-blur-sm z-50">
        <div className="max-w-md mx-auto flex justify-around py-2">
          <Link to="/dashboard" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">🏠</span><span className="text-xs">Home</span>
          </Link>
          <Link to="/orders" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">📋</span><span className="text-xs">Orders</span>
          </Link>
          <Link to="/history" className="flex flex-col items-center text-orange-500">
            <span className="text-xl">📊</span><span className="text-xs">History</span>
          </Link>
          <Link to="/task" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">📝</span><span className="text-xs">Task</span>
          </Link>
          <Link to="/mine" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">👤</span><span className="text-xs">Mine</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default History;