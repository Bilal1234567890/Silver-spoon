import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../Services/api';
import backgroundVideo from '../assets/ai.mp4';

const Dashboard: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Announcement state
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcementStep, setAnnouncementStep] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [referralError, setReferralError] = useState('');
  const [referralSuccess, setReferralSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  // Withdrawal modal state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(1);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);

  // ✅ Withdrawal availability (Nigeria time)
  const [isWithdrawAvailable, setIsWithdrawAvailable] = useState(false);

  // ✅ Check withdrawal availability every minute using Nigeria time
  useEffect(() => {
    const checkAvailability = () => {
      const now = new Date();
      const nigeriaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
      const day = nigeriaTime.getDay();
      const hours = nigeriaTime.getHours();

      // Available: Mon-Fri, 10:00 AM - 5:59 PM (strictly before 6:00 PM)
      const isWeekday = day >= 1 && day <= 5;
      const isWithinTime = hours >= 10 && hours < 18;

      setIsWithdrawAvailable(isWeekday && isWithinTime);
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 60000);
    return () => clearInterval(interval);
  }, []);

  const safeNumber = (value: any): number => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Safe announcement check
  useEffect(() => {
    if (loading) return;
    try {
      if (!user || user.bonus === 'used') {
        setShowAnnouncement(false);
        setAnnouncementStep(2);
      } else {
        setShowAnnouncement(true);
        setAnnouncementStep(0);
      }
    } catch (err) {
      console.error('Announcement error:', err);
      setShowAnnouncement(false);
    }
  }, [user, loading]);

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

  const handleNext = () => {
    if (announcementStep === 0) setAnnouncementStep(1);
  };

  const handleCancel = () => {
    setShowAnnouncement(false);
    setAnnouncementStep(2);
  };

  const handleVerifyReferral = async () => {
    if (!referralCode.trim()) {
      setReferralError('Please enter a referral code (username)');
      return;
    }
    setIsVerifying(true);
    setReferralError('');
    setReferralSuccess('');
    try {
      const res = await api.post('/auth/verify-referral', { referralCode: referralCode.trim() });
      const userRes = await api.get('/auth/me');
      setNewBalance(safeNumber(userRes.data.balance));
      setReferralSuccess(res.data.message);
      setShowAnnouncement(false);
      setAnnouncementStep(2);
      if (user) {
        user.balance = userRes.data.balance;
        user.bonus = userRes.data.bonus;
      }
      setReferralCode('');
    } catch (err: any) {
      setReferralError(err.response?.data?.message || 'Invalid referral code');
    } finally {
      setIsVerifying(false);
    }
  };

  // === Withdrawal flow (two-step) ===
  const handleWithdraw = () => {
    if (!isWithdrawAvailable) {
      setWithdrawError('Withdrawals are not available at this time.');
      return;
    }
    if (!user?.accountNumber || !user?.accountName || !user?.bankName) {
      navigate('/mine');
      return;
    }
    setShowWithdraw(true);
    setWithdrawStep(1);
    setConfirmChecked(false);
    setWithdrawError('');
    setWithdrawSuccess('');
    setWithdrawAmount('');
  };

 const handleWithdrawSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setWithdrawError('');
  setWithdrawSuccess('');
  try {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 5500) {
      setWithdrawError('Minimum withdrawal is ₦5,500');
      return;
    }
    const res = await api.post('/auth/withdraw', { amount });
    setWithdrawSuccess(res.data.message);
    // Optionally update balance in state if you have a global state
    // For now, we reload to reflect the new balance
    setTimeout(() => {
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWithdrawStep(1);
      window.location.reload(); // ⬅️ Reload to fetch updated user balance
      // navigate('/history'); // or navigate after reload
    }, 3000);
  } catch (err: any) {
    setWithdrawError(err.response?.data?.message || 'Withdrawal failed');
  }
};

  // Investment plans data
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

  const displayBalance = safeNumber(user?.balance);
  const displayInvest = safeNumber(user?.invest);
  const displayOrders = user?.orders || 0;
  const displayReferrals = user?.referrals || 0;
  const displayBonusUsed = user?.bonus === 'used' ? 1 : 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 pb-20 relative overflow-hidden">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      )}

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
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{currentTime}</span>
          <div className="flex items-center gap-3">
            <Link to="/mine" className="flex items-center gap-2 hover:opacity-80 transition">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.username || 'User'}</span>
              <div className="w-8 h-8 rounded-full bg-orange-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-200">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
            >
              {theme === 'light' ? '🌙' : '☀️'}
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
            >
              {showBalance ? '👁️' : '🙈'}
            </button>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {showBalance ? displayBalance.toFixed(2) : '••••••'}
          </p>
          <div className="flex justify-between mt-3 gap-2">
            <button
              onClick={() => navigate('/task')}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-lg transition"
            >
              Invest
            </button>
            <button
              onClick={handleWithdraw}
              disabled={!isWithdrawAvailable}
              className={`flex-1 ${isWithdrawAvailable ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'} text-white text-sm font-semibold py-2 rounded-lg transition`}
            >
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
            <p className="text-xl font-bold text-gray-900 dark:text-white">{displayOrders}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
          </div>
          <div className="bg-white dark:bg-gray-800/90 rounded-lg shadow p-3 text-center transition-colors duration-300 backdrop-blur-sm">
            <p className="text-xl font-bold text-orange-500">₦{displayInvest.toFixed(2)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Investments</p>
          </div>
          <div className="bg-white dark:bg-gray-800/90 rounded-lg shadow p-3 text-center transition-colors duration-300 backdrop-blur-sm">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{displayReferrals}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Referrals</p>
          </div>
          <div className="bg-white dark:bg-gray-800/90 rounded-lg shadow p-3 text-center transition-colors duration-300 backdrop-blur-sm">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{displayBonusUsed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Bonus Used</p>
          </div>
        </div>

        {/* Investment Plans */}
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">★ Investment Plans</h3>
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

      {/* Announcement Modal */}
      {showAnnouncement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full rounded-2xl shadow-2xl p-6 text-center transform transition-all">
            {announcementStep === 0 && (
              <>
                <h3 className="text-xl font-bold font-fraunces text-gray-800 dark:text-gray-100 mb-3">📢 Announcement</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 text-left leading-relaxed">
                  Dear user, the Federal Government of Nigeria has approved the Petition written from the Silver Spoon organization that the Accountant General <strong>Abdullahi Musa Mali</strong> has been replaced by <strong>JULIET CLEVER</strong>. She is now the trusted Staff been organized by the Company. All payments, either sent or received, will be organized by <strong>JULIET CLEVER</strong>.
                </p>
                <p className="mt-2 text-sm font-bold text-orange-500">THANK YOU.</p>
                <button onClick={handleNext} className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition">Next →</button>
              </>
            )}
            {announcementStep === 1 && (
              <>
                <h3 className="text-xl font-bold font-fraunces text-gray-800 dark:text-gray-100 mb-3">🎁 Referral Bonus</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Input a referral code (username) of another user to get <strong>₦1,500</strong> welcome bonus!</p>
                <div className="mt-4">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter username"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange focus:border-transparent transition"
                    disabled={isVerifying}
                  />
                  {referralError && <p className="text-red-500 text-sm mt-1">{referralError}</p>}
                  {referralSuccess && <p className="text-green-500 text-sm mt-1">{referralSuccess}</p>}
                  {newBalance !== null && (
                    <p className="text-green-600 font-bold mt-2">New Balance: ₦{newBalance.toFixed(2)}</p>
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={handleVerifyReferral} disabled={isVerifying} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50">{isVerifying ? 'Verifying...' : 'Verify'}</button>
                  <button onClick={handleCancel} className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-2 rounded-lg transition">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Withdrawal Modal (two-step) */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full rounded-2xl shadow-2xl p-6 text-center transform transition-all">
            <h3 className="text-xl font-bold font-fraunces text-gray-800 dark:text-gray-100 mb-3">💰 {withdrawStep === 1 ? 'Withdraw Funds' : 'Confirm Withdrawal'}</h3>

            {withdrawStep === 1 && (
              <>
                <div className="text-left mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Bank:</strong> {user?.bankName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Account Number:</strong> {user?.accountNumber}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Account Name:</strong> {user?.accountName}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₦) - min 5,500</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="5500"
                    step="100"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="confirmCheck"
                    checked={confirmChecked}
                    onChange={(e) => setConfirmChecked(e.target.checked)}
                    className="w-4 h-4 text-orange-500"
                  />
                  <label htmlFor="confirmCheck" className="text-sm text-gray-600 dark:text-gray-300">I confirm that the above bank details are correct.</label>
                </div>
                <button
                  onClick={() => {
                    if (!confirmChecked) {
                      setWithdrawError('Please confirm your bank details.');
                      return;
                    }
                    const amount = parseFloat(withdrawAmount);
                    if (isNaN(amount) || amount < 5500) {
                      setWithdrawError('Minimum withdrawal is ₦5,500');
                      return;
                    }
                    setWithdrawStep(2);
                    setWithdrawError('');
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition"
                >
                  Proceed
                </button>
                <button type="button" onClick={() => setShowWithdraw(false)} className="w-full mt-2 text-gray-500 hover:text-gray-700 text-sm">Cancel</button>
              </>
            )}

            {withdrawStep === 2 && (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">You are about to withdraw <strong>₦{parseFloat(withdrawAmount).toFixed(2)}</strong> to:</p>
                <div className="text-left mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Bank:</strong> {user?.bankName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Account:</strong> {user?.accountNumber}</p>
                </div>
                {withdrawError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{withdrawError}</div>}
                {withdrawSuccess && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{withdrawSuccess}</div>}
                <button onClick={handleWithdrawSubmit} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition">Confirm Withdrawal</button>
                <button type="button" onClick={() => setShowWithdraw(false)} className="w-full mt-2 text-gray-500 hover:text-gray-700 text-sm">Cancel</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300 backdrop-blur-sm">
        <div className="max-w-md mx-auto flex justify-around py-2">
          <Link to="/dashboard" className="flex flex-col items-center text-orange-500"><span className="text-xl">🏠</span><span className="text-xs">Home</span></Link>
          <button className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition"><span className="text-xl">📋</span><span className="text-xs">Orders</span></button>
          <Link to="/history" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition"><span className="text-xl">📊</span><span className="text-xs">History</span></Link>
          <Link to="/task" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition"><span className="text-xl">📝</span><span className="text-xs">Task</span></Link>
          <Link to="/mine" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition"><span className="text-xl">👤</span><span className="text-xs">Mine</span></Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;