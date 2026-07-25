import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Menu, Plus } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  onAddClick?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onAddClick }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Automatically collapse sidebar on smaller desktop/tablet resolutions
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call initially
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile Drawer Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-64 h-full">
            <Sidebar collapsed={false} setCollapsed={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center">
          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setMobileOpen(true)}
            className="p-3.5 border-b border-border text-text-secondary hover:text-text-primary bg-surface/40 md:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1">
            <Topbar onAddClick={onAddClick} />
          </div>
        </div>

        {/* Viewport Content */}
        <main className="flex-grow p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
        
        {/* Mobile floating quick action button */}
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="md:hidden fixed right-6 bottom-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-black shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all z-35"
          >
            <Plus size={24} />
          </button>
        )}
      </div>
    </div>
  );
};
