import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FileText, CheckCircle2, Shield, Zap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-primary-bg">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary-bg flex-col justify-between p-12 border-r border-border-default">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 bg-text-primary text-white rounded-lg flex items-center justify-center font-bold text-lg">
              N
            </div>
            <span className="font-bold text-xl tracking-tight text-text-primary">NotePad</span>
          </Link>
          
          <h1 className="text-4xl font-bold text-text-primary mb-6 leading-tight">
            Everything you want to remember.<br />Organized beautifully.
          </h1>
          
          <div className="space-y-8 mt-12">
            <Feature 
              icon={<FileText className="w-6 h-6" />}
              title="Rich text editing"
              description="Write beautifully with full markdown support, slash commands, and rich media."
            />
            <Feature 
              icon={<Zap className="w-6 h-6" />}
              title="Lightning fast sync"
              description="Your notes sync instantly across all your devices, available everywhere."
            />
            <Feature 
              icon={<Shield className="w-6 h-6" />}
              title="Secure by default"
              description="Enterprise-grade encryption keeps your private thoughts private."
            />
          </div>
        </div>
        
        <div className="mt-12 text-sm text-text-secondary">
          &copy; {new Date().getFullYear()} Infinite Note Inc.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative">
        <Link to="/" className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 bg-text-primary text-white rounded-lg flex items-center justify-center font-bold text-lg">
            I
          </div>
          <span className="font-bold text-xl tracking-tight text-text-primary">Infinite Note</span>
        </Link>
        <Outlet />
      </div>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 bg-surface border border-border-default rounded-xl shadow-sm">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
