import React from 'react';

export function About() {
  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-6">Our Mission</h1>
        <p className="text-xl text-text-secondary leading-relaxed">
          To help people organize their thoughts, clarify their ideas, and achieve more by providing a beautiful, distraction-free environment for thinking.
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-text-secondary">
        <h2 className="text-2xl font-bold text-text-primary mt-12 mb-4">Our Story</h2>
        <p className="mb-6">
          NotePad began in 2023 with a simple observation: modern tools are too cluttered. Between notifications, complex formatting menus, and endless configuration options, the actual act of writing had become a secondary feature.
        </p>
        <p className="mb-12">
          We set out to build a tool that gets out of your way. A tool where the interface fades into the background, leaving only you and your thoughts. Today, NotePad is used by thousands of creators, engineers, and thinkers worldwide.
        </p>

        <h2 className="text-2xl font-bold text-text-primary mt-12 mb-6">Core Values</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {[
            { title: "Simplicity first", desc: "If a feature requires a tutorial, it's too complex." },
            { title: "Speed matters", desc: "Every interaction should feel instantaneous." },
            { title: "Design is function", desc: "A beautiful interface isn't just nice to look at, it's easier to use." },
            { title: "Privacy by default", desc: "Your data belongs to you, always." }
          ].map((val, i) => (
            <div key={i} className="bg-secondary-bg p-6 rounded-2xl border border-border-default">
              <h3 className="font-bold text-text-primary mb-2">{val.title}</h3>
              <p className="text-sm">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
