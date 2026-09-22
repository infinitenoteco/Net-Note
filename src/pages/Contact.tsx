import React, { useState } from 'react';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-6">Get in touch</h1>
        <p className="text-xl text-text-secondary">
          Have a question or need support? We're here to help. Fill out the form below or reach out directly.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <div className="bg-surface border border-border-default rounded-3xl p-8 shadow-sm">
          {submitted ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-secondary-bg rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Message Sent!</h3>
              <p className="text-text-secondary">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5" htmlFor="name">First Name</label>
                  <input required type="text" id="name" className="w-full bg-secondary-bg border border-border-default rounded-xl px-4 py-3 focus:outline-none focus:border-text-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5" htmlFor="email">Email</label>
                  <input required type="email" id="email" className="w-full bg-secondary-bg border border-border-default rounded-xl px-4 py-3 focus:outline-none focus:border-text-primary transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5" htmlFor="subject">Subject</label>
                <select id="subject" className="w-full bg-secondary-bg border border-border-default rounded-xl px-4 py-3 focus:outline-none focus:border-text-primary transition-colors appearance-none">
                  <option>General Support</option>
                  <option>Billing Question</option>
                  <option>Feature Request</option>
                  <option>Bug Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5" htmlFor="message">Message</label>
                <textarea required id="message" rows={5} className="w-full bg-secondary-bg border border-border-default rounded-xl px-4 py-3 focus:outline-none focus:border-text-primary transition-colors resize-none"></textarea>
              </div>
              <button type="submit" className="w-full bg-text-primary text-white rounded-xl px-4 py-4 font-medium hover:bg-text-primary/90 transition-colors">
                Send Message
              </button>
            </form>
          )}
        </div>

        <div className="space-y-12 lg:pl-8">
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary-bg rounded-xl border border-border-default"><Mail className="w-5 h-5 text-text-primary" /></div>
                <div>
                  <p className="font-semibold text-text-primary">Email Support</p>
                  <p className="text-text-secondary mt-1">support@notepadapp.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary-bg rounded-xl border border-border-default"><MapPin className="w-5 h-5 text-text-primary" /></div>
                <div>
                  <p className="font-semibold text-text-primary">Headquarters</p>
                  <p className="text-text-secondary mt-1">123 Innovation Drive<br/>San Francisco, CA 94103</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-secondary-bg rounded-2xl border border-border-default">
            <h4 className="font-bold text-text-primary mb-2">Looking for immediate answers?</h4>
            <p className="text-sm text-text-secondary mb-4">Check our help center for quick solutions to common questions.</p>
            <a href="#" className="text-sm font-medium text-text-primary hover:underline">Visit Help Center &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  );
}
