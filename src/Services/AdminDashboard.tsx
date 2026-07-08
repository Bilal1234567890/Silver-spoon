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

interface Deposit {
  id: number;
  userId: number;
  amount: number;
  type: string;
  description: string;
  status: 'pending' | 'verified' | 'rejected';
  senderBank?: string;
  senderAccountNumber?: string;
  senderAccountName?: string;
  User?: { username: string; email: string };
  createdAt: string;
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
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ===== FETCH PENDING WITHDRAWALS =====
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

  // ===== FETCH PENDING DEPOSITS =====
  const fetchPendingDeposits = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/admin/deposits/pending');
      setDeposits(res.data);
    } catch (err: any) {
      console.error('Failed to fetch pending deposits:', err);
      setMessage('Failed to load pending deposits');
    } finally {
      setLoading(false);
    }
  };

  // ===== FETCH LEADERBOARD =====
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/admin/leaderboard');
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
    } else if (activeTab === 'deposits') {
      fetchPendingDeposits();
    } else if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  // ===== WITHDRAWAL ACTIONS =====
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

  // ===== DEPOSIT ACTIONS =====
  const handleApproveDeposit = async (id: number) => {
    if (!window.confirm('Approve this deposit?')) return;
    try {
      await api.put(`/auth/admin/deposits/${id}/approve`);
      setMessage('Deposit approved!');
      fetchPendingDeposits();
    } catch (err: any) {
      setMessage('Failed to approve deposit');
    }
  };

  const handleRejectDeposit = async (id: number) => {
    if (!window.confirm('Reject this deposit?')) return;
    try {
      await api.put(`/auth/admin/deposits/${id}/reject`);
      setMessage('Deposit rejected.');
      fetchPendingDeposits();
    } catch (err: any) {
      setMessage('Failed to reject deposit');
    }
  };

  // ===== RECEIPT CARD RENDERER =====
  const ReceiptCard: React.FC<{
    title: string;
    amount: number;
    status: string;
    date: string;
    user: { username: string; email: string };
    recipient?: { bank: string; accountNumber: string; accountName: string };
    sender?: { bank: string; accountNumber: string; accountName: string };
    actions?: React.ReactNode;
  }> = ({ title, amount, status, date, user, recipient, sender, actions }) => {
    const statusColor = status === 'pending' ? 'text-yellow-600' : status === 'approved' || status === 'verified' ? 'text-green-600' : 'text-red-600';
    const statusLabel = status === 'pending' ? 'Pending' : status === 'approved' || status === 'verified' ? 'Successful' : 'Rejected';

    return (
      <div className="bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-4 mb-4 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">User: {user.username} ({user.email})</p>
          </div>
          <span className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</span>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Amount</span>
            <p className="font-bold text-gray-900 dark:text-white">₦{Number(amount).toFixed(2)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Date</span>
            <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(date).toLocaleString()}</p>
          </div>
        </div>

        {/* Recipient Details (for withdrawals) */}
        {recipient && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Recipient Details</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{recipient.accountName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{recipient.bank} | {recipient.accountNumber}</p>
          </div>
        )}

        {/* Sender Details (for deposits) */}
        {sender && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Sender Details</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{sender.accountName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{sender.bank} | {sender.accountNumber}</p>
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="mt-3 flex gap-2">
            {actions}
          </div>
        )}
      </div>
    );
  };

  // ===== RENDER CONTENT =====
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
                <ReceiptCard
                  key={w.id}
                  title="Withdrawal Request"
                  amount={w.amount}
                  status={w.status}
                  date={w.createdAt}
                  user={w.User!}
                  recipient={{
                    bank: w.bankName,
                    accountNumber: w.accountNumber,
                    accountName: w.accountName,
                  }}
                  actions={
                    <>
                      <button onClick={() => handleApprove(w.id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded text-sm">Approve</button>
                      <button onClick={() => handleReject(w.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm">Reject</button>
                    </>
                  }
                />
              ))
            )}
          </div>
        );

      case 'deposits':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Pending Deposits</h2>
            {message && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{message}</div>}
            {loading ? (
              <p>Loading...</p>
            ) : deposits.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No pending deposits.</p>
            ) : (
              deposits.map((d) => (
                <ReceiptCard
                  key={d.id}
                  title="Deposit Request"
                  amount={d.amount}
                  status={d.status}
                  date={d.createdAt}
                  user={d.User!}
                  sender={{
                    bank: d.senderBank || 'N/A',
                    accountNumber: d.senderAccountNumber || 'N/A',
                    accountName: d.senderAccountName || 'N/A',
                  }}
                  actions={
                    <>
                      <button onClick={() => handleApproveDeposit(d.id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded text-sm">Approve</button>
                      <button onClick={() => handleRejectDeposit(d.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm">Reject</button>
                    </>
                  }
                />
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

        {/* Tab buttons with smaller text to fit */}
        <div className="flex flex-wrap justify-around bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-2 mb-6 backdrop-blur-sm gap-1">
          {['dashboard', 'withdrawals', 'deposits', 'add-balance', 'leaderboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap ${
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
          {['dashboard', 'withdrawals', 'deposits', 'add-balance', 'leaderboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center ${activeTab === tab ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <span className="text-xl">
                {tab === 'dashboard' ? '🏠' : tab === 'withdrawals' ? '💰' : tab === 'deposits' ? '📥' : tab === 'add-balance' ? '➕' : '🏆'}
              </span>
              <span className="text-xs">{tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;