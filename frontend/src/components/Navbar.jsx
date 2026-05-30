import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { ShoppingCart, Search, User, LogOut, LayoutDashboard, History, Heart } from 'lucide-react';

const Navbar = ({ setSearchQuery }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (setSearchQuery) {
      setSearchQuery(searchVal);
      navigate('/');
    }
  };

  const handleInputChange = (e) => {
    setSearchVal(e.target.value);
    if (setSearchQuery) {
      setSearchQuery(e.target.value);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-darkBg/80 border-b border-gray-150 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              Khusi Kirana
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative">
            <input
              type="text"
              placeholder="Search vegetables, atta, spices..."
              value={searchVal}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-slate-700 bg-gray-55 dark:bg-slate-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          </form>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4 shrink-0">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wishlist Link */}
            {user && (
              <Link to="/profile?tab=wishlist" className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                <Heart className="w-6 h-6" />
              </Link>
            )}

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <>
                    <div onClick={() => setDropdownOpen(false)} className="fixed inset-0 z-10"></div>
                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-850 z-20 transition-all duration-200 animate-in fade-in slide-in-from-top-3">
                      
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                        >
                          <LayoutDashboard className="w-4.5 h-4.5 mr-2.5 text-primary-500" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                      >
                        <User className="w-4.5 h-4.5 mr-2.5 text-accent-500" />
                        My Profile
                      </Link>

                      <Link
                        to="/profile?tab=orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                      >
                        <History className="w-4.5 h-4.5 mr-2.5 text-blue-500" />
                        Order History
                      </Link>

                      <hr className="my-1 border-gray-100 dark:border-slate-800" />

                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                          navigate('/');
                        }}
                        className="flex w-full items-center px-4 py-2.5 text-sm text-red-650 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                      >
                        <LogOut className="w-4.5 h-4.5 mr-2.5" />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-full text-sm font-semibold text-white bg-primary-650 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 shadow-sm transition-all duration-200 hover:scale-[1.02]"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile Search bar */}
        <div className="md:hidden py-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search fresh items..."
              value={searchVal}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-slate-700 bg-gray-55 dark:bg-slate-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          </form>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
