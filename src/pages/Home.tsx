import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileText, Cloud, Check, Pin, Users, Search, Folder, Type, Video, Code, Table, Link as LinkIcon, Share2, Zap, Layout } from 'lucide-react';

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-bg border border-border-default mb-8">
            <span className="flex h-2 w-2 rounded-full bg-text-primary"></span>
            <span className="text-sm font-medium text-text-primary">Infinite Note is here</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text-primary mb-6 leading-tight">
            Everything you want to remember.<br />
            <span className="text-text-secondary">Organized beautifully.</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            The modern workspace for your notes, tasks, and ideas. Write beautifully with rich media, organize effortlessly, and sync instantly across all devices.
          </p>
          {/*<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-text-primary text-white rounded-xl font-medium text-lg hover:bg-text-primary/90 transition-colors shadow-sm">
              Get Started for Free
            </Link>
            <Link to="/features" className="w-full sm:w-auto px-8 py-4 bg-surface border border-border-default text-text-primary rounded-xl font-medium text-lg hover:bg-secondary-bg transition-colors">
              Explore Features
            </Link>
          </div>*/}
        </motion.div>

        {/* Product Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 relative mx-auto max-w-5xl"
        >
          <div className="rounded-2xl border border-border-default bg-surface shadow-2xl overflow-hidden aspect-[16/9] flex flex-col relative">
            <div className="h-12 border-b border-border-default flex items-center px-4 gap-2 bg-secondary-bg">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-border-default"></div>
                <div className="w-3 h-3 rounded-full bg-border-default"></div>
                <div className="w-3 h-3 rounded-full bg-border-default"></div>
              </div>
            </div>
            <div className="flex-1 flex bg-primary-bg relative">
              <div className="w-64 border-r border-border-default bg-secondary-bg hidden md:block">
                <div className="p-4 space-y-4">
                  <div className="h-4 bg-border-default/50 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-border-default/50 rounded-lg w-full"></div>
                    <div className="h-8 bg-border-default/30 rounded-lg w-full"></div>
                    <div className="h-8 bg-border-default/30 rounded-lg w-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-8">
                <div className="h-8 bg-text-primary/10 rounded w-1/3 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-border-default/40 rounded w-full"></div>
                  <div className="h-4 bg-border-default/40 rounded w-5/6"></div>
                  <div className="h-4 bg-border-default/40 rounded w-4/6"></div>
                </div>
                <div className="mt-8 p-6 border border-border-default rounded-xl bg-secondary-bg">
                  <div className="h-32 bg-border-default/30 rounded-lg w-full flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating cards */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -left-6 top-1/4 bg-surface p-4 rounded-xl border border-border-default shadow-lg hidden lg:flex items-center gap-3"
            >
              <div className="p-2 bg-secondary-bg rounded-lg"><Check className="w-5 h-5 text-text-primary" /></div>
              <div>
                <p className="text-sm font-semibold">Auto-saved</p>
                <p className="text-xs text-text-secondary">Just now</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 border-y border-border-default bg-secondary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-text-secondary mb-8 uppercase tracking-widest">Trusted by innovative teams worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale">
            {['Acme Corp', 'GlobalNet', 'Nexus', 'Stark Ind.', 'Wayne Ent.'].map((name) => (
              <div key={name} className="text-2xl font-bold font-serif text-text-primary">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mb-6">Everything you need to work faster</h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            NotePad combines simplicity with powerful features to give you the ultimate note-taking experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="group p-6 rounded-2xl border border-border-default bg-surface hover:border-text-primary/30 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-secondary-bg border border-border-default flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rich Editor Section */}
      <section className="py-32 bg-secondary-bg border-y border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mb-6">A truly rich editing experience</h2>
              <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                NotePad goes beyond plain text. Embed media, write code, create tables, and format your thoughts exactly how you envision them.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Type className="w-4 h-4" />, label: 'Rich Typography' },
                  { icon: <Check className="w-4 h-4" />, label: 'Checklists' },
                  { icon: <Video className="w-4 h-4" />, label: 'Embed Video' },
                  { icon: <Code className="w-4 h-4" />, label: 'Code Blocks' },
                  { icon: <Table className="w-4 h-4" />, label: 'Tables' },
                  { icon: <LinkIcon className="w-4 h-4" />, label: 'Smart Links' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-surface border border-border-default text-text-primary">
                      {item.icon}
                    </div>
                    <span className="font-medium text-sm text-text-primary">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-border-default/50 to-transparent rounded-3xl transform translate-x-4 translate-y-4"></div>
              <div className="relative bg-surface p-8 rounded-3xl border border-border-default shadow-xl">
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold font-serif text-text-primary">Product Launch Plan</h3>
                  <p className="text-text-secondary leading-relaxed">Here are the key deliverables for the upcoming Q3 launch. We need to ensure all assets are ready by next week.</p>
                  
                  <div className="bg-secondary-bg p-4 rounded-xl border border-border-default font-mono text-sm text-text-secondary">
                    <span className="text-text-primary font-bold">function</span> initLaunch() {'{'} <br/>
                    &nbsp;&nbsp;console.log('Ready for liftoff');<br/>
                    {'}'}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded border-2 border-text-primary bg-text-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-text-secondary line-through">Finalize marketing copy</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded border-2 border-border-default"></div>
                      <span className="text-text-primary font-medium">Prepare social media assets</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">Loved by creators and teams</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { quote: "NotePad completely changed how I organize my research. It's minimal, fast, and beautiful.", author: "Sarah Jenkins", role: "Product Designer" },
            { quote: "Finally, a notes app that doesn't feel cluttered. The rich editor is the best I've used.", author: "David Chen", role: "Software Engineer" },
            { quote: "We moved our entire startup's documentation to NotePad. The sharing features are flawless.", author: "Elena Rodriguez", role: "Startup Founder" }
          ].map((testimonial, i) => (
            <div key={i} className="p-8 rounded-2xl border border-border-default bg-surface hover:bg-secondary-bg transition-colors">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} className="w-5 h-5 text-text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-text-primary text-lg mb-8 leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-border-default rounded-full"></div>
                <div>
                  <p className="font-bold text-text-primary">{testimonial.author}</p>
                  <p className="text-sm text-text-secondary">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-text-primary rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/5"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-white/5"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Ready to organize your mind?</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
              Join thousands of professionals who have transformed their workflow with NotePad. Free forever for individuals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="px-8 py-4 bg-white text-text-primary rounded-xl font-medium text-lg hover:bg-gray-100 transition-colors">
                Get Started
              </Link>
              <Link to="/login" className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-xl font-medium text-lg hover:bg-white/10 transition-colors">
                Log in to Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  { icon: <FileText className="w-6 h-6 text-text-primary" />, title: 'Rich Notes', description: 'Write beautifully with full markdown support and advanced formatting.' },
  { icon: <Cloud className="w-6 h-6 text-text-primary" />, title: 'Auto Save', description: 'Your changes are saved instantly. Never lose a single word again.' },
  { icon: <Folder className="w-6 h-6 text-text-primary" />, title: 'Groups', description: 'Organize your notes into folders and groups for easy access.' },
  { icon: <Pin className="w-6 h-6 text-text-primary" />, title: 'Pinned Notes', description: 'Keep your most important notes at the top of your workspace.' },
  { icon: <Share2 className="w-6 h-6 text-text-primary" />, title: 'Share Notes', description: 'Share read-only or editable links with anyone in seconds.' },
  { icon: <LinkIcon className="w-6 h-6 text-text-primary" />, title: 'Attachments', description: 'Attach files, PDFs, and images directly to your notes.' },
  { icon: <Search className="w-6 h-6 text-text-primary" />, title: 'Powerful Search', description: 'Find anything instantly with lightning-fast full-text search.' },
  { icon: <Layout className="w-6 h-6 text-text-primary" />, title: 'Responsive', description: 'Looks and works perfectly on desktop, tablet, and mobile.' },
  { icon: <Check className="w-6 h-6 text-text-primary" />, title: 'Keyboard Shortcuts', description: 'Navigate and edit entirely without touching your mouse.' },
  { icon: <Zap className="w-6 h-6 text-text-primary" />, title: 'Fast Sync', description: 'Real-time synchronization across all your devices.' },
  { icon: <Users className="w-6 h-6 text-text-primary" />, title: 'Collaboration', description: 'Invite team members to view or edit workspaces with you.' },
  { icon: <Code className="w-6 h-6 text-text-primary" />, title: 'Code Blocks', description: 'Beautiful syntax highlighting for over 50 programming languages.' },
];
