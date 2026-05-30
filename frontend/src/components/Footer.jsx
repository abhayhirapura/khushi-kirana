import React from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 dark:bg-slate-950 border-t border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Pitch */}
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Khushi Kirana
            </span>
            <p className="mt-4 text-xs font-semibold text-slate-400 leading-relaxed max-w-sm">
              Your premium neighborhood grocery and daily essentials store. We deliver fresh produce, top-quality grains, and household necessities straight to your doorstep in under 3 hours.
            </p>
            <div className="mt-6 flex items-center space-x-2 text-xs text-primary-400 font-extrabold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Secure Checkout & Freshness Guaranteed</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-extrabold text-white tracking-widest uppercase">Delivery Info</h3>
            <ul className="mt-4 space-y-2.5 text-xs font-bold text-slate-400">
              <li className="flex items-center space-x-1.5">
                <span className="text-primary-400">⏱️</span>
                <span>Delivery: 7 AM - 10 PM</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="text-primary-400">🚀</span>
                <span>Same-day Instant Dispatch</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="text-primary-400">📦</span>
                <span>Free Delivery above ₹300</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="text-primary-400">💬</span>
                <span>Real-time Order Tracking</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-extrabold text-white tracking-widest uppercase">Get in Touch</h3>
            <ul className="mt-4 space-y-3.5 text-xs font-bold text-slate-400">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-3 text-primary-400 shrink-0" />
                <span>Heerapura, Jaipur, Rajasthan, 302021</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-accent-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-blue-400 shrink-0" />
                <span>support@khusikirana.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Ownership and Copyright Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black tracking-wide text-slate-500">
            &copy; {new Date().getFullYear()} KHUSHI KIRANA. All rights reserved.
          </p>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-800/40 px-3 py-1.5 rounded-full border border-slate-800">
            <span>Owned & Operated by:</span>
            <span className="font-extrabold text-white flex items-center">
              Annu Rajawat Heerapura
              <Heart className="w-3.5 h-3.5 ml-1 text-red-500 fill-current" />
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
