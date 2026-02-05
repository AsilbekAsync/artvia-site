import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { t, i18n } = useTranslation();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
            {t('cart')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 font-semibold">
            {t('emptyCart')}
          </p>
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.1, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all font-bold shadow-xl hover:shadow-2xl hover:shadow-cyan-300/50 animate-pulse-glow"
            >
              Continue Shopping
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-8">
        {t('cart')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-gray-900/50 p-6 flex flex-col sm:flex-row gap-4 border border-cyan-100/50 dark:border-gray-700/50"
            >
              <img
                src={`http://localhost:5000${item.image}`}
                alt={item.title}
                className="w-full sm:w-32 h-32 object-cover rounded-md"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=Product+Image';
                }}
              />

              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-[#4E0000] dark:text-red-300 font-semibold mb-4">
                  {item.price.toLocaleString()} × {item.quantity} = {(item.price * item.quantity).toLocaleString()} so'm
                </p>

                <div className="flex items-center space-x-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.15, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-xl hover:from-cyan-500 hover:to-blue-500 hover:text-white transition-all font-bold shadow-lg"
                    >
                      -
                    </motion.button>
                    <span className="px-5 py-2 bg-white dark:bg-gray-700 border-2 border-cyan-300 dark:border-cyan-600 rounded-xl text-cyan-700 dark:text-cyan-300 font-bold shadow-md">
                      {item.quantity}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-xl hover:from-cyan-500 hover:to-blue-500 hover:text-white transition-all font-bold shadow-lg"
                    >
                      +
                    </motion.button>
                  </div>

                  {/* Remove Button */}
                  <motion.button
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeFromCart(item._id)}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl hover:from-red-500 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl"
                  >
                    {t('remove')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-gray-900/50 p-6 sticky top-24 border border-cyan-100/50 dark:border-gray-700/50"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              {t('yourOrder')}
            </h2>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-gray-800 dark:text-gray-200">
                <span className="font-semibold text-lg">{t('total')}:</span>
                <span className="font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent text-2xl">{getTotalPrice().toLocaleString()} so'm</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 text-white rounded-xl hover:from-cyan-600 hover:via-blue-600 hover:to-teal-600 transition-all font-bold mb-4 shadow-xl hover:shadow-2xl hover:shadow-cyan-300/50 animate-pulse-glow"
            >
              {t('submitOrder')}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearCart}
              className="w-full py-3 bg-white dark:bg-gray-700 border-2 border-cyan-300 dark:border-cyan-600 text-cyan-600 dark:text-cyan-400 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-all font-semibold shadow-lg"
            >
              Clear Cart
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
