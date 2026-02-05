import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Play, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const WorksGallery = () => {
  const { t, i18n } = useTranslation();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const res = await axios.get('/api/works');
      setWorks(res.data);
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(works.map(work => work.category))];
  const filteredWorks = filter === 'all' 
    ? works 
    : works.filter(work => work.category === filter);

  const getDescription = (work) => {
    const lang = i18n.language;
    if (lang === 'uz') return work.descriptionUz;
    if (lang === 'ru') return work.descriptionRu;
    if (lang === 'en') return work.descriptionEn;
    // Fallback to available description
    return work.descriptionUz || work.descriptionRu || work.descriptionEn;
  };

  const isVideoUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A1A2F]"></div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-4"
        >
          <div className="h-1 w-20 bg-gradient-to-r from-[#F2C94C] to-[#0A1A2F] mx-auto mb-4 rounded-full"></div>
          <motion.h2
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#0A1A2F] to-[#1a2f4f] dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-3"
          >
            Bizning ishlarimiz
          </motion.h2>
          <div className="h-1 w-20 bg-gradient-to-r from-[#0A1A2F] to-[#F2C94C] mx-auto mt-4 rounded-full"></div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg md:text-xl text-gray-600 dark:text-white font-medium"
        >
          San'at va hunarmandchilik bo'yicha amalga oshirilgan ishlar
        </motion.p>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(category)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                filter === category
                  ? 'bg-[#0A1A2F] dark:bg-[#F2C94C] text-[#F2C94C] dark:text-[#0A1A2F] shadow-lg'
                  : 'bg-white dark:bg-gray-700 text-[#0A1A2F] dark:text-white border-2 border-[#0A1A2F] dark:border-gray-500 hover:bg-[#0A1A2F] dark:hover:bg-gray-600 hover:text-white dark:hover:text-white'
              }`}
            >
              {category === 'all' ? (t('all') || 'All') : category}
            </motion.button>
          ))}
        </div>
      )}

      {/* Works Grid */}
      {filteredWorks.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-white text-lg">
            {t('noWorks') || 'No works found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWorks.map((work, index) => (
            <motion.div
              key={work._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -8 }}
              className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700"
              onClick={() => setSelectedWork(work)}
            >
              {/* Thumbnail */}
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                {work.image ? (
                  <img
                    src={`http://localhost:5000${work.image}`}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image';
                    }}
                  />
                ) : work.video ? (
                  <video
                    src={`http://localhost:5000${work.video}`}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : work.videoUrl ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A1A2F] to-[#1a2f4f]">
                    <Play className="w-20 h-20 text-[#F2C94C]" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A2F]/90 via-[#0A1A2F]/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {(work.video || work.videoUrl) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1.15 }}
                      className="w-20 h-20 bg-[#F2C94C] rounded-full flex items-center justify-center shadow-2xl"
                    >
                      <Play className="w-10 h-10 text-[#0A1A2F] ml-1" fill="currentColor" />
                    </motion.div>
                  )}
                </div>

                {/* Category Badge */}
                {work.category && (
                  <div className="absolute top-4 left-4 px-4 py-1.5 bg-[#F2C94C] text-[#0A1A2F] text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
                    {work.category}
                  </div>
                )}

                {/* Featured Badge */}
                {work.featured && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-gray-800/90 text-[#0A1A2F] dark:text-[#F2C94C] text-xs font-bold rounded-full backdrop-blur-sm flex items-center space-x-1">
                    <span>⭐</span>
                    <span>Featured</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-bold text-[#0A1A2F] dark:text-white mb-2 line-clamp-2 group-hover:text-[#F2C94C] transition-colors">
                  {work.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-white line-clamp-2 leading-relaxed">
                  {getDescription(work)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedWork && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWork(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-[#0A1A2F] to-[#1a2f4f] text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">
                      {selectedWork.title}
                    </h3>
                    {selectedWork.category && (
                      <span className="inline-block px-3 py-1 bg-[#F2C94C] text-[#0A1A2F] text-xs font-bold rounded-full">
                        {selectedWork.category}
                      </span>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedWork(null)}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Media */}
                <div className="relative bg-gradient-to-br from-gray-900 to-[#0A1A2F]">
                  {selectedWork.video ? (
                    <video
                      src={`http://localhost:5000${selectedWork.video}`}
                      controls
                      className="w-full h-auto max-h-[70vh]"
                    />
                  ) : selectedWork.videoUrl && isVideoUrl(selectedWork.videoUrl) ? (
                    <div className="aspect-video bg-black">
                      <iframe
                        src={getYouTubeEmbedUrl(selectedWork.videoUrl)}
                        title={selectedWork.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : selectedWork.image ? (
                    <div className="flex items-center justify-center p-8">
                      <img
                        src={`http://localhost:5000${selectedWork.image}`}
                        alt={selectedWork.title}
                        className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-2xl"
                      />
                    </div>
                  ) : null}
                </div>

                {/* Details */}
                <div className="p-8 bg-white dark:bg-gray-800">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-white leading-relaxed whitespace-pre-line text-base md:text-lg">
                      {getDescription(selectedWork)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorksGallery;
