import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [showingLatest, setShowingLatest] = useState(false);

  useEffect(() => {
    fetchCategory();
    fetchProducts();
    if (user) {
      fetchFavorites();
    }
  }, [categoryId, user]);

  const fetchCategory = async () => {
    try {
      const res = await axios.get(`/api/categories/${categoryId}`);
      setCategory(res.data);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/products/category/${categoryId}`);
      setProducts(res.data);
      
      // Agar kategoriyada mahsulotlar bo'lmasa, oxirgi 10 ta mahsulotni fetch qilish
      if (res.data.length === 0) {
        await fetchLatestProducts();
      } else {
        setShowingLatest(false);
        setLatestProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestProducts = async () => {
    try {
      const res = await axios.get('/api/products?limit=10');
      setLatestProducts(res.data.slice(0, 10)); // Faqat 10 ta mahsulot
      setShowingLatest(true);
    } catch (error) {
      console.error('Error fetching latest products:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await axios.get('/api/favorites');
      setFavorites(res.data.map((f) => f.product._id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (productId) => {
    if (!user) {
      alert('Please login to add favorites');
      return;
    }

    try {
      const isFavorite = favorites.includes(productId);
      if (isFavorite) {
        await axios.delete(`/api/favorites/${productId}`);
        setFavorites((prev) => prev.filter((id) => id !== productId));
      } else {
        await axios.post(`/api/favorites/${productId}`);
        setFavorites((prev) => [...prev, productId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getCategoryName = () => {
    if (!category) return t('categories');
    const lang = i18n.language;
    if (lang === 'uz') return category.nameUz || category.name;
    if (lang === 'ru') return category.nameRu || category.name;
    return category.name;
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
          {getCategoryName()}
        </h1>
        <p className="text-gray-600 font-semibold text-lg">
          {products.length} {products.length === 1 ? 'product' : 'products'} available
        </p>
      </motion.div>

      {products.length === 0 && !showingLatest ? (
        <div className="text-center py-12">
          <p className="text-gray-700 text-lg font-medium">
            No products found in this category
          </p>
        </div>
      ) : (
        <>
          {showingLatest && latestProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800"
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <span>✨</span>
                <span>Oxirgi qo'shilgan 10 ta mahsulot</span>
              </p>
            </motion.div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(showingLatest ? latestProducts : products).map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                addToCart={addToCart}
                isFavorite={favorites.includes(product._id)}
                toggleFavorite={() => toggleFavorite(product._id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryPage;
