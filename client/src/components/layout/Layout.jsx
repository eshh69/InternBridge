import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E6]/50">
      <Navbar />
      <main className={`flex-1 ${isHomePage ? 'w-full' : 'w-full lg:w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
