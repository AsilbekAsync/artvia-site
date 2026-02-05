import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bot } from "lucide-react";

const AIAssistant = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      // Initialize chat with welcome message when product is selected
      setMessages([
        {
          id: 1,
          text: `Salom! Men sizga "${getProductTitle(selectedProduct)}" mahsuloti haqida yordam bera olaman. Savollaringizni bering!`,
          sender: "ai",
        },
      ]);
    }
  }, [selectedProduct]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter((product) => {
        const title = getProductTitle(product).toLowerCase();
        const query = searchQuery.toLowerCase();
        return title.includes(query);
      });
      setFilteredProducts(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await axios.get("/api/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const getProductTitle = (product) => {
    if (!product) return "";
    const lang = i18n.language;
    if (lang === "uz") return product.titleUz || product.title;
    if (lang === "ru") return product.titleRu || product.title;
    return product.title;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSearchQuery("");
    setFilteredProducts([]);
    setInput("");
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedProduct) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("/api/ai/product-helper", {
        productId: selectedProduct._id,
        question: currentInput.trim(),
      });

      const aiResponse = {
        id: messages.length + 2,
        text: response.data.answer,
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      const errorMessage = {
        id: messages.length + 2,
        text:
          error.response?.data?.message ||
          "Javob olishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedProduct(null);
    setMessages([]);
    setInput("");
    setSearchQuery("");
  };

  return (
    <div className="p-6 border shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl dark:shadow-gray-900/50 border-cyan-100/50 dark:border-gray-700/50">
      <h2 className="flex items-center gap-2 mb-4 text-3xl font-bold text-gray-900 dark:text-white">
        <span className="text-cyan-600 dark:text-cyan-400">
          <Bot />
        </span>
        AI Yordamchi
      </h2>

      {!selectedProduct ? (
        // Product Selection View
        <div className="space-y-4">
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Qiziqtirgan mahsulotingizni tanlang yoki qidiring. Keyin AI
            yordamchi orqali batafsil ma'lumot oling.
          </p>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mahsulot nomini yozing..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            {loadingProducts && (
              <div className="absolute right-3 top-3">
                <div className="w-5 h-5 border-b-2 rounded-full animate-spin border-cyan-500"></div>
              </div>
            )}
          </div>

          {/* Product List */}
          <div className="space-y-2 overflow-y-auto max-h-96">
            {searchQuery.trim() ? (
              filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleProductSelect(product)}
                    className="p-4 transition-all border rounded-lg cursor-pointer bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 border-cyan-200 dark:border-gray-600 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={`http://localhost:5000${product.image}`}
                        alt={getProductTitle(product)}
                        className="object-cover w-16 h-16 rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {getProductTitle(product)}
                        </h3>
                        <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                          {product.price.toLocaleString()} so'm
                        </p>
                      </div>
                      <span className="text-cyan-600 dark:text-cyan-400">
                        →
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  Mahsulot topilmadi
                </div>
              )
            ) : (
              products.slice(0, 10).map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleProductSelect(product)}
                  className="p-4 transition-all border rounded-lg cursor-pointer bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 border-cyan-200 dark:border-gray-600 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={`http://localhost:5000${product.image}`}
                      alt={getProductTitle(product)}
                      className="object-cover w-16 h-16 rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {getProductTitle(product)}
                      </h3>
                      <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                        {product.price.toLocaleString()} so'm
                      </p>
                    </div>
                    <span className="text-cyan-600 dark:text-cyan-400">→</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      ) : (
        // Chat View
        <div className="space-y-4">
          {/* Selected Product Info */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 border-cyan-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <img
                src={`http://localhost:5000${selectedProduct.image}`}
                alt={getProductTitle(selectedProduct)}
                className="object-cover w-12 h-12 rounded-lg"
              />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {getProductTitle(selectedProduct)}
                </h3>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">
                  {selectedProduct.price.toLocaleString()} so'm
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleReset}
              className="px-3 py-1 text-xs text-gray-700 transition-colors bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Boshqa mahsulot
            </motion.button>
          </div>

          {/* Chat Messages */}
          <div className="flex flex-col border border-gray-300 rounded-lg dark:border-gray-700 h-96 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-b-2 rounded-full animate-spin border-cyan-500"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Javob kutilmoqda...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t border-gray-300 dark:border-gray-700"
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Masalan: Bu mahsulot qanday materialdan yasalgan?"
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-6 py-2 font-semibold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Yuborish
                </motion.button>
              </div>
            </form>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setInput("Bu mahsulot qanday materialdan yasalgan?");
              }}
              className="px-3 py-1 text-xs text-gray-700 transition-colors bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Material haqida
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setInput("Bu mahsulotning narxi qancha?");
              }}
              className="px-3 py-1 text-xs text-gray-700 transition-colors bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Narx haqida
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigate(`/product/${selectedProduct._id}`);
              }}
              className="px-3 py-1 text-xs transition-colors rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-900/50"
            >
              Batafsil ko'rish →
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
