import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-6">Simple, transparent pricing</h1>
        <p className="text-xl text-text-secondary mb-10">
          Start for free, upgrade when you need more power and collaboration features.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <span className={cn("text-sm font-medium", !annual ? "text-text-primary" : "text-text-secondary")}>Monthly</span>
          <button 
            onClick={() => setAnnual(!annual)}
            className="w-14 h-8 bg-text-primary rounded-full p-1 relative transition-colors"
          >
            <motion.div 
              className="w-6 h-6 bg-white rounded-full"
              animate={{ x: annual ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", annual ? "text-text-primary" : "text-text-secondary")}>Annually</span>
            <span className="text-xs font-semibold bg-secondary-bg text-text-primary px-2 py-0.5 rounded-full border border-border-default">Save 20%</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PricingCard 
          title="Starter"
          description="Perfect for individuals organizing their personal thoughts."
          price={0}
          features={[
            "Up to 1,000 notes",
            "Basic text formatting",
            "3 devices sync",
            "50MB attachment limit",
            "Community support"
          ]}
          buttonText="Get Started"
          buttonLink="/login"
        />
        <PricingCard 
          title="Pro"
          description="For professionals who need advanced organization and media."
          price={annual ? 8 : 10}
          isPopular
          features={[
            "Unlimited notes",
            "Rich media & code blocks",
            "Unlimited devices",
            "10GB attachment limit",
            "Version history (30 days)",
            "Priority email support"
          ]}
          buttonText="Start 14-Day Trial"
          buttonLink="/login"
        />
        <PricingCard 
          title="Team"
          description="Collaborate with your team seamlessly."
          price={annual ? 15 : 19}
          features={[
            "Everything in Pro",
            "Shared workspaces",
            "Advanced permissions",
            "50GB attachment limit/user",
            "Unlimited version history",
            "24/7 dedicated support"
          ]}
          buttonText="Contact Sales"
          buttonLink="/contact"
        />
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-32 max-w-5xl mx-auto hidden md:block">
        <h2 className="text-2xl font-bold text-center mb-12">Compare Plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-default">
                <th className="py-4 px-6 font-semibold text-text-primary w-1/3">Features</th>
                <th className="py-4 px-6 font-semibold text-text-primary text-center">Starter</th>
                <th className="py-4 px-6 font-semibold text-text-primary text-center">Pro</th>
                <th className="py-4 px-6 font-semibold text-text-primary text-center">Team</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { name: 'Notes', starter: '1,000', pro: 'Unlimited', team: 'Unlimited' },
                { name: 'Devices', starter: '3', pro: 'Unlimited', team: 'Unlimited' },
                { name: 'Attachment size', starter: '50MB', pro: '10GB', team: '50GB / user' },
                { name: 'Rich editing', starter: true, pro: true, team: true },
                { name: 'Version history', starter: false, pro: '30 days', team: 'Unlimited' },
                { name: 'Shared workspaces', starter: false, pro: false, team: true },
                { name: 'Custom templates', starter: false, pro: true, team: true },
                { name: 'Admin controls', starter: false, pro: false, team: true },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border-soft hover:bg-secondary-bg transition-colors">
                  <td className="py-4 px-6 text-text-secondary">{row.name}</td>
                  <td className="py-4 px-6 text-center text-text-primary font-medium">
                    {typeof row.starter === 'boolean' ? (row.starter ? <Check className="w-5 h-5 mx-auto text-text-primary" /> : '-') : row.starter}
                  </td>
                  <td className="py-4 px-6 text-center text-text-primary font-medium">
                    {typeof row.pro === 'boolean' ? (row.pro ? <Check className="w-5 h-5 mx-auto text-text-primary" /> : '-') : row.pro}
                  </td>
                  <td className="py-4 px-6 text-center text-text-primary font-medium">
                    {typeof row.team === 'boolean' ? (row.team ? <Check className="w-5 h-5 mx-auto text-text-primary" /> : '-') : row.team}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ title, description, price, features, buttonText, buttonLink, isPopular }: any) {
  return (
    <div className={cn(
      "relative p-8 rounded-3xl border flex flex-col h-full bg-surface transition-transform hover:-translate-y-1 duration-300",
      isPopular ? "border-text-primary shadow-xl" : "border-border-default shadow-sm"
    )}>
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-text-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm mb-6 min-h-[40px]">{description}</p>
      <div className="mb-8">
        <span className="text-5xl font-bold text-text-primary">${price}</span>
        {price > 0 && <span className="text-text-secondary">/mo</span>}
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-text-primary shrink-0" />
            <span className="text-sm text-text-secondary">{feature}</span>
          </li>
        ))}
      </ul>
      <Link 
        to={buttonLink} 
        className={cn(
          "w-full py-4 rounded-xl font-medium text-center transition-colors mt-auto",
          isPopular 
            ? "bg-text-primary text-white hover:bg-text-primary/90" 
            : "bg-secondary-bg text-text-primary border border-border-default hover:bg-border-default/50"
        )}
      >
        {buttonText}
      </Link>
    </div>
  );
}
