import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Favorites = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteProductIds, setFavoriteProductIds] = useState([]);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/favorites');
      const products = res.data.map((f) => f.product);
      setFavorites(products);
      setFavoriteProductIds(products.map((p) => p._id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (productId) => {
    try {
      await axios.delete(`/api/favorites/${productId}`);
      setFavorites((prev) => prev.filter((p) => p._id !== productId));
      setFavoriteProductIds((prev) => prev.filter((id) => id !== productId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-8">
        {t('favorites')}
      </h1>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-700 text-lg mb-4 font-medium">
            {t('emptyFavorites')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              index={index}
              addToCart={addToCart}
              isFavorite={favoriteProductIds.includes(product._id)}
              toggleFavorite={() => toggleFavorite(product._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
