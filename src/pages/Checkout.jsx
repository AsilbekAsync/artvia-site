import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Checkout = () => {
  const { t } = useTranslation();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    region: '',
    address: '',
    comment: '',
    paymentMethod: 'cash',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
  });

  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');
  const [cardErrors, setCardErrors] = useState({});
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showCardForm, setShowCardForm] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear card errors when user types
    if (name.startsWith('card')) {
      setCardErrors({ ...cardErrors, [name]: '' });
    }
  };

  const validateCard = () => {
    const errors = {};
    
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
      errors.cardNumber = 'Card number must be 16 digits';
    }
    
    if (!formData.cardExpiry || !/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
      errors.cardExpiry = 'Expiry must be MM/YY format';
    }
    
    if (!formData.cardCVV || formData.cardCVV.length !== 3) {
      errors.cardCVV = 'CVV must be 3 digits';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const capturedLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log('[Checkout] Location captured:', capturedLocation);
        setLocation(capturedLocation);
        setLocationLoading(false);
        setLocationError('');
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred while getting location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cartItems.length === 0) {
      setError('Cart is empty!');
      return;
    }

    if (!formData.name || !formData.phone || !formData.region || !formData.address) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate location is shared
    if (!location.lat || !location.lng) {
      setError('Please share your delivery location before placing the order');
      return;
    }

    // Validate screenshot if payment method is card
    if (formData.paymentMethod === 'card' && !screenshotFile) {
      setError('Iltimos, to\'lov cheki screenshot\'ini tanlang');
      return;
    }
    
    // Validate screenshot file size if provided
    if (formData.paymentMethod === 'card' && screenshotFile) {
      if (screenshotFile.size > 5 * 1024 * 1024) {
        setError('Fayl hajmi 5MB dan katta bo\'lmasligi kerak');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(screenshotFile.type)) {
        setError('Faqat rasm fayllari qabul qilinadi (JPG, PNG, GIF, WEBP)');
        return;
      }
    }

    try {
      setLoading(true);

      const orderData = {
        items: cartItems.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: getTotalPrice(),
        personalInfo: {
          name: formData.name,
          email: user?.email || '',
          phone: formData.phone,
        },
        paymentMethod: formData.paymentMethod,
        deliveryAddress: {
          region: formData.region,
          address: formData.address,
          comment: formData.comment || '',
        },
        deliveryLocation: {
          lat: location.lat,
          lng: location.lng,
        },
      };

      console.log('[Checkout] Sending order data with location:', {
        deliveryLocation: orderData.deliveryLocation,
        hasLocation: !!(orderData.deliveryLocation.lat && orderData.deliveryLocation.lng),
      });

      // Create order first
      const orderResponse = await axios.post('/api/orders', orderData);
      console.log('[Checkout] Order created, response:', orderResponse.data);
      const order = orderResponse.data;

      // If payment method is card, upload screenshot if provided
      if (formData.paymentMethod === 'card') {
        clearCart();
        
        // If screenshot is already selected, upload it automatically
        if (screenshotFile) {
          try {
            setUploadingScreenshot(true);
            const formDataUpload = new FormData();
            formDataUpload.append('screenshot', screenshotFile);

            // DO NOT set Content-Type manually - let browser set it with boundary
            // Authorization header is automatically added by axios interceptor in main.jsx
            await axios.post(`/api/orders/${order._id}/payment-screenshot`, formDataUpload, {
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
                console.log('[Checkout] Upload progress:', percentCompleted + '%');
              },
            });

            console.log('[Checkout] Screenshot uploaded successfully');
            navigate('/orders', {
              state: {
                message: 'Buyurtma yaratildi va to\'lov cheki screenshot\'i muvaffaqiyatli yuklandi! Admin tasdiqlashini kuting.',
                orderId: order._id,
              },
            });
          } catch (uploadError) {
            console.error('[Checkout] Error uploading screenshot:', uploadError);
            // Still navigate to orders page, user can upload screenshot there
            setOrderCreated(order);
            // Don't navigate yet - show upload form
          } finally {
            setUploadingScreenshot(false);
          }
        } else {
          // No screenshot selected, show upload form
          setOrderCreated(order);
          // Don't navigate yet - user needs to upload screenshot
        }
      } else {
        // Cash payment - order created with pending status
        clearCart();
        navigate('/orders', { 
          state: { 
            message: 'Order placed successfully! Payment will be collected on delivery.',
            orderId: order._id 
          } 
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
      setProcessingPayment(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Checkout
          </h1>
          <p className="text-gray-600 text-lg mb-8 font-semibold">
            Your cart is empty
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all font-bold shadow-xl hover:shadow-2xl hover:shadow-cyan-300/50 animate-pulse-glow"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Handle screenshot file selection
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload payment screenshot
  const handleUploadScreenshot = async () => {
    if (!screenshotFile || !orderCreated) {
      setError('Iltimos, screenshot faylini tanlang');
      return;
    }

    // Validate file size (5MB max)
    if (screenshotFile.size > 5 * 1024 * 1024) {
      setError('Fayl hajmi 5MB dan katta bo\'lmasligi kerak');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(screenshotFile.type)) {
      setError('Faqat rasm fayllari qabul qilinadi (JPG, PNG, GIF, WEBP)');
      return;
    }

    try {
      setUploadingScreenshot(true);
      setError('');

      console.log('[Checkout] Uploading screenshot:', {
        orderId: orderCreated._id,
        fileName: screenshotFile.name,
        fileSize: screenshotFile.size,
        fileType: screenshotFile.type,
      });

      const formData = new FormData();
      formData.append('screenshot', screenshotFile);

      // DO NOT set Content-Type manually - let browser set it with boundary
      // Authorization header is automatically added by axios interceptor in main.jsx
      const response = await axios.post(`/api/orders/${orderCreated._id}/payment-screenshot`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          console.log('[Checkout] Upload progress:', percentCompleted + '%');
        },
      });

      console.log('[Checkout] Screenshot uploaded successfully:', response.data);

      navigate('/orders', {
        state: {
          message: 'To\'lov cheki screenshot\'i muvaffaqiyatli yuklandi! Admin tasdiqlashini kuting.',
          orderId: orderCreated._id,
        },
      });
    } catch (error) {
      console.error('[Checkout] Error uploading screenshot:', error);
      const errorMessage = error.response?.data?.message || 'Screenshot yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.';
      setError(errorMessage);
    } finally {
      setUploadingScreenshot(false);
      setUploadProgress(0);
    }
  };

  // Show screenshot upload form if order created with card payment
  if (orderCreated && formData.paymentMethod === 'card') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-cyan-100/50"
        >
          <div className="text-center mb-6">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
              To'lov chekini yuklang
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Buyurtma #{orderCreated._id.slice(-8).toUpperCase()} yaratildi. Iltimos, to'lov chekining screenshot'ini yuklang.
            </p>
            
            {/* Payment Card Number Info */}
            <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white mb-4">
              <p className="text-sm font-medium mb-2">To'lov qilish uchun karta raqami:</p>
              <p className="text-2xl font-bold tracking-wider">5614 6887 0671 1321</p>
              <p className="text-xs mt-2 opacity-90">Iltimos, shu karta raqamiga to'lov qiling va chekning screenshot'ini yuklang</p>
            </div>
            
          </div>

          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To'lov cheki screenshot'i *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  disabled={uploadingScreenshot}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {screenshotFile && (
                  <div className="mt-2 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                      <span>✅</span>
                      <span>Fayl tanlandi</span>
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        📎 Fayl nomi: <span className="font-mono">{screenshotFile.name}</span>
                      </p>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        📦 Fayl hajmi: <span className="font-semibold">{(screenshotFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </p>
                      <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                          📁 Yuklanadigan joy:
                        </p>
                        <p className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded border border-blue-300 dark:border-blue-700">
                          backend/uploads/{screenshotFile.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                To'lov chekining screenshot'ini yuklang (JPG, PNG, va boshqalar) - Maksimal 5MB
              </p>
              
              {/* Upload Progress */}
              {uploadingScreenshot && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Yuklanmoqda...</span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <motion.div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {screenshotPreview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ko'rib chiqish:
                </p>
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="max-w-full h-auto rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-lg"
                />
              </motion.div>
            )}

            <div className="space-y-3">
              {!screenshotFile && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>Iltimos, avval to'lov cheki screenshot'ini tanlang</span>
                  </p>
                </div>
              )}
              
              {screenshotFile && (
                <motion.button
                  whileHover={{ scale: uploadingScreenshot ? 1 : 1.02 }}
                  whileTap={{ scale: uploadingScreenshot ? 1 : 0.98 }}
                  onClick={handleUploadScreenshot}
                  disabled={!screenshotFile || uploadingScreenshot}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 text-white rounded-xl hover:from-cyan-600 hover:via-blue-600 hover:to-teal-600 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:shadow-cyan-300/50 flex items-center justify-center space-x-3"
                >
                  {uploadingScreenshot ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span className="text-lg">Yuklanmoqda... {uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">📤</span>
                      <span className="text-lg">Screenshot yuklash</span>
                    </>
                  )}
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/orders')}
                disabled={uploadingScreenshot}
                className="w-full px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keyinroq yuklash
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-cyan-100/50"
        >
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}

          {/* User Info */}
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              User Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+998901234567"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Delivery Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Region / City *
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  placeholder="Tashkent, Samarkand, etc."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Street, building, apartment number"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Delivery instructions, landmarks, etc."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Location Sharing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Location *
                </label>
                <div className="space-y-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl hover:shadow-cyan-300/50"
                  >
                    {locationLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Getting location...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">📍</span>
                        <span>Share my location</span>
                      </>
                    )}
                  </motion.button>

                  {locationError && (
                    <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
                      {locationError}
                    </div>
                  )}

                  {location.lat && location.lng && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <div className="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md text-sm flex items-center space-x-2">
                        <span>✅</span>
                        <span>Location shared successfully</span>
                      </div>
                      
                      {/* Map Preview - Using OpenStreetMap (free, no API key) */}
                      <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                        <iframe
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01},${location.lat - 0.01},${location.lng + 0.01},${location.lat + 0.01}&layer=mapnik&marker=${location.lat},${location.lng}`}
                          title="Delivery Location"
                        ></iframe>
                      </div>
                      
                      {/* Coordinates */}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </p>
                      
                      {/* Link to open in Google Maps */}
                      <a
                        href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1"
                      >
                        <span>🗺️</span>
                        <span>Open in Google Maps</span>
                      </a>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Payment Method
            </h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-2xl">💵</span>
                <div>
                  <span className="block text-gray-900 dark:text-white font-semibold">Cash (Naqt)</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pay on delivery</span>
                </div>
              </label>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFormData({ ...formData, paymentMethod: 'card' });
                  setShowCardForm(true);
                }}
                className="w-full flex items-center space-x-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-md hover:border-blue-500 transition-colors text-left"
              >
                <span className="text-2xl">💳</span>
                <div className="flex-1">
                  <span className="block text-gray-900 dark:text-white font-semibold">Karta bilan to'layman</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">To'lovdan keyin chek screenshot yuborish kerak</span>
                </div>
              </motion.button>
            </div>

            {/* Card Form - Only shown when "Karta bilan to'layman" button is clicked */}
            {showCardForm && formData.paymentMethod === 'card' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Karta ma'lumotlari
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCardForm(false);
                      setFormData({ ...formData, paymentMethod: 'cash', cardNumber: '', cardExpiry: '', cardCVV: '' });
                      setScreenshotFile(null);
                      setScreenshotPreview(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Payment Card Number Info */}
                  <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white">
                    <p className="text-sm font-medium mb-2">To'lov qilish uchun karta raqami:</p>
                    <p className="text-2xl font-bold tracking-wider">5614 6887 0671 1321</p>
                    <p className="text-xs mt-2 opacity-90">Iltimos, shu karta raqamiga to'lov qiling va chekning screenshot'ini yuklang</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      ⚠️ Eslatma: Buyurtma yaratilgandan keyin to'lov chekining screenshot'ini yuklashingiz kerak bo'ladi.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Screenshot Upload Section - Only shown when card payment is selected */}
            {formData.paymentMethod === 'card' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-cyan-300 dark:border-cyan-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                  <span>📸</span>
                  <span>To'lov cheki screenshot'i</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Screenshot faylini tanlang *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      To'lov chekining screenshot'ini tanlang (JPG, PNG, va boshqalar) - Maksimal 5MB
                    </p>
                  </div>
                  
                  {screenshotFile && (
                    <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                        <span>✅</span>
                        <span>Fayl tanlandi</span>
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          📎 Fayl nomi: <span className="font-mono">{screenshotFile.name}</span>
                        </p>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          📦 Fayl hajmi: <span className="font-semibold">{(screenshotFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {screenshotPreview && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3"
                    >
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ko'rib chiqish:
                      </p>
                      <img
                        src={screenshotPreview}
                        alt="Screenshot preview"
                        className="max-w-full h-auto rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md max-h-48"
                      />
                    </motion.div>
                  )}
                  
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center space-x-2">
                      <span>ℹ️</span>
                      <span>Buyurtma yaratilgandan keyin screenshot avtomatik yuklanadi</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || processingPayment}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 text-white rounded-xl hover:from-cyan-600 hover:via-blue-600 hover:to-teal-600 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:shadow-cyan-300/50 animate-pulse-glow"
          >
            {loading 
              ? 'Placing Order...' 
              : 'Place Order'}
          </motion.button>
        </motion.form>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sticky top-24 border border-cyan-100/50"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              {t('yourOrder')}
            </h2>

            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <img
                    src={`http://localhost:5000${item.image}`}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-md"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64x64?text=Product';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Qty: {item.quantity} × {item.price.toLocaleString()} so'm
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(item.price * item.quantity).toLocaleString()} so'm
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-300 pt-4">
              <div className="flex justify-between text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                <span>{t('total')}:</span>
                <span className="text-2xl">{getTotalPrice().toLocaleString()} so'm</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
