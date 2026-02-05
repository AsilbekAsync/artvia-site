import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import axios from "axios";

const CategoryMenu = () => {
  const { t, i18n } = useTranslation();
  const { categoryId } = useParams();
  const [categories, setCategories] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/categories");
      setCategories(res.data);
    } catch (error) {
      // console.error("Error fetching categories:", error);
      // Use default categories if API fails
      setCategories([
        {
          _id: "home",
          slug: "home",
          name: "Home",
          nameUz: "Bosh sahifa",
          nameRu: "Главная",
        },
        {
          _id: "1",
          slug: "fashion-illustration",
          name: "Fashion illustration",
          nameUz: "Fashion illustration",
          nameRu: "Fashion иллюстрация",
        },
        {
          _id: "2",
          slug: "amaliy-sanat",
          name: "Amaliy san'at",
          nameUz: "Amaliy san'at",
          nameRu: "Прикладное искусство",
        },
        {
          _id: "3",
          slug: "grafika",
          name: "Grafika",
          nameUz: "Grafika",
          nameRu: "Графика",
        },
        {
          _id: "4",
          slug: "haykaltaroshlik",
          name: "Haykaltaroshlik",
          nameUz: "Haykaltaroshlik",
          nameRu: "Скульптура",
        },
        {
          _id: "5",
          slug: "temirchilik",
          name: "Temirchilik",
          nameUz: "Temirchilik",
          nameRu: "Кузнечное дело",
        },
        {
          _id: "6",
          slug: "kulolchilik",
          name: "Kulolchilik",
          nameUz: "Kulolchilik",
          nameRu: "Гончарное дело",
        },
        // {
        //   _id: "7",
        //   slug: "zardozlik",
        //   name: "Zardo'zlik va kashtachilik",
        //   nameUz: "Zardo'zlik va kashtachilik",
        //   nameRu: "Золотое шитье и вышивка",
        // },
        // {
        //   _id: "8",
        //   slug: "yogoch-oymakorligi",
        //   name: "Yog'och o'ymakorligi",
        //   nameUz: "Yog'och o'ymakorligi",
        //   nameRu: "Резьба по дереву",
        // },
      ]);
    }
  };

  const getCategoryName = (category) => {
    const lang = i18n.language;
    if (lang === "uz") return category.nameUz || category.name;
    if (lang === "ru") return category.nameRu || category.name;
    return category.name;
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="sticky z-30 bg-white border-b border-gray-200 top-16 dark:bg-gray-900 dark:border-gray-800">
      <div className="relative">
        {/* Scroll indicators */}
        <div className="absolute top-0 bottom-0 left-0 z-10 w-4 pointer-events-none bg-gradient-to-r from-white dark:from-gray-900 to-transparent" />
        <div className="absolute top-0 bottom-0 right-0 z-10 w-4 pointer-events-none bg-gradient-to-l from-white dark:from-gray-900 to-transparent" />

        <div className="px-2 mx-auto sm:px-4 lg:px-8 max-w-7xl">
          <div className="flex items-center py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {categories.map((category) => {
              const isHome = category.slug === "home";
              const isActive = isHome
                ? !categoryId
                : category._id === categoryId;

              return (
                <div
                  key={category._id}
                  className="flex-shrink-0 px-1 first:ml-0 last:mr-0"
                >
                  <Link
                    to={isHome ? "/" : `/category/${category._id}`}
                    className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg shadow-orange-500/20"
                          : "text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {getCategoryName(category)}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-1.5 h-1.5 bg-white rounded-full"
                          />
                        )}
                      </span>
                    </motion.div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;
