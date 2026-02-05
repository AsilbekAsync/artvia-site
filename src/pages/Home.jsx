import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import WorksGallery from "../components/WorksGallery";
import AIAssistant from "../components/AIAssistant";
import {
  Palette,
  ShoppingBag,
  Star,
  Sparkles,
  TrendingUp,
  Shield,
  Users,
  ArrowRight,
} from "lucide-react";

const Home = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Original",
      description: "Barcha mahsulotlar qo'lda ishlangan va original",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Yuqori Sifat",
      description: "Premium materiallar va mahoratli ishlov",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Mahalliy Hunarmandlar",
      description: "To'g'ridan-to'g'ri ustalardan xarid qiling",
    },
  ];

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section - Modern Minimalist */}
      <div className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
          {/* Geometric Pattern */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25px 25px, currentColor 2px, transparent 2px)`,
                backgroundSize: "50px 50px",
              }}
            ></div>
          </div>
        </div>

        {/* Floating Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute rounded-full top-1/4 left-10 w-72 h-72 bg-gradient-to-r from-orange-300/30 to-amber-400/20 blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute rounded-full bottom-1/4 right-10 w-96 h-96 bg-gradient-to-r from-cyan-300/20 to-blue-400/10 blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-screen py-20 md:py-32">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 border rounded-full bg-orange-500/10 dark:bg-orange-500/20 border-orange-500/20"
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                Premium Hunarmandchilik Platformasi
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl dark:text-white">
                <span className="block">O'zbekistonning</span>
                <span className="block mt-2">
                  <span className="text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text">
                    Hunarmandchilik
                  </span>
                  <span className="text-gray-900 dark:text-white"> Jahoni</span>
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="max-w-2xl mx-auto mb-10 text-lg text-gray-600 md:text-xl dark:text-gray-300"
              >
                Qadimiy an'analar va zamonaviy dizayn uyg'unligi. O'zbek
                hunarmandlarining noyob asarlari bilan tanishing.
              </motion.p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col items-center gap-4 mb-16 sm:flex-row"
            >
              <Link to="/category/all" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center w-full gap-3 px-8 py-4 text-base font-semibold text-white transition-all duration-300 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl hover:shadow-lg hover:shadow-orange-500/25"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Barcha Mahsulotlar</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>

              <Link to="/register" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center w-full gap-3 px-8 py-4 text-base font-semibold text-gray-900 transition-all duration-300 border-2 border-gray-300 rounded-xl dark:border-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Star className="w-5 h-5" />
                  <span>Bepul Ro'yxatdan O'tish</span>
                </motion.button>
              </Link>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid max-w-4xl grid-cols-1 gap-6 mx-auto mt-8 sm:grid-cols-3"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="p-6 transition-all duration-300 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800/50 dark:border-gray-700 backdrop-blur-sm hover:shadow-lg"
                >
                  <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/10">
                    <div className="text-orange-500">{feature.icon}</div>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="grid grid-cols-2 gap-8 mt-16 md:grid-cols-4"
            >
              {[
                { value: "500+", label: "Faol Hunarmand" },
                { value: "10k+", label: "Mahsulot" },
                { value: "25k+", label: "Mamnun Mijoz" },
                { value: "100%", label: "Original Mahsulot" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute transform -translate-x-1/2 bottom-8 left-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center"
          >
            <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              Ko'proq ko'rish
            </div>
            <div className="w-6 h-10 border-2 border-gray-300 rounded-full dark:border-gray-600">
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-3 mx-auto mt-2 bg-gray-400 rounded-full dark:bg-gray-500"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Gallery Section */}
      <div className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
            Eng Yaxshi Mahsulotlar
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Tanlangan hunarmandlik asarlari va ularning ijodkorlari
          </p>
        </div>
        <WorksGallery />
      </div>

      {/* AI Assistant Section */}
      <div className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
            AI Yordamchi Maslahatchi
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Sun'iy intellekt yordamida sizga mos mahsulotlarni toping
          </p>
        </div>
        <AIAssistant />
      </div>

      {/* CTA Section */}
      <div className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 text-center bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 dark:from-orange-500/5 dark:via-amber-500/5 dark:to-orange-500/5 rounded-3xl"
        >
          <h3 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
            Hunarmand bo'ling yoki mahsulot sotib oling
          </h3>
          <p className="max-w-2xl mx-auto mb-8 text-gray-600 dark:text-gray-400">
            Platformamizda o'z ijodingizni namoyish eting yoki noyob
            hunarmandchilik asarlarini toping
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl hover:shadow-lg hover:shadow-orange-500/25"
              >
                Boshlash
              </motion.button>
            </Link>
            <Link to="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 font-semibold text-gray-900 transition-all duration-300 bg-white border-2 border-gray-300 rounded-xl dark:text-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Biz haqimizda
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
