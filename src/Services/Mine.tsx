import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import api from '../Services/api';
import backgroundVideo from '../assets/ai.mp4';

// ✅ Full merged list of Nigerian banks (commercial, microfinance, wallet)
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

// ✅ Deduplicate and sort alphabetically
const BANKS = Array.from(new Set(ALL_BANKS)).sort((a, b) => a.localeCompare(b));

const Mine: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingBank, setLoadingBank] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBanks, setFilteredBanks] = useState(BANKS);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      setBankDetails({
        accountNumber: user.accountNumber || '',
        accountName: user.accountName || '',
        bankName: user.bankName || '',
      });
      if (!user.accountNumber || !user.accountName || !user.bankName) {
        setIsEditing(true);
      }
    }
  }, [user]);

  // Filter banks – search input accepts only letters and spaces, max 6 characters
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only letters (A-Z, a-z) and spaces, max 6 characters
    const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 6);
    setSearchTerm(lettersOnly);
    if (lettersOnly.trim() === '') {
      setFilteredBanks(BANKS);
    } else {
      const lower = lettersOnly.toLowerCase();
      setFilteredBanks(BANKS.filter(bank => bank.toLowerCase().includes(lower)));
    }
    setShowDropdown(true);
  };

  const handleSelectBank = (bank: string) => {
    setBankDetails({ ...bankDetails, bankName: bank });
    setSearchTerm(bank);
    setShowDropdown(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'accountNumber') {
      // Only digits, max 10
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setBankDetails({ ...bankDetails, accountNumber: digits });
    } else {
      setBankDetails({ ...bankDetails, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bankDetails.accountNumber.length !== 10) {
      setError('Account number must be exactly 10 digits');
      return;
    }
    setError('');
    setMessage('');
    setLoadingBank(true);
    try {
      await api.post('/auth/update-bank', bankDetails);
      setMessage('Bank details updated successfully!');
      setIsEditing(false);
      const res = await api.get('/auth/me');
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update bank details');
    } finally {
      setLoadingBank(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  if (!user) {
    return null;
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
          <h1 className="text-2xl font-bold font-fraunces text-gray-800 dark:text-gray-100">Profile</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-6 mb-6 backdrop-blur-sm transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-gray-700 flex items-center justify-center text-2xl">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-gray-500 dark:text-gray-400">👤</span>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-100">{user.username}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</p>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-6 mb-6 backdrop-blur-sm transition-colors duration-300">
          <h2 className="text-lg font-bold font-fraunces text-gray-800 dark:text-gray-100 mb-4">Bank Details</h2>
          {message && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{message}</div>}
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              {/* Bank Name with searchable dropdown */}
              <div className="mb-3 relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={searchTerm || bankDetails.bankName}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search bank (e.g., Access)"
                  maxLength={6}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange"
                />
                {showDropdown && filteredBanks.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto shadow-lg">
                    {filteredBanks.map((bank) => (
                      <div
                        key={bank}
                        onClick={() => handleSelectBank(bank)}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-gray-100"
                      >
                        {bank}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Account Number */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={bankDetails.accountNumber}
                  onChange={handleChange}
                  placeholder="10-digit account number"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange"
                  maxLength={10}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be exactly 10 digits</p>
              </div>

              {/* Account Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
                <input
                  type="text"
                  name="accountName"
                  value={bankDetails.accountName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loadingBank}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                {loadingBank ? 'Saving...' : 'Save Bank Details'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full mt-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div>
              <p className="text-gray-700 dark:text-gray-300"><strong>Bank:</strong> {bankDetails.bankName || 'Not set'}</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Account Number:</strong> {bankDetails.accountNumber || 'Not set'}</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Account Name:</strong> {bankDetails.accountName || 'Not set'}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-3 text-sm text-orange-500 hover:underline"
              >
                Edit Bank Details
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
        
        <a
            href="https://chat.whatsapp.com/IN4gECvkcJmF3hs6QCX61q?s=cl&p=a&mlu=0&ilr=0"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white dark:bg-gray-800/90 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-lg shadow transition backdrop-blur-sm flex items-center justify-center"
          >
            📞 WhatsApp Group
          </a>
          <a
            href="https://chat.whatsapp.com/EJwPU62uuL00GdYLQeiyEQ?s=cl&p=a&ilr=0&amv=3"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white dark:bg-gray-800/90 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-lg shadow transition backdrop-blur-sm flex items-center justify-center"
          >
            📞 Feedback on WhatsApp
          </a>
          <a
            href="https://x.com/BREAK_CHART"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white dark:bg-gray-800/90 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-lg shadow transition backdrop-blur-sm flex items-center justify-center"
          >
            📱 X
          </a>
          
          <button className="w-full bg-white dark:bg-gray-800/90 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-lg shadow transition backdrop-blur-sm">
            🛠️ Support
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg shadow transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300 backdrop-blur-sm">
        <div className="max-w-md mx-auto flex justify-around py-2">
          <Link to="/dashboard" className="flex flex-col items-center text-orange-500">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Home</span>
          </Link>
          
          <Link to="/orders" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
             <span className="text-xl">📋</span>
             <span className="text-xs">Orders</span>
          </Link>

          <Link to="/history" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">📊</span>
            <span className="text-xs">History</span>
          </Link>

           <Link to="/task" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
           <span className="text-xl">📝</span>
           <span className="text-xs">Task</span>
           </Link>

          <button className="flex flex-col items-center text-orange-500">
            <span className="text-xl">👤</span>
            <span className="text-xs">Mine</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Mine;