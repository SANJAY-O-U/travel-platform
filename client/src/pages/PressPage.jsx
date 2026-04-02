// client/src/pages/PressPage.jsx
import { motion } from 'framer-motion';
import { ExternalLink, Download, Mail } from 'lucide-react';

const PRESS = [
  {
    outlet: 'TechCrunch',
    date: 'March 2025',
    headline: 'BharatYatra raises ₹50Cr to disrupt India\'s online travel market',
    url: '#',
  },
  {
    outlet: 'YourStory',
    date: 'January 2025',
    headline: 'How BharatYatra is making luxury travel accessible to every Indian',
    url: '#',
  },
  {
    outlet: 'Economic Times',
    date: 'November 2024',
    headline: 'AI-powered recommendations: The new frontier in travel tech',
    url: '#',
  },
  {
    outlet: 'Inc42',
    date: 'September 2024',
    headline: 'BharatYatra crosses 10,000 bookings in first 90 days',
    url: '#',
  },
];

const STATS = [
  { value: '10K+', label: 'Bookings Made' },
  { value: '50+',  label: 'Cities Covered' },
  { value: '4.9★', label: 'Avg. User Rating' },
  { value: '₹50Cr', label: 'Funding Raised' },
];

export default function PressPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-bg via-[#0f1e35] to-dark-bg py-20 border-b border-dark-border">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs text-ocean font-semibold tracking-widest uppercase mb-4 block">Newsroom</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Press & <span className="gradient-text">Media</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto">
              News, announcements, and resources for journalists and media professionals.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-16 space-y-16">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold gradient-text mb-1">{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Press Coverage */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">In The News</h2>
          <div className="space-y-4">
            {PRESS.map((item, i) => (
              <motion.a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-ocean/40 transition-all group block"
              >
                <div className="w-24 shrink-0">
                  <div className="bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-center">
                    <p className="text-white text-xs font-bold">{item.outlet}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium group-hover:text-ocean transition-colors">{item.headline}</p>
                  <p className="text-slate-500 text-xs mt-1">{item.date}</p>
                </div>
                <ExternalLink size={15} className="text-slate-600 group-hover:text-ocean transition-colors shrink-0 mt-1" />
              </motion.a>
            ))}
          </div>
        </section>

        {/* Media Kit + Contact */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-2">Media Kit</h3>
            <p className="text-slate-400 text-sm mb-5">
              Download our brand assets, logos, screenshots, and company fact sheet.
            </p>
            <button className="flex items-center gap-2 btn-primary text-sm py-2.5 px-5">
              <Download size={15} /> Download Media Kit
            </button>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-2">Press Inquiries</h3>
            <p className="text-slate-400 text-sm mb-5">
              For interview requests, fact-checking, or media enquiries, contact our PR team.
            </p>
            <a
              href="mailto:press@bharatyatra.com"
              className="flex items-center gap-2 btn-primary text-sm py-2.5 px-5 w-fit">
        
              <Mail size={15} /> press@bharatyatra.com
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}