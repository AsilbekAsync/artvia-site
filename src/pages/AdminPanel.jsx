import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import CategoryManagement from '../components/admin/CategoryManagement';
import ProductManagement from '../components/admin/ProductManagement';
import OrderManagement from '../components/admin/OrderManagement';
import WorksManagement from '../components/admin/WorksManagement';

const AdminPanel = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, productsRes, ordersRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/products'),
        axios.get('/api/orders'),
      ]);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'categories', label: t('categories') },
    { id: 'products', label: t('products', 'Products') },
    { id: 'orders', label: t('orders') },
    { id: 'works', label: 'Portfolio / Works' },
  ];

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
        {t('admin')}
      </h1>

      {/* Tabs */}
      <div className="border-b border-cyan-200 dark:border-gray-700 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-500 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-300 dark:hover:border-cyan-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'categories' && (
        <CategoryManagement
          categories={categories}
          onUpdate={fetchData}
        />
      )}
      {activeTab === 'products' && (
        <ProductManagement
          products={products}
          categories={categories}
          onUpdate={fetchData}
        />
      )}
      {activeTab === 'orders' && (
        <OrderManagement
          orders={orders}
          onUpdate={fetchData}
        />
      )}
      {activeTab === 'works' && (
        <WorksManagement
          onUpdate={fetchData}
        />
      )}
    </div>
  );
};

export default AdminPanel;
