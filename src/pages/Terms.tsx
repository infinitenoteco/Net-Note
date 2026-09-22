import React from 'react';

export function Terms() {
  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-text-primary mb-4">Terms of Service</h1>
      <p className="text-text-secondary mb-12">Last updated: August 4, 2026</p>
      
      <div className="prose prose-lg max-w-none text-text-secondary space-y-6">
        <p>Welcome to NotePad. By accessing or using our services, you agree to be bound by these Terms of Service.</p>
        
        <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>By creating an account or using the Service, you agree to these Terms. If you disagree with any part of the terms, you may not access the Service.</p>
        
        <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">2. User Accounts</h2>
        <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
        
        <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">3. Acceptable Use</h2>
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Upload, transmit, or distribute any content that is unlawful, defamatory, harassing, or fraudulent.</li>
          <li>Transmit any viruses, malware, or other malicious code.</li>
          <li>Interfere with or disrupt the integrity or performance of the Service.</li>
          <li>Attempt to gain unauthorized access to the Service or its related systems.</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">4. Intellectual Property</h2>
        <p>The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of NotePad and its licensors.</p>
        
        <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">5. Termination</h2>
        <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
      </div>
    </div>
  );
}
