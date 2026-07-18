import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import api from '../Services/api';
import backgroundVideo from '../assets/ai.mp4';

// ===== BANK LIST (copied from Mine.tsx) =====
const ALL_BANKS = [
  'AB Microfinance Bank Nigeria Limited',
  'Abubakar Tafawa Balewa University Microfinance Bank (ATBU MFB)',
  'Accion Microfinance Bank Limited',
  'Access Bank Plc',
  'Addosser Microfinance Bank Limited',
  'Advans La Fayette Microfinance Bank',
  'Ahmadu Bello University Microfinance Bank (ABU MFB)',
  'ALAT by Wema',
  'Bank of Agriculture',
  'Carbon (Carbon Microfinance Bank)',
  'Citibank Nigeria Limited',
  'Diamond Bank',
  'Ecobank Nigeria',
  'Enterprise Bank',
  'FairMoney (FairMoney Microfinance Bank)',
  'Federal University Dutsin-Ma Microfinance Bank (FUDMA MFB)',
  'Fidelity Bank Plc',
  'First Bank of Nigeria Limited (FirstBank)',
  'First City Monument Bank Limited (FCMB)',
  'Globus Bank Limited',
  'Guaranty Trust Bank Plc (GTBank)',
  'Hasal Microfinance Bank Limited',
  'Heritage Bank',
  'Infinity Microfinance Bank',
  'Jaiz Bank Plc',
  'Keystone Bank Limited',
  'Kuda Bank (Kuda Microfinance Bank)',
  'LAPO Microfinance Bank Limited',
  'Lotus Bank Limited',
  'Mainstreet Microfinance Bank Limited',
  'MainStreet Bank',
  'Mintyn (Mint Digital Bank)',
  'Mkudi Microfinance Bank',
  'MoMo PSB (MTN)',
  'Moniepoint (Moniepoint Microfinance Bank)',
  'Mutual Trust Microfinance Bank',
  'Nova Commercial Bank',
  'NowNow (NowNow Digital Systems)',
  'NPF Microfinance Bank Plc',
  'Opay (Opay Digital Services)',
  'Optimus Bank Limited',
  'Paga (Paga Tech Limited)',
  'Palmpay (Palmpay Limited)',
  'Parallex Bank Limited',
  'PocketApp (by PiggyVest)',
  'Polaris Bank Plc',
  'PremiumTrust Bank Limited',
  'Providus Bank Limited',
  'Rubies Bank (Rubies Digital Bank)',
  'Rubies Microfinance Bank',
  'Safe Haven Microfinance Bank',
  'Seedvest Microfinance Bank',
  'Signature Bank Limited',
  'SmartCash PSB (Airtel)',
  'Sparkle Microfinance Bank',
  'Stanbic IBTC Bank Plc',
  'Standard Chartered Bank Nigeria Limited',
  'Sterling Bank Plc',
  'SunTrust Bank Nigeria Limited',
  'TAJBank Limited',
  'The Alternative Bank Limited',
  'Titan Trust Bank Limited',
  'Unical Microfinance Bank',
  'Union Bank of Nigeria Plc',
  'United Bank for Africa Plc (UBA)',
  'Unity Bank Plc',
  'University of Lagos Microfinance Bank (Unilag MFB)',
  'VFD Bank / VBank (VFD Microfinance Bank)',
  'VFD Microfinance Bank',
  'Wema Bank Plc',
  'Zenith Bank Plc',
  '9mobile (9 Payment Service)',
];
const BANKS = Array.from(new Set(ALL_BANKS)).sort((a, b) => a.localeCompare(b));

