import React from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-md w-full bg-card rounded-2xl border shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-white text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black mb-2">
            Access Denied
          </h2>
          <p className="text-white/90">
            You don't have permission to access this page.
          </p>
          {user && (
            <p className="mt-3 text-sm text-white/80">
              Current role: <span className="font-bold">{user.role}</span>
            </p>
          )}
        </div>
        
        <div className="p-8 space-y-4">
          <Link
            to="/"
            className="block w-full py-4 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-xl font-bold text-center hover:shadow-xl transition-all"
          >
            Go to Home
          </Link>
          
          {user?.role === 'buyer' && (
            <Link
              to="/buyer-dashboard"
              className="block w-full py-4 border-2 border-[#E5E0D8] dark:border-[#2A342E] text-[#1A1A1A] dark:text-[#A8B5AE] bg-white rounded-xl font-semibold text-center hover:border-ethiopian-green hover:text-ethiopian-green transition-all"
            >
              Go to Buyer Dashboard
            </Link>
          )}
          
          {(user?.role === 'seller' || user?.role === 'agent') && (
            <Link
              to="/seller-dashboard"
              className="block w-full py-4 border-2 border-[#E5E0D8] dark:border-[#2A342E] text-[#1A1A1A] dark:text-[#A8B5AE] bg-white rounded-xl font-semibold text-center hover:border-ethiopian-green hover:text-ethiopian-green transition-all"
            >
              Go to Seller Dashboard
            </Link>
          )}
          
          {user?.role === 'admin' && (
            <Link
              to="/admin-dashboard"
              className="block w-full py-4 border-2 border-[#E5E0D8] dark:border-[#2A342E] text-[#1A1A1A] dark:text-[#A8B5AE] bg-white rounded-xl font-semibold text-center hover:border-ethiopian-green hover:text-ethiopian-green transition-all"
            >
              Go to Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

