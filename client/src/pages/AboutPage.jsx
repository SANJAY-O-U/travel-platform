// client/src/pages/AboutPage.jsx  ← NEW FILE
import { motion } from 'framer-motion';
import { Globe, Users, Star, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATS = [
  { icon: Globe, value: '180+', label: 'Countries' },
  { icon: Users, value: '2M+',  label: 'Happy Travelers' },
  { icon: Star,  value: '4.9',  label: 'Average Rating' },
  { icon: Shield,value: '100%', label: 'Secure Booking' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-bold text-white mb-4">
            About <span className="gradient-text">TravelPlatform</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            We're on a mission to make travel accessible, affordable, and extraordinary for everyone — especially across India's incredible destinations.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="container-custom py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="glass-card rounded-2xl p-6 text-center">
              <Icon size={28} className="text-ocean mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">{value}</div>
              <div className="text-slate-400 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="container-custom pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            TravelPlatform was founded with one goal: to bring the best of Indian hospitality — from the backwaters of Kerala to the palaces of Rajasthan — onto one seamless platform. We combine AI-powered recommendations with a curated selection of verified hotels, flights, and packages across India and beyond.
          </p>
          <p className="text-slate-300 leading-relaxed mb-8">
            Whether you're planning a weekend getaway to Goa, a heritage tour through Rajasthan, or a family trip to the Himalayas — TravelPlatform has you covered with the best prices, 24/7 support, and zero booking fees.
          </p>
          <Link to="/hotels" className="btn-primary inline-flex">
            Explore Hotels →
          </Link>
        </div>
      </section>
    </div>
  );
}