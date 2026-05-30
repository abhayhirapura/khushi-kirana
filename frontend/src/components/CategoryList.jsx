import React, { useEffect, useState } from 'react';
import API from '../services/api.js';

const CategoryList = ({ selectedCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/products/categories');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories, using fallback:', error);
        // Fallback categories list
        setCategories([
          { name: 'Fruits & Vegetables', image: 'https://images.unsplash.com/photo-1610832958506-ee56336191d8?w=100' },
          { name: 'Rice & Grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100' },
          { name: 'Atta & Flour', image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=100' },
          { name: 'Pulses & Dal', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100' },
          { name: 'Oil & Ghee', image: 'https://images.unsplash.com/photo-1622484211148-716598e04041?w=100' },
          { name: 'Spices & Masala', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=100' },
          { name: 'Snacks & Namkeen', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?w=100' },
          { name: 'Biscuits & Bakery', image: 'https://images.unsplash.com/photo-1558961309-db6f1a3eb84d?w=100' },
          { name: 'Tea & Coffee', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100' },
          { name: 'Dry Fruits', image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=100' },
          { name: 'Noodles & Pasta', image: 'https://images.unsplash.com/photo-1612966608967-312ba599102e?w=100' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse"></div>
            <div className="w-20 h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-800">
      {/* "All" button */}
      <button
        onClick={() => onSelectCategory('')}
        className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer focus:outline-none group"
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300 border ${
          selectedCategory === ''
            ? 'bg-primary-500 border-primary-500 text-white scale-105'
            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:border-primary-400'
        }`}>
          ✨ All
        </div>
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 group-hover:text-primary-500 transition-colors">
          Show All
        </span>
      </button>

      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onSelectCategory(cat.name)}
          className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer focus:outline-none group"
        >
          <div className={`w-16 h-16 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 border ${
            selectedCategory === cat.name
              ? 'border-primary-500 ring-2 ring-primary-500 scale-105'
              : 'border-gray-200 dark:border-slate-800 hover:border-primary-400'
          }`}>
            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
          </div>
          <span className={`text-xs font-semibold max-w-[85px] text-center line-clamp-1 group-hover:text-primary-500 transition-colors ${
            selectedCategory === cat.name
              ? 'text-primary-600 dark:text-primary-400 font-bold'
              : 'text-gray-600 dark:text-gray-300'
          }`}>
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoryList;
