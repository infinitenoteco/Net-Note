import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-bg px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-text-primary mb-6">Page not found</h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <Link 
          to="/" 
          className="inline-block px-8 py-4 bg-text-primary text-white rounded-xl font-medium hover:bg-text-primary/90 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
