import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const links = [
    { name: 'Features', path: '/features' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    {/* name: 'Pricing', path: '/pricing' */},
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-primary-bg/80 backdrop-blur-md border-b border-border-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-text-primary text-white rounded-lg flex items-center justify-center font-bold text-lg">
                I
              </div>
              <span className="font-bold text-xl tracking-tight">Infinite Note</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-text-primary",
                  location.pathname === link.path ? "text-text-primary" : "text-text-secondary"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Link
                to="/login"
                className="text-sm font-medium bg-text-primary text-white px-4 py-2 rounded-lg hover:bg-text-primary/90 transition-colors shadow-sm"
              >
                Get it free
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-4 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/login"
                  className="text-sm font-medium bg-text-primary text-white px-4 py-2 rounded-lg hover:bg-text-primary/90 transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(true)}
              className="text-text-secondary hover:text-text-primary p-2"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-text-primary/20 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-primary-bg shadow-2xl z-50 p-6 flex flex-col md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-xl tracking-tight">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-secondary-bg text-text-secondary transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex flex-col space-y-4 flex-1">
                {links.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-text-secondary hover:text-text-primary transition-colors py-2"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              
              <div className="flex flex-col space-y-3 mt-auto pt-6 border-t border-border-default">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center text-sm font-medium bg-text-primary text-white px-4 py-3 rounded-xl hover:bg-text-primary/90 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center text-sm font-medium border border-border-default text-text-primary px-4 py-3 rounded-xl hover:bg-secondary-bg transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center text-sm font-medium bg-text-primary text-white px-4 py-3 rounded-xl hover:bg-text-primary/90 transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
