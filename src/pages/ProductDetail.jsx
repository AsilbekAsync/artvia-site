import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ProductAIAssistant from '../components/ProductAIAssistant';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
    if (user) {
      checkFavorite();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const res = await axios.get(`/api/favorites/check/${id}`);
      setIsFavorite(res.data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setFavoriteLoading(true);
      if (isFavorite) {
        await axios.delete(`/api/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await axios.post(`/api/favorites/${id}`);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product);
    navigate('/checkout');
  };

  const getProductTitle = () => {
    if (!product) return '';
    const lang = i18n.language;
    if (lang === 'uz') return product.titleUz || product.title;
    if (lang === 'ru') return product.titleRu || product.title;
    return product.title;
  };

  const getProductDescription = () => {
    if (!product) return '';
    const lang = i18n.language;
    if (lang === 'uz') return product.descriptionUz || product.description;
    if (lang === 'ru') return product.descriptionRu || product.description;
    return product.description;
  };

  const getCategoryName = () => {
    if (!product) return '';
    const lang = i18n.language;
    if (product.category) {
      if (lang === 'uz') return product.category.nameUz || product.category.name;
      if (lang === 'ru') return product.category.nameRu || product.category.name;
      return product.category.name;
    }
    return product.categoryName || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-700 dark:text-gray-300 text-lg">Product not found</p>
        <Link to="/" className="text-cyan-600 dark:text-cyan-400 hover:underline mt-4 inline-block">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
      >
        {/* Product Image */}
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-gray-900/50 overflow-hidden border border-cyan-100/50 dark:border-gray-700/50"
          >
            <img
              src={`http://localhost:5000${product.image}`}
              alt={getProductTitle()}
              className="w-full h-auto object-cover"
            />
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category */}
          <div>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide bg-cyan-50 dark:bg-cyan-900/30 px-3 py-1 rounded-full">
              {getCategoryName()}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
            {getProductTitle()}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
              {product.price.toLocaleString()} so'm
            </span>
          </div>

          {/* Description */}
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
              {getProductDescription()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all font-semibold text-lg shadow-lg"
            >
              Savatga Qo'shish
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              className={`px-6 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg ${
                isFavorite
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
              }`}
            >
              {favoriteLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isFavorite ? '❤️' : '🤍'} {isFavorite ? 'Sevimlilardan Olib Tashlash' : "Sevimlilarga Qo'shish"}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* AI Assistant Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-12"
      >
        <ProductAIAssistant productId={product._id} />
      </motion.div>
    </div>
  );
};

export default ProductDetail;
