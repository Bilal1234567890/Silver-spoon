import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import api from '../Services/api';
import backgroundVideo from '../assets/ai.mp4';

interface Withdrawal {
  id: number;
  userId: number;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  User?: { username: string; email: string };
}

interface LeaderboardUser {
  id: number;
  username: string;
  email: string;
  referrals: number;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/admin/withdrawals/pending');
      setWithdrawals(res.data);
    } catch (err: any) {
      console.error('Failed to fetch pending:', err);
      setMessage('Failed to load pending withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/admin/leaderboard');
      console.log('📊 Leaderboard API response:', res.data);
      if (Array.isArray(res.data)) {
        setLeaderboard(res.data);
      } else {
        setLeaderboard([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch leaderboard:', err);
      setMessage('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'withdrawals') {
      fetchPending();
    } else if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const handleApprove = async (id: number) => {
    if (!window.confirm('Approve this withdrawal?')) return;
    try {
      await api.put(`/auth/admin/withdrawals/${id}/approve`);
      setMessage('Withdrawal approved!');
      fetchPending();
    } catch (err: any) {
      setMessage('Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('Reject this withdrawal?')) return;
    try {
      await api.put(`/auth/admin/withdrawals/${id}/reject`);
      setMessage('Withdrawal rejected and refunded.');
      fetchPending();
    } catch (err: any) {
      setMessage('Failed to reject');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <div className="text-gray-800 dark:text-gray-100">Welcome Admin! Overview stats here.</div>;
      case 'withdrawals':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Pending Withdrawals</h2>
            {message && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{message}</div>}
            {loading ? (
              <p>Loading...</p>
            ) : withdrawals.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No pending withdrawals.</p>
            ) : (
              withdrawals.map((w) => (
                <div key={w.id} className="bg-white dark:bg-gray-800/90 rounded-xl shadow p-4 mb-4 backdrop-blur-sm">
                  <p><strong>User:</strong> {w.User?.username} ({w.User?.email})</p>
                  <p><strong>Amount:</strong> ₦{Number(w.amount).toFixed(2)}</p>
                  <p><strong>Bank:</strong> {w.bankName}</p>
                  <p><strong>Account:</strong> {w.accountNumber} - {w.accountName}</p>
                  <p className="text-xs text-gray-400">{new Date(w.createdAt).toLocaleString()}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleApprove(w.id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded">Approve</button>
                    <button onClick={() => handleReject(w.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded">Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case 'add-balance':
        return <div>Add balance form (coming soon).</div>;
      case 'leaderboard':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">🏆 Leaderboard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Users with the most referrals</p>
            {loading ? (
              <p>Loading...</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No referrals yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-2">S/N</th>
                      <th className="text-left py-2 px-2">Username</th>
                      <th className="text-left py-2 px-2">Referrals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((u, idx) => (
                      <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2 px-2">{idx + 1}</td>
                        <td className="py-2 px-2 font-medium text-gray-800 dark:text-gray-100">{u.username}</td>
                        <td className="py-2 px-2 text-orange-500 font-bold">{u.referrals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

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
      <div className="relative z-10 max-w-md mx-auto px-4 pt-4 pb-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-fraunces text-gray-800 dark:text-gray-100">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button onClick={logout} className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Logout</button>
          </div>
        </div>

        <div className="flex justify-around bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-2 mb-6 backdrop-blur-sm">
          {['dashboard', 'withdrawals', 'add-balance', 'leaderboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-6 backdrop-blur-sm transition-colors duration-300">
          {renderContent()}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <div className="max-w-md mx-auto flex justify-around py-2">
          {['dashboard', 'withdrawals', 'add-balance', 'leaderboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center ${activeTab === tab ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <span className="text-xl">{tab === 'dashboard' ? '🏠' : tab === 'withdrawals' ? '💰' : tab === 'add-balance' ? '➕' : '🏆'}</span>
              <span className="text-xs">{tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;