import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Trash2, Edit, Plus, X, Image as ImageIcon, Video, Link as LinkIcon, Upload, Star } from 'lucide-react';

const WorksManagement = ({ onUpdate }) => {
  const { t } = useTranslation();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    descriptionUz: '',
    descriptionRu: '',
    descriptionEn: '',
    category: '',
    featured: false,
    videoUrl: '',
  });
  const [mediaType, setMediaType] = useState('image'); // 'image', 'video', 'url'
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.title || !formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.category || !formData.category.trim()) {
      setError('Category is required');
      return;
    }
    if (!formData.descriptionUz || !formData.descriptionUz.trim()) {
      setError('O\'zbekcha description is required');
      return;
    }
    if (!formData.descriptionRu || !formData.descriptionRu.trim()) {
      setError('Русский description is required');
      return;
    }
    if (!formData.descriptionEn || !formData.descriptionEn.trim()) {
      setError('English description is required');
      return;
    }

    // Media validation
    if (!editingWork) {
      if (mediaType === 'image' && !imageFile && !imagePreview) {
        setError('Please upload an image file');
        return;
      }
      if (mediaType === 'video' && !videoFile && !videoPreview) {
        setError('Please upload a video file');
        return;
      }
      if (mediaType === 'url' && (!formData.videoUrl || !formData.videoUrl.trim())) {
        setError('Please enter a valid video URL (YouTube or Vimeo)');
        return;
      }
    } else {
      // When editing, at least one media should exist or be provided
      const hasExistingMedia = editingWork.image || editingWork.video || editingWork.videoUrl;
      const hasNewMedia = (mediaType === 'image' && imageFile) || 
                         (mediaType === 'video' && videoFile) || 
                         (mediaType === 'url' && formData.videoUrl && formData.videoUrl.trim());
      
      if (!hasExistingMedia && !hasNewMedia) {
        setError('At least one media (image, video, or video URL) is required');
        return;
      }
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('descriptionUz', formData.descriptionUz.trim());
      data.append('descriptionRu', formData.descriptionRu.trim());
      data.append('descriptionEn', formData.descriptionEn.trim());
      data.append('category', formData.category.trim());
      data.append('featured', formData.featured);
      
      if (mediaType === 'image' && imageFile) {
        data.append('image', imageFile);
        console.log('Adding image file:', imageFile.name);
      } else if (mediaType === 'video' && videoFile) {
        data.append('video', videoFile);
        console.log('Adding video file:', videoFile.name);
      } else if (mediaType === 'url' && formData.videoUrl) {
        data.append('videoUrl', formData.videoUrl.trim());
        console.log('Adding video URL:', formData.videoUrl);
      }

      // Log form data for debugging
      console.log('Form data:', {
        title: formData.title,
        category: formData.category,
        featured: formData.featured,
        mediaType,
        hasImage: !!imageFile,
        hasVideo: !!videoFile,
        hasUrl: !!formData.videoUrl
      });

      const url = editingWork ? `/api/works/${editingWork._id}` : '/api/works';
      const method = editingWork ? 'put' : 'post';
      
      console.log(`Sending ${method.toUpperCase()} request to:`, url);
      
      const response = await axios[method](url, data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Success response:', response.data);

      // Show success message
      alert(editingWork ? 'Work updated successfully! ✅' : 'Work created successfully! ✅');
      
      setShowModal(false);
      resetForm();
      fetchWorks();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving work:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to save work';
      
      if (error.response) {
        // Backend returned an error response
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (status === 400) {
          errorMessage = data?.message || data?.error || 'Invalid data. Please check all fields.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = data?.message || data?.error || `Error ${status}: Failed to save work`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Error setting up the request
        errorMessage = error.message || 'Failed to save work. Please try again.';
      }
      
      setError(errorMessage);
      
      // Scroll to error
      setTimeout(() => {
        const errorElement = document.querySelector('.error-message');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (work) => {
    setEditingWork(work);
    setFormData({
      title: work.title || '',
      descriptionUz: work.descriptionUz || '',
      descriptionRu: work.descriptionRu || '',
      descriptionEn: work.descriptionEn || '',
      category: work.category || '',
      featured: work.featured || false,
      videoUrl: work.videoUrl || '',
    });
    setImageFile(null);
    setVideoFile(null);
    
    // Determine media type
    if (work.image) {
      setMediaType('image');
      setImagePreview(`http://localhost:5000${work.image}`);
    } else if (work.video) {
      setMediaType('video');
      setVideoPreview(`http://localhost:5000${work.video}`);
    } else if (work.videoUrl) {
      setMediaType('url');
    } else {
      setMediaType('image');
    }
    
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this work?')) {
      return;
    }

    try {
      await axios.delete(`/api/works/${id}`);
      fetchWorks();
      if (onUpdate) onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete work');
    }
  };

  const openModal = () => {
    setEditingWork(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      descriptionUz: '',
      descriptionRu: '',
      descriptionEn: '',
      category: '',
      featured: false,
      videoUrl: '',
    });
    setMediaType('image');
    setImageFile(null);
    setVideoFile(null);
    setImagePreview('');
    setVideoPreview('');
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A1A2F]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
            Portfolio / Works
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your portfolio works and showcase your art
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={openModal}
          className="px-6 py-3 bg-gradient-to-r from-[#0A1A2F] to-[#1a2f4f] text-[#F2C94C] rounded-lg hover:shadow-lg transition-all font-semibold flex items-center space-x-2 shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Work</span>
        </motion.button>
      </div>

      {/* Works Grid */}
      {works.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700"
        >
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No works yet</p>
          <p className="text-gray-400 text-sm mt-2">Add your first work to get started!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work, index) => (
            <motion.div
              key={work._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              {/* Media Preview */}
              <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                {work.image ? (
                  <img
                    src={`http://localhost:5000${work.image}`}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image';
                    }}
                  />
                ) : work.video ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <Video className="w-16 h-16 text-[#F2C94C]" />
                  </div>
                ) : work.videoUrl ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <LinkIcon className="w-16 h-16 text-[#F2C94C]" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-[#0A1A2F]/0 group-hover:bg-[#0A1A2F]/80 transition-all duration-300 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(work)}
                    className="px-4 py-2 bg-[#F2C94C] text-[#0A1A2F] rounded-lg font-semibold flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(work._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Featured Badge */}
                {work.featured && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-[#F2C94C] text-[#0A1A2F] text-xs font-bold rounded-full flex items-center space-x-1 shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Featured</span>
                  </div>
                )}

                {/* Category Badge */}
                {work.category && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-gray-800/90 text-[#0A1A2F] dark:text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                    {work.category}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#0A1A2F] dark:text-white mb-2 line-clamp-2">
                  {work.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                  {work.descriptionUz || work.descriptionEn || work.descriptionRu}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500">
                    {new Date(work.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(work)}
                      className="p-2 text-[#0A1A2F] dark:text-[#F2C94C] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(work._id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#0A1A2F] to-[#1a2f4f] text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
                <h3 className="text-2xl font-bold">
                  {editingWork ? 'Edit Work' : 'Add New Work'}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="error-message p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg font-semibold">
                    <div className="flex items-center space-x-2">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A1A2F] dark:text-white mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter work title"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2C94C] focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A1A2F] dark:text-white mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Painting, Sculpture, Pottery"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2C94C] focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>

                {/* Descriptions - 3 Languages */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <span className="text-sm font-semibold text-gray-500">Descriptions (3 Languages)</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <label className="block text-sm font-semibold text-[#0A1A2F] dark:text-white mb-2">
                      🇺🇿 O'zbekcha Description *
                    </label>
                    <textarea
                      name="descriptionUz"
                      value={formData.descriptionUz}
                      onChange={handleChange}
                      required
                      rows="4"
                      placeholder="Ishning o'zbekcha tavsifi..."
                      className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
                    />
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <label className="block text-sm font-semibold text-[#0A1A2F] dark:text-white mb-2">
                      🇷🇺 Русский Description *
                    </label>
                    <textarea
                      name="descriptionRu"
                      value={formData.descriptionRu}
                      onChange={handleChange}
                      required
                      rows="4"
                      placeholder="Описание работы на русском..."
                      className="w-full px-4 py-3 border-2 border-red-200 dark:border-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
                    />
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <label className="block text-sm font-semibold text-[#0A1A2F] dark:text-white mb-2">
                      🇬🇧 English Description *
                    </label>
                    <textarea
                      name="descriptionEn"
                      value={formData.descriptionEn}
                      onChange={handleChange}
                      required
                      rows="4"
                      placeholder="Work description in English..."
                      className="w-full px-4 py-3 border-2 border-green-200 dark:border-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Media Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <span className="text-sm font-semibold text-gray-500">Media (Image / Video / URL)</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  </div>

                  {/* Media Type Selector */}
                  <div className="flex space-x-2">
                    {['image', 'video', 'url'].map((type) => (
                      <motion.button
                        key={type}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setMediaType(type);
                          setImageFile(null);
                          setVideoFile(null);
                          setImagePreview('');
                          setVideoPreview('');
                        }}
                        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                          mediaType === type
                            ? 'bg-[#0A1A2F] text-[#F2C94C] shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {type === 'image' && <><ImageIcon className="w-4 h-4 inline mr-2" />Image</>}
                        {type === 'video' && <><Video className="w-4 h-4 inline mr-2" />Video File</>}
                        {type === 'url' && <><LinkIcon className="w-4 h-4 inline mr-2" />Video URL</>}
                      </motion.button>
                    ))}
                  </div>

                  {/* Image Upload */}
                  {mediaType === 'image' && (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                      <label className="flex flex-col items-center justify-center cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          {imagePreview ? 'Change Image' : 'Upload Image'}
                          {!editingWork && <span className="text-red-500 ml-1">*</span>}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                        />
                        {imagePreview && (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="mt-4 w-full h-64 object-cover rounded-lg shadow-md"
                          />
                        )}
                      </label>
                      {!imagePreview && !editingWork && (
                        <p className="text-xs text-red-500 text-center mt-2">
                          Image is required for new works
                        </p>
                      )}
                    </div>
                  )}

                  {/* Video Upload */}
                  {mediaType === 'video' && (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                      <label className="flex flex-col items-center justify-center cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          {videoPreview ? 'Change Video' : 'Upload Video File'}
                        </span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoChange}
                          className="hidden"
                        />
                        {videoPreview && (
                          <video
                            src={videoPreview}
                            controls
                            className="mt-4 w-full h-64 object-cover rounded-lg shadow-md"
                          />
                        )}
                      </label>
                    </div>
                  )}

                  {/* Video URL */}
                  {mediaType === 'url' && (
                    <div>
                      <input
                        type="text"
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleChange}
                        placeholder="YouTube or Vimeo URL (e.g., https://www.youtube.com/watch?v=...)"
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F2C94C] focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <label className="text-sm font-semibold text-[#0A1A2F] dark:text-white">
                      Featured Work
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Featured works appear prominently
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#F2C94C]/20 dark:peer-focus:ring-[#F2C94C]/30 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#F2C94C]"></div>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-gradient-to-r from-[#0A1A2F] to-[#1a2f4f] text-[#F2C94C] rounded-lg hover:shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving...' : editingWork ? 'Update Work' : 'Create Work'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorksManagement;