// ===== INVESTMENT PLANS (updated daily income) =====
const PLANS = [
  { name: 'SILVER SPOON 1', amount: 3000, dailyEarning: 250, totalEarning: 250 * 45, duration: '45 days' },
  { name: 'SILVER SPOON 2', amount: 6000, dailyEarning: 500, totalEarning: 500 * 45, duration: '45 days' },
  { name: 'SILVER SPOON 3', amount: 10000, dailyEarning: 750, totalEarning: 750 * 45, duration: '45 days' },
  { name: 'SILVER SPOON 4', amount: 20000, dailyEarning: 1200, totalEarning: 1200 * 45, duration: '45 days' },
  { name: 'SILVER SPOON 5', amount: 30000, dailyEarning: 1500, totalEarning: 1500 * 45, duration: '45 days' },
  { name: 'SILVER SPOON 6', amount: 50000, dailyEarning: 2000, totalEarning: 2000 * 45, duration: '45 days' },
  { name: 'SILVER SPOON 7', amount: 100000, dailyEarning: 5000, totalEarning: 5000 * 45, duration: '45 days' },
  { name: 'SILVER SPOON 8', amount: 200000, dailyEarning: 7000, totalEarning: 7000 * 45, duration: '45 days' },
  { name: 'SILVER SPOON 9', amount: 300000, dailyEarning: 12000, totalEarning: 12000 * 45, duration: '45 days' },
  { name: 'SILVER SPOON 10', amount: 500000, dailyEarning: 15000, totalEarning: 15000 * 45, duration: '45 days' },
];

