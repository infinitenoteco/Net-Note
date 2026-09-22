import React from 'react';
import { motion } from 'motion/react';
import { Type, Database, Search, Shield, Zap, Share2, Smartphone, Layout } from 'lucide-react';

export function Features() {
  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-6">Built for speed. Designed for focus.</h1>
        <p className="text-xl text-text-secondary">
          Explore the tools that make NotePad the ultimate workspace for your thoughts, projects, and collaboration.
        </p>
      </div>

      <div className="space-y-32">
        <FeatureSection 
          title="Rich Media Support"
          description="A picture is worth a thousand words. NotePad supports images, videos, audio clips, and PDFs natively. Drag and drop any file directly into your notes without breaking your flow."
          icon={<Type />}
          imageContent={
            <div className="h-full w-full bg-secondary-bg rounded-2xl border border-border-default p-6 flex flex-col gap-4">
              <div className="h-48 bg-border-default/30 rounded-xl w-full flex items-center justify-center">
                <span className="text-text-muted">Image Placeholder</span>
              </div>
              <div className="h-16 bg-surface border border-border-default rounded-xl p-4 flex items-center gap-4">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold text-xs">PDF</div>
                <div>
                  <div className="text-sm font-medium">Q3_Report_Final.pdf</div>
                  <div className="text-xs text-text-muted">2.4 MB</div>
                </div>
              </div>
            </div>
          }
        />

        <FeatureSection 
          title="Powerful Search"
          description="Never lose a thought again. Our search engine indexes every word, tag, and attachment instantly. Use advanced filters to find exactly what you're looking for."
          icon={<Search />}
          reverse
          imageContent={
            <div className="h-full w-full bg-secondary-bg rounded-2xl border border-border-default p-6 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary-bg z-10 pointer-events-none"></div>
              <div className="bg-surface border border-border-default rounded-xl p-3 flex items-center gap-3 shadow-lg z-20 mb-4 transform -translate-y-4">
                <Search className="w-5 h-5 text-text-muted" />
                <span className="text-text-primary">marketing campaign</span>
              </div>
              <div className="space-y-3 z-0 opacity-50">
                <div className="h-16 bg-surface rounded-lg border border-border-default"></div>
                <div className="h-16 bg-surface rounded-lg border border-border-default"></div>
                <div className="h-16 bg-surface rounded-lg border border-border-default"></div>
              </div>
            </div>
          }
        />

        <FeatureSection 
          title="Enterprise Security"
          description="Your data is yours. NotePad uses AES-256 encryption at rest and TLS 1.3 in transit. For teams, manage granular permissions and access controls with ease."
          icon={<Shield />}
          imageContent={
            <div className="h-full w-full bg-secondary-bg rounded-2xl border border-border-default p-6 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-border-default flex items-center justify-center relative">
                <Shield className="w-12 h-12 text-text-primary" />
                <div className="absolute top-0 right-0 w-8 h-8 bg-surface rounded-full border border-border-default flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          }
        />
      </div>

      <div className="mt-32 border-t border-border-default pt-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Zap />, title: "Instant Sync", text: "Changes sync in milliseconds across all active devices." },
            { icon: <Smartphone />, title: "Mobile Ready", text: "A native experience on iOS and Android browsers." },
            { icon: <Database />, title: "Offline Mode", text: "Keep working even when your connection drops." },
            { icon: <Layout />, title: "Templates", text: "Start faster with built-in structure for common tasks." }
          ].map((item, i) => (
            <div key={i}>
              <div className="w-10 h-10 rounded-lg bg-secondary-bg border border-border-default flex items-center justify-center mb-4 text-text-primary">
                {item.icon}
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{item.title}</h3>
              <p className="text-sm text-text-secondary">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureSection({ title, description, icon, imageContent, reverse = false }: any) {
  return (
    <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
      <div className={reverse ? 'lg:order-2' : 'lg:order-1'}>
        <div className="w-12 h-12 rounded-xl bg-secondary-bg border border-border-default flex items-center justify-center mb-6 text-text-primary">
          {icon}
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-text-primary mb-6">{title}</h2>
        <p className="text-lg text-text-secondary leading-relaxed mb-8">{description}</p>
      </div>
      <div className={`h-[400px] rounded-3xl p-2 bg-border-default/20 ${reverse ? 'lg:order-1' : 'lg:order-2'}`}>
        {imageContent}
      </div>
    </div>
  );
}
