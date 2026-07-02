import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import spoonLogo from '../assets/spoon.jpg';

const RegistrationForm: React.FC = () => {
  const { sendCode, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    code: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(30);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSendCode = async () => {
    if (!form.email || !form.phone) {
      setErrors({ ...errors, email: 'Email and phone required', phone: 'Email and phone required' });
      return;
    }
    setLoading(true);
    try {
      await sendCode(form.email, form.phone);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrors({ ...errors, general: err.response?.data?.message || 'Failed to send code' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.email) newErrors.email = 'Email required';
    if (!form.phone) newErrors.phone = 'Phone required';
    if (!form.password) newErrors.password = 'Password required';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!form.code) newErrors.code = 'Verification code required';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      await register(form); // we don't need the response
      setShowSuccess(true);
      setRedirectCountdown(30);
    } catch (err: any) {
      setErrors({ ...errors, general: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showSuccess) return;
    if (redirectCountdown === 0) {
      navigate('/login');
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [showSuccess, redirectCountdown, navigate]);

  const handleLoginNow = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300 relative">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row transition-colors duration-300">
        {/* Left: Spoon Image */}
        <div className="md:w-1/2 h-48 md:h-auto bg-orange-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          <img src={spoonLogo} alt="Spoon" className="w-full h-full object-cover" />
        </div>

        {/* Right: Form */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
          <button
            onClick={() => navigate('/')}
            className="self-start mb-4 text-sm text-gray-500 dark:text-gray-400 hover:text-orange dark:hover:text-orange transition flex items-center gap-1"
          >
            ← Go Back
          </button>

          <h2 className="text-2xl font-bold font-fraunces text-gray-800 dark:text-gray-100 mb-6">Create Account</h2>

          {errors.general && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{errors.general}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange focus:border-transparent transition"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange focus:border-transparent transition"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-orange"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-orange"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="mb-4 flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verification Code</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange focus:border-transparent transition"
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0 || loading}
                className={`px-6 py-2 rounded-lg bg-orange hover:bg-orange-dark text-white font-semibold whitespace-nowrap transition ${
                  countdown > 0 || loading ? 'opacity-50 cursor-not-allowed' : ''
                } self-end`}
              >
                {countdown > 0 ? `${countdown}s` : 'Send Code'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange hover:bg-orange-dark text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-sm mt-4 text-gray-600 dark:text-gray-400">
            Already have an account? <Link to="/login" className="text-orange hover:underline">Login</Link>
          </p>
        </div>
      </div>

      {/* ===== SUCCESS OVERLAY (no username) ===== */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full rounded-2xl shadow-2xl p-8 text-center transform transition-all">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold font-fraunces text-gray-800 dark:text-gray-100">
              Registration Successful!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Your account has been created. Please log in.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Redirecting to login in <span className="font-bold">{redirectCountdown}</span> seconds
            </p>
            <button
              onClick={handleLoginNow}
              className="mt-6 px-6 py-3 bg-orange hover:bg-orange-dark text-white font-semibold rounded-lg transition w-full"
            >
              Login Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;