const Task: React.FC = () => {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ===== INVESTMENT MODAL STATE =====
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [investLoading, setInvestLoading] = useState(false);
  const [investMessage, setInvestMessage] = useState('');

  // ===== SENDER DETAILS MODAL STATE =====
  const [showSenderModal, setShowSenderModal] = useState(false);
  const [senderDetails, setSenderDetails] = useState({
    senderBank: '',
    senderAccountNumber: '',
    senderAccountName: '',
  });
  const [senderSearchTerm, setSenderSearchTerm] = useState('');
  const [senderFilteredBanks, setSenderFilteredBanks] = useState(BANKS);
  const [senderShowDropdown, setSenderShowDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ===== IPHONE-STYLE SCROLL EFFECT =====
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

  // ===== HANDLE BUY =====
  const handleBuy = (plan: any) => {
    const balance = Number(user?.balance || 0);
    if (balance >= plan.amount) {
      setSelectedPlan(plan);
      setShowConfirm(true);
    } else {
      setSelectedPlan(plan);
      setTopUpAmount(plan.amount - balance);
      setShowInsufficient(true);
    }
  };

  // ===== CONFIRM INVESTMENT =====
  const handleInvestConfirm = async () => {
    if (!selectedPlan) return;
    setInvestLoading(true);
    setInvestMessage('');
    try {
      const res = await api.post('/auth/invest', {
        planName: selectedPlan.name,
        amount: selectedPlan.amount,
        dailyIncome: selectedPlan.dailyEarning,
        totalIncome: selectedPlan.totalEarning,
        duration: 45,
      });
      if (user) user.balance = res.data.newBalance;
      setShowConfirm(false);
      setSelectedPlan(null);
      setInvestMessage('Investment successful!');
      setTimeout(() => setInvestMessage(''), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Investment failed';
      if (errorMsg.includes('active investments')) {
        alert(errorMsg);
      } else {
        setInvestMessage(errorMsg);
        setTimeout(() => setInvestMessage(''), 3000);
      }
    } finally {
      setInvestLoading(false);
    }
  };

  // ===== SENDER MODAL HANDLERS =====
  const handleSenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'senderAccountNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setSenderDetails({ ...senderDetails, senderAccountNumber: digits });
    } else {
      setSenderDetails({ ...senderDetails, [name]: value });
    }
  };

  const handleSenderSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 5);
    setSenderSearchTerm(value);
    if (value.trim() === '') {
      setSenderFilteredBanks(BANKS);
    } else {
      const lower = value.toLowerCase();
      setSenderFilteredBanks(BANKS.filter(bank => bank.toLowerCase().includes(lower)));
    }
    setSenderShowDropdown(true);
  };

  const handleSelectSenderBank = (bank: string) => {
    setSenderDetails({ ...senderDetails, senderBank: bank });
    setSenderSearchTerm(bank);
    setSenderShowDropdown(false);
  };

  const handleDone = async () => {
    if (!senderDetails.senderBank || !senderDetails.senderAccountNumber || !senderDetails.senderAccountName) {
      alert('Please fill all sender details');
      return;
    }
    if (senderDetails.senderAccountNumber.length !== 10) {
      alert('Account number must be 10 digits');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/deposit', {
        amount: topUpAmount,
        description: `Top-up for ${selectedPlan.name} (₦${selectedPlan.amount.toLocaleString()})`,
        senderBank: senderDetails.senderBank,
        senderAccountNumber: senderDetails.senderAccountNumber,
        senderAccountName: senderDetails.senderAccountName,
      });
      alert('Deposit recorded. It will be verified shortly.');
      setShowSenderModal(false);
      setShowInsufficient(false);
      setSenderDetails({ senderBank: '', senderAccountNumber: '', senderAccountName: '' });
      setSenderSearchTerm('');
    } catch (err) {
      alert('Failed to record deposit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
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

      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold font-fraunces text-gray-800 dark:text-gray-100">Investment Plans</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-md mx-auto px-4 pt-4 pb-24">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
          Select a plan to invest and start earning daily returns
        </p>

        {investMessage && (
          <div className={`p-2 rounded mb-4 text-center text-sm ${
            investMessage.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {investMessage}
          </div>
        )}

        <div className="space-y-6">
          {PLANS.map((plan, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg p-5 backdrop-blur-sm transition-all duration-500 ease-out transform-gpu"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold font-fraunces text-gray-800 dark:text-gray-100">{plan.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{plan.duration}</p>
                </div>
                <span className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 text-xs font-semibold px-2 py-1 rounded-full">Active</span>
              </div>
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
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">₦{plan.amount.toLocaleString()}</span>
                <button onClick={() => handleBuy(plan)} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2 rounded-lg transition">Buy Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CONFIRM MODAL ===== */}
      {showConfirm && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full rounded-2xl shadow-2xl p-6 text-center">
            <h3 className="text-xl font-bold font-fraunces text-gray-800 dark:text-gray-100">Confirm Investment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Are you sure you want to invest in <strong>{selectedPlan.name}</strong> for ₦{selectedPlan.amount.toLocaleString()}?
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 rounded-lg">Cancel</button>
              <button onClick={handleInvestConfirm} disabled={investLoading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition disabled:opacity-50">
                {investLoading ? 'Processing...' : 'Invest'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== INSUFFICIENT BALANCE MODAL (updated) ===== */}
      {showInsufficient && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full rounded-2xl shadow-2xl p-6 text-center">
            <h3 className="text-xl font-bold font-fraunces text-gray-800 dark:text-gray-100">Insufficient Balance</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              You need ₦{selectedPlan.amount.toLocaleString()} to buy this plan. 
            </p>
            

            {/* Bank details – label left, value right */}
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mt-4">
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bank:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">OPAY</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-gray-200 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Number:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">644-8110-930</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-gray-200 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Name:</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">BSM Alpha-Tech Hub</span>
              </div>
            </div>
            You have ₦{Number(user?.balance || 0).toFixed(2)}.
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Please top up ₦{topUpAmount.toFixed(2)} to proceed.</p>

            <button
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
              onClick={() => {
                setShowSenderModal(true);
              }}
            >
              I have sent the money
            </button>
            <button onClick={() => setShowInsufficient(false)} className="mt-2 text-sm text-gray-500 hover:underline">Cancel</button>
          </div>
        </div>
      )}

      {/* ===== SENDER DETAILS MODAL ===== */}
      {showSenderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold font-fraunces text-gray-800 dark:text-gray-100 mb-4">Sender Details</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Please provide your bank details for verification.</p>

            <div className="mb-3 relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sender Bank</label>
              <input
                type="text"
                value={senderSearchTerm || senderDetails.senderBank}
                onChange={handleSenderSearchChange}
                onFocus={() => setSenderShowDropdown(true)}
                placeholder="Search bank (e.g., Access)"
                maxLength={5}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange"
              />
              {senderShowDropdown && senderFilteredBanks.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto shadow-lg">
                  {senderFilteredBanks.map((bank) => (
                    <div
                      key={bank}
                      onClick={() => handleSelectSenderBank(bank)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-gray-100"
                    >
                      {bank}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
              <input
                type="text"
                name="senderAccountNumber"
                value={senderDetails.senderAccountNumber}
                onChange={handleSenderChange}
                placeholder="10-digit account number"
                maxLength={10}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
              <input
                type="text"
                name="senderAccountName"
                value={senderDetails.senderAccountName}
                onChange={handleSenderChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSenderModal(false);
                  setSenderSearchTerm('');
                  setSenderDetails({ senderBank: '', senderAccountNumber: '', senderAccountName: '' });
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDone}
                disabled={submitting}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Done'}
              </button>
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
          <Link to="/history" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">📊</span><span className="text-xs">History</span>
          </Link>
          <Link to="/task" className="flex flex-col items-center text-orange-500">
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

export default Task;