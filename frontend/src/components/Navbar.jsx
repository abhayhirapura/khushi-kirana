import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { ShoppingCart, Search, User, LogOut, LayoutDashboard, History, Heart, MapPin } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-darkBg/80 border-b border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Delivery Location */}
          <div className="flex items-center space-x-6 shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                Khushi Kirana
              </span>
            </Link>
            
            {/* Swiggy Instamart-style Location Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200/40 dark:border-slate-700/40">
              <MapPin className="w-3.5 h-3.5 text-primary-500" />
              <div className="text-left">
                <span className="text-[9px] font-black text-slate-400 block leading-none uppercase">3 HR DELIVERY</span>
                <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 block">Heerapura, Jaipur</span>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative">
            <input
              type="text"
              placeholder="Search fresh vegetables, milk, grains..."
              value={searchVal}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          </form>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4 shrink-0">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wishlist Link */}
            {user && (
              <Link 
                to="/profile?tab=wishlist" 
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="My Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {/* Cart Icon */}
            <Link 
              to="/cart" 
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-black leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors duration-200 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white font-black uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:block text-xs font-bold text-slate-700 dark:text-slate-200">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <>
                    <div onClick={() => setDropdownOpen(false)} className="fixed inset-0 z-10"></div>
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl py-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 z-20 transition-all duration-200 animate-in fade-in slide-in-from-top-3">
                      
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2.5 text-primary-500" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <User className="w-4 h-4 mr-2.5 text-accent-500" />
                        My Profile
                      </Link>

                      <Link
                        to="/profile?tab=orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <History className="w-4 h-4 mr-2.5 text-blue-500" />
                        Order History
                      </Link>

                      <hr className="my-1.5 border-slate-100 dark:border-slate-800" />

                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                          navigate('/');
                        }}
                        className="flex w-full items-center px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-black text-white bg-primary-500 hover:bg-primary-600 shadow-sm transition-all duration-200 active:scale-[0.97]"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile Search bar */}
        <div className="md:hidden py-2.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search vegetables, atta, fresh items..."
              value={searchVal}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-xs"
            />
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          </form>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
