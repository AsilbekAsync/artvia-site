import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, index, addToCart, isFavorite, toggleFavorite }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getProductTitle = () => {
    const lang = i18n.language;
    if (lang === 'uz') return product.titleUz || product.title;
    if (lang === 'ru') return product.titleRu || product.title;
    return product.title;
  };

  const handleBuy = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product);
    // Redirect to checkout after adding to cart
    navigate('/checkout');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.03 }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-gray-900/50 overflow-hidden hover:shadow-2xl transition-all duration-300 border border-cyan-100/50 dark:border-gray-700/50 group"
    >
      {/* Category Name */}
      <div className="px-4 pt-4 pb-2">
        <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide bg-cyan-50 dark:bg-cyan-900/30 px-2 py-1 rounded-full">
          {product.categoryName || (product.category?.name || '')}
        </span>
      </div>

      {/* Product Image */}
      <Link to={`/product/${product._id}`}>
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50">
          <motion.img
            src={`http://localhost:5000${product.image}`}
            alt={getProductTitle()}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.5 }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x300?text=Product+Image';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors line-clamp-2">
          {getProductTitle()}
          </h3>
        </Link>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            {product.price.toLocaleString()} so'm
          </span>
          <div className="flex items-center space-x-2">
            {/* Add to Cart Icon */}
            <motion.button
              whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
              whileTap={{ scale: 0.9 }}
              onClick={() => addToCart(product)}
              className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-cyan-300/50 text-lg"
              title={t('addToCart')}
            >
              🛒
            </motion.button>

            {/* Like Icon */}
            {user && (
              <motion.button
                whileHover={{ scale: 1.2, rotate: [0, 10, -10, 10, 0] }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFavorite}
                className={`p-2.5 rounded-full transition-all shadow-lg text-lg ${
                  isFavorite
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 border-2 border-cyan-300 dark:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/30'
                }`}
                title={t('favorites')}
              >
                ❤️
              </motion.button>
            )}
          </div>
        </div>

        {/* Buy Button */}
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBuy}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 text-white rounded-xl hover:from-cyan-600 hover:via-blue-600 hover:to-teal-600 transition-all font-bold shadow-xl hover:shadow-2xl hover:shadow-cyan-300/50 animate-pulse-glow"
        >
          {t('buy')}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
