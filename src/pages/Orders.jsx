import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(null);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    }
    fetchOrders();
  }, [location.state]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/orders/my');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      pending_payment: 'bg-orange-500',
      payment_uploaded: 'bg-blue-500',
      payment_confirmed: 'bg-green-500',
      paid: 'bg-blue-500',
      processing: 'bg-purple-500',
      shipped: 'bg-indigo-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      pending_payment: 'Pending Payment',
      payment_uploaded: 'Payment Uploaded - Waiting for Confirmation',
      payment_confirmed: 'Payment Confirmed',
      paid: 'Paid',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return texts[status] || status;
  };

  const handleScreenshotChange = (e, orderId) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile({ file, orderId });
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadScreenshot = async (orderId) => {
    if (!screenshotFile || screenshotFile.orderId !== orderId) {
      return;
    }

    // Validate file size (5MB max)
    if (screenshotFile.file.size > 5 * 1024 * 1024) {
      setMessage('Fayl hajmi 5MB dan katta bo\'lmasligi kerak');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(screenshotFile.file.type)) {
      setMessage('Faqat rasm fayllari qabul qilinadi (JPG, PNG, GIF, WEBP)');
      return;
    }

    try {
      setUploadingScreenshot(orderId);
      setMessage('');

      console.log('[Orders] Uploading screenshot:', {
        orderId: orderId,
        fileName: screenshotFile.file.name,
        fileSize: screenshotFile.file.size,
        fileType: screenshotFile.file.type,
      });

      const formData = new FormData();
      formData.append('screenshot', screenshotFile.file);

      // DO NOT set Content-Type manually - let browser set it with boundary
      // Authorization header is automatically added by axios interceptor in main.jsx
      const response = await axios.post(`/api/orders/${orderId}/payment-screenshot`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress({ [orderId]: percentCompleted });
          console.log('[Orders] Upload progress:', percentCompleted + '%');
        },
      });

      console.log('[Orders] Screenshot uploaded successfully:', response.data);

      setMessage('To\'lov cheki screenshot\'i muvaffaqiyatli yuklandi! Admin tasdiqlashini kuting.');
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setUploadProgress({});
      fetchOrders();
    } catch (error) {
      console.error('[Orders] Error uploading screenshot:', error);
      setMessage(error.response?.data?.message || 'Screenshot yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      setUploadProgress({});
    } finally {
      setUploadingScreenshot(null);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
          My Orders
        </h1>
        <motion.button
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all font-bold shadow-xl hover:shadow-2xl hover:shadow-cyan-300/50"
        >
          Continue Shopping
        </motion.button>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md"
        >
          {message}
        </motion.div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-700 text-lg mb-4 font-medium">
            You haven't placed any orders yet.
          </p>
          <motion.button
            whileHover={{ scale: 1.1, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all font-bold shadow-xl hover:shadow-2xl hover:shadow-cyan-300/50 animate-pulse-glow"
          >
            Start Shopping
          </motion.button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transition-all border border-cyan-100/50 ${
                order.status === 'delivered'
                  ? 'border-2 border-green-500 bg-green-50'
                  : ''
              }`}
            >
              <div className="p-6">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {order.status === 'delivered' && order.deliveredAt && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-2 inline-flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full"
                      >
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          ✅ Buyurtma yetkazildi
                        </span>
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                    <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mt-2">
                      {order.totalPrice.toLocaleString()} so'm
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Order Items ({order.items.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <img
                          src={`http://localhost:5000${item.image || item.product?.image || ''}`}
                          alt={item.name || item.product?.title || 'Product'}
                          className="w-20 h-20 object-cover rounded-md"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x80?text=Product';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {item.name || item.product?.title || 'Product'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Qty: {item.quantity} × {item.price.toLocaleString()} so'm
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                            {(item.price * item.quantity).toLocaleString()} so'm
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Delivery Address:
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {order.deliveryAddress?.region || 'N/A'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {order.deliveryAddress?.address || 'N/A'}
                    </p>
                    {order.deliveryAddress?.comment && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Note: {order.deliveryAddress.comment}
                      </p>
                    )}
                    {order.deliveryLocation?.lat && order.deliveryLocation?.lng && (
                      <div className="mt-3">
                        <a
                          href={`https://www.google.com/maps?q=${order.deliveryLocation.lat},${order.deliveryLocation.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold"
                        >
                          <span>📍</span>
                          <span>View on Map</span>
                        </a>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Payment Info:
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Method: {order.paymentMethod === 'card' ? '💳 Card' : '💵 Cash'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Status: {order.isPaid ? (
                        <span className="text-green-600 dark:text-green-400">
                          Paid {order.paidAt && `on ${new Date(order.paidAt).toLocaleDateString()}`}
                        </span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                      )}
                    </p>
                    {order.paymentMethod === 'card' && order.status === 'pending_payment' && (
                      <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        {/* Payment Card Number Info */}
                        <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white mb-4">
                          <p className="text-xs font-medium mb-1">To'lov qilish uchun karta raqami:</p>
                          <p className="text-xl font-bold tracking-wider">5614 6887 0671 1321</p>
                          <p className="text-xs mt-1 opacity-90">Iltimos, shu karta raqamiga to'lov qiling va chekning screenshot'ini yuklang</p>
                        </div>
                        
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          To'lov cheki screenshot'ini yuklang:
                        </p>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleScreenshotChange(e, order._id)}
                            disabled={uploadingScreenshot === order._id}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          {screenshotFile && screenshotFile.orderId === order._id && (
                            <div className="mt-2 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                                <span>✅</span>
                                <span>Fayl tanlandi</span>
                              </p>
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  📎 Fayl nomi: <span className="font-mono">{screenshotFile.file.name}</span>
                                </p>
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  📦 Fayl hajmi: <span className="font-semibold">{(screenshotFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Upload Progress */}
                        {uploadingScreenshot === order._id && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                <span>Yuklanmoqda...</span>
                              </span>
                              <span className="text-gray-600 dark:text-gray-400 font-semibold">{uploadProgress[order._id] || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <motion.div
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress[order._id] || 0}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          </div>
                        )}
                        {screenshotFile && screenshotFile.orderId === order._id && screenshotPreview && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3"
                          >
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Ko'rib chiqish:</p>
                            <img
                              src={screenshotPreview}
                              alt="Screenshot preview"
                              className="max-w-full h-auto rounded-lg border-2 border-gray-300 dark:border-gray-600 max-h-32 shadow-md"
                            />
                          </motion.div>
                        )}
                        {screenshotFile && screenshotFile.orderId === order._id && (
                          <motion.button
                            whileHover={{ scale: uploadingScreenshot === order._id ? 1 : 1.02 }}
                            whileTap={{ scale: uploadingScreenshot === order._id ? 1 : 0.98 }}
                            onClick={() => handleUploadScreenshot(order._id)}
                            disabled={uploadingScreenshot === order._id}
                            className="mt-3 w-full px-4 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 text-white rounded-xl hover:from-cyan-600 hover:via-blue-600 hover:to-teal-600 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-cyan-300/50 flex items-center justify-center space-x-3"
                          >
                            {uploadingScreenshot === order._id ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span className="font-semibold">Yuklanmoqda... {uploadProgress[order._id] || 0}%</span>
                              </>
                            ) : (
                              <>
                                <span className="text-xl">📤</span>
                                <span className="font-semibold">Screenshot yuklash</span>
                              </>
                            )}
                          </motion.button>
                        )}
                        
                        {!screenshotFile && (
                          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center space-x-2">
                              <span>⚠️</span>
                              <span>Iltimos, avval to'lov cheki screenshot'ini tanlang</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {order.paymentMethod === 'card' && order.paymentScreenshot && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          To'lov cheki screenshot'i:
                        </p>
                        <img
                          src={`http://localhost:5000${order.paymentScreenshot}`}
                          alt="Payment screenshot"
                          className="w-full h-auto rounded-lg border-2 border-gray-300 dark:border-gray-600 max-h-48 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(`http://localhost:5000${order.paymentScreenshot}`, '_blank')}
                        />
                        {order.status === 'payment_uploaded' && (
                          <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 flex items-center space-x-2">
                            <span>⏳</span>
                            <span>Admin tasdiqlashini kutmoqda</span>
                          </p>
                        )}
                        {order.status === 'payment_confirmed' && (
                          <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center space-x-2">
                            <span>✅</span>
                            <span>To'lov admin tomonidan tasdiqlandi</span>
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-gray-600 dark:text-gray-400">
                      Phone: {order.personalInfo?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
