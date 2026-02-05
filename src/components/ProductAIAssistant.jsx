import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ProductAIAssistant = ({ productId }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const answerRef = useRef(null);

  useEffect(() => {
    if (answer) {
      answerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [answer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError('Iltimos, savol kiriting');
      return;
    }

    if (!productId) {
      setError('Mahsulot topilmadi');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await axios.post('/api/ai/product-helper', {
        productId,
        question: question.trim(),
      });

      setAnswer(response.data.answer);
      setQuestion('');
    } catch (err) {
      console.error('AI Assistant Error:', err);
      setError(
        err.response?.data?.message || 
        'Javob olishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-gray-900/50 p-6 border border-cyan-100/50 dark:border-gray-700/50">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="text-cyan-600 dark:text-cyan-400">🤖</span>
        AI Yordamchi
      </h2>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Bu mahsulot haqida savollaringizga javob olish uchun AI yordamchidan foydalaning.
      </p>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              setError('');
            }}
            placeholder="Masalan: Bu mahsulot qanday materialdan yasalgan?"
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <motion.button
            type="submit"
            disabled={loading || !question.trim()}
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kutilmoqda...
              </span>
            ) : (
              'Yuborish'
            )}
          </motion.button>
        </div>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      {answer && (
        <motion.div
          ref={answerRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-cyan-200 dark:border-gray-600"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500 dark:bg-cyan-600 flex items-center justify-center text-white font-bold">
              AI
            </div>
            <div className="flex-1">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {answer}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {!answer && !loading && !error && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Savol bering va AI yordamchi javob beradi
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductAIAssistant;
