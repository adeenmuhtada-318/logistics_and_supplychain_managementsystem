import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-page)] overflow-x-hidden transition-colors duration-150">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-20 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
      
      <main className="lg:ml-56 pt-14 min-h-[calc(100vh-3.5rem)] overflow-x-hidden">
        <div className="p-4 md:p-6 max-w-7xl w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
