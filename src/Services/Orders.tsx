import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { Link } from 'react-router-dom';
import api from '../Services/api';
import backgroundVideo from '../assets/ai.mp4';

interface Order {
  id: number;
  planName: string;
  amount: number;
  dailyIncome: number;
  totalIncome: number;
  duration: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

const Orders: React.FC = () => {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/auth/orders');
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  if (loading || ordersLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
      <div className="relative z-10 max-w-md mx-auto px-4 pt-4 pb-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-fraunces text-gray-800 dark:text-gray-100">My Orders</h1>
          <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-4 mb-4 backdrop-blur-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">{order.planName}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Amount: ₦{Number(order.amount).toFixed(2)}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  order.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                }`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <div><span className="text-gray-500">Daily</span><br/>₦{Number(order.dailyIncome).toFixed(2)}</div>
                <div><span className="text-gray-500">Total</span><br/>₦{Number(order.totalIncome).toFixed(2)}</div>
                <div><span className="text-gray-500">Ends</span><br/>{new Date(order.endDate).toLocaleDateString()}</div>
              </div>

              {/* ✅ Walking cartoon animation (only for active orders) */}
              {order.status === 'active' && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="relative h-12 overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {/* Cartoon character walking left to right with money, right to left without */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="animate-walk-cartoon text-2xl">
                        <span className="inline-block mr-1">🧑‍💼</span>
                        <span className="inline-block animate-money">💰</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">Active – earning daily</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <div className="max-w-md mx-auto flex justify-around py-2">
          <Link to="/dashboard" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">🏠</span><span className="text-xs">Home</span>
          </Link>
          <Link to="/orders" className="flex flex-col items-center text-orange-500">
            <span className="text-xl">📋</span><span className="text-xs">Orders</span>
          </Link>
          <Link to="/history" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">📊</span><span className="text-xs">History</span>
          </Link>
          <Link to="/task" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">📝</span><span className="text-xs">Task</span>
          </Link>
          <Link to="/mine" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 transition">
            <span className="text-xl">👤</span><span className="text-xs">Mine</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Orders;