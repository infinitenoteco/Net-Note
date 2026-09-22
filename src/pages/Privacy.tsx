import React from 'react';

export function Privacy() {
  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-text-primary mb-4">Privacy Policy</h1>
      <p className="text-text-secondary mb-12">Last updated: August 4, 2026</p>
      
      <div className="prose prose-lg max-w-none text-text-secondary space-y-6">
        <p>At NotePad, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>
        
        <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, update your profile, use the interactive features of our services, or communicate with us.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Account information (name, email)</li>
          <li>Content you create (notes, folders, attachments)</li>
          <li>Usage data and preferences</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">How We Use Your Information</h2>
        <p>We use the information we collect to deliver, maintain, and improve our services. Specifically, we use it to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide and maintain the Service</li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices, updates, and support messages</li>
          <li>Respond to your comments, questions, and requests</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect the security of your personal information. Your notes are encrypted at rest and in transit.</p>
        
        <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@notepadapp.com.</p>
      </div>
    </div>
  );
}
