import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const OrderManagement = ({ orders, onUpdate }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [deliveringOrderId, setDeliveringOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState(null);
  const [rejectingPaymentId, setRejectingPaymentId] = useState(null);
  const [viewingScreenshot, setViewingScreenshot] = useState(null);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      onUpdate();
      showToast('Order status updated successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update order status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    try {
      setDeliveringOrderId(orderId);
      await axios.put(`/api/orders/${orderId}/deliver`);
      onUpdate();
      showToast('Order marked as delivered successfully!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to mark order as delivered', 'error');
    } finally {
      setDeliveringOrderId(null);
    }
  };

  const handleConfirmPayment = async (orderId) => {
    try {
      setConfirmingPaymentId(orderId);
      await axios.post(`/api/orders/${orderId}/confirm-payment`);
      onUpdate();
      showToast('Payment confirmed successfully!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to confirm payment', 'error');
    } finally {
      setConfirmingPaymentId(null);
    }
  };

  const handleRejectPayment = async (orderId) => {
    if (!window.confirm('Are you sure you want to reject this payment? The user will need to upload a new screenshot.')) {
      return;
    }
    try {
      setRejectingPaymentId(orderId);
      await axios.post(`/api/orders/${orderId}/reject-payment`);
      onUpdate();
      showToast('Payment rejected. User needs to upload a new screenshot.', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reject payment', 'error');
    } finally {
      setRejectingPaymentId(null);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('orders')}
        </h2>
        
        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="payment_uploaded">Payment Uploaded</option>
            <option value="payment_confirmed">Payment Confirmed</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No orders found
          </p>
        ) : (
          filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all ${
                order.status === 'delivered'
                  ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Customer:</span> {order.personalInfo?.name || order.user?.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Email:</span> {order.personalInfo?.email || order.user?.email}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Phone:</span> {order.personalInfo?.phone || 'N/A'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Delivery:</span> {order.deliveryAddress?.region || 'N/A'}, {order.deliveryAddress?.address || 'N/A'}
                  </p>
                  {order.deliveryAddress?.comment && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      <span className="font-semibold">Note:</span> {order.deliveryAddress.comment}
                    </p>
                  )}
                  {/* Location Section - Always visible */}
                  <div className="mt-3">
                    {(() => {
                      const loc = order.deliveryLocation;
                      
                      // Always log for debugging
                      console.log('[Admin UI] Order location data:', {
                        orderId: order._id,
                        deliveryLocation: loc,
                        type: typeof loc,
                        isObject: typeof loc === 'object' && loc !== null,
                        hasLat: !!loc?.lat,
                        hasLng: !!loc?.lng,
                        latValue: loc?.lat,
                        lngValue: loc?.lng,
                        fullOrder: JSON.stringify(order).substring(0, 200),
                      });
                      
                      // Check for location - handle both object and direct property access
                      let lat, lng;
                      
                      if (loc) {
                        if (typeof loc === 'object' && loc !== null) {
                          // Handle Mongoose document or plain object
                          lat = loc.lat !== undefined && loc.lat !== null ? loc.lat : (loc.latitude !== undefined ? loc.latitude : null);
                          lng = loc.lng !== undefined && loc.lng !== null ? loc.lng : (loc.longitude !== undefined ? loc.longitude : null);
                        } else {
                          // If it's a string or other format, try to parse
                          lat = null;
                          lng = null;
                        }
                      }
                      
                      console.log('[Admin UI] Extracted coordinates:', { lat, lng, originalLoc: loc });
                      
                      // Convert to numbers and validate
                      const latNum = lat != null && lat !== '' ? parseFloat(lat) : null;
                      const lngNum = lng != null && lng !== '' ? parseFloat(lng) : null;
                      const hasLocation = latNum != null && lngNum != null && 
                                         !isNaN(latNum) && !isNaN(lngNum) &&
                                         latNum >= -90 && latNum <= 90 &&
                                         lngNum >= -180 && lngNum <= 180;
                      
                      console.log('[Admin UI] Location validation:', { latNum, lngNum, hasLocation });
                      
                      if (hasLocation) {
                        return (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border-2 border-blue-300 dark:border-blue-700">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                              <span className="text-xl">📍</span>
                              <span>Delivery Location</span>
                            </p>
                            <a
                              href={`https://www.google.com/maps?q=${latNum},${lngNum}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              <span className="text-lg">🗺️</span>
                              <span>View Location on Google Maps</span>
                              <span className="text-xs opacity-90">(Opens in new tab)</span>
                            </a>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-mono">
                              Lat: {latNum.toFixed(6)}, Lng: {lngNum.toFixed(6)}
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-300 dark:border-yellow-700">
                          <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center space-x-1">
                            <span>⚠️</span>
                            <span>Location not available for this order</span>
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Payment:</span> {order.paymentMethod === 'card' ? '💳 Card' : '💵 Cash'} 
                    {order.isPaid && (
                      <span className="ml-2 text-green-600 dark:text-green-400">(Paid)</span>
                    )}
                  </p>
                  {order.paymentMethod === 'card' && order.paymentScreenshot && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Payment Screenshot:
                      </p>
                      <div className="flex items-center space-x-3">
                        <img
                          src={`http://localhost:5000${order.paymentScreenshot}`}
                          alt="Payment screenshot"
                          className="w-32 h-32 object-cover rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setViewingScreenshot(order.paymentScreenshot)}
                        />
                        <div className="flex flex-col space-y-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setViewingScreenshot(order.paymentScreenshot)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold"
                          >
                            View Full Size
                          </motion.button>
                          {order.status === 'payment_uploaded' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleConfirmPayment(order._id)}
                                disabled={confirmingPaymentId === order._id}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {confirmingPaymentId === order._id ? 'Confirming...' : '✅ Confirm Payment'}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleRejectPayment(order._id)}
                                disabled={rejectingPaymentId === order._id}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {rejectingPaymentId === order._id ? 'Rejecting...' : '❌ Reject Payment'}
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {order.paymentMethod === 'card' && order.status === 'pending_payment' && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⏳ Waiting for user to upload payment screenshot
                      </p>
                    </div>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    <span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                    {order.totalPrice.toLocaleString()} so'm
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Order Items ({order.items.length})
                </h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <img
                        src={`http://localhost:5000${item.image || item.product?.image || ''}`}
                        alt={item.name || item.product?.title || 'Product'}
                        className="w-20 h-20 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=Product';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.name || item.product?.title || 'Product'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Quantity: {item.quantity} × {item.price.toLocaleString()} so'm
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {(item.price * item.quantity).toLocaleString()} so'm
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Update Status:
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    disabled={loading || order.status === 'delivered'}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="payment_uploaded">Payment Uploaded</option>
                    <option value="payment_confirmed">Payment Confirmed</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Mark as Delivered Button */}
                {order.status !== 'delivered' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMarkAsDelivered(order._id)}
                    disabled={deliveringOrderId === order._id || loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {deliveringOrderId === order._id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>✅</span>
                        <span>Mark as Delivered (Yetkazildi)</span>
                      </>
                    )}
                  </motion.button>
                )}

                {order.status === 'delivered' && order.deliveredAt && (
                  <div className="text-sm text-green-600 dark:text-green-400 font-semibold">
                    ✅ Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Screenshot Modal */}
      <AnimatePresence>
        {viewingScreenshot && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingScreenshot(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
              >
                <button
                  onClick={() => setViewingScreenshot(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  ✕
                </button>
                <img
                  src={`http://localhost:5000${viewingScreenshot}`}
                  alt="Payment screenshot"
                  className="w-full h-auto max-h-[90vh] object-contain"
                />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManagement;
