// client/src/pages/CareersPage.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, ArrowRight, Briefcase, Heart, Globe, Zap } from 'lucide-react';

const JOBS = [
  { title: 'Senior React Developer',       dept: 'Engineering',  location: 'Mumbai / Remote', type: 'Full-time', id: 1 },
  { title: 'Product Manager – Bookings',   dept: 'Product',      location: 'Bangalore',        type: 'Full-time', id: 2 },
  { title: 'UI/UX Designer',               dept: 'Design',       location: 'Remote',           type: 'Full-time', id: 3 },
  { title: 'Backend Engineer (Node.js)',    dept: 'Engineering',  location: 'Pune / Remote',    type: 'Full-time', id: 4 },
  { title: 'Content & SEO Specialist',     dept: 'Marketing',    location: 'Mumbai',           type: 'Full-time', id: 5 },
  { title: 'Customer Success Manager',     dept: 'Operations',   location: 'Delhi',            type: 'Full-time', id: 6 },
];

const PERKS = [
  { icon: Globe,    title: 'Travel Credits',      desc: '₹1L annual travel credits for team members to explore the world' },
  { icon: Clock,    title: 'Flexible Hours',       desc: 'Work when you\'re most productive. Results matter, not clock-watching' },
  { icon: Heart,    title: 'Health Coverage',      desc: 'Comprehensive medical, dental, and mental health coverage' },
  { icon: Zap,      title: 'Fast Growth',          desc: 'Early-stage startup with massive growth — your work ships to millions' },
];

const DEPT_COLORS = {
  Engineering: 'bg-ocean/15 text-ocean border-ocean/20',
  Product:     'bg-purple-500/15 text-purple-400 border-purple-500/20',
  Design:      'bg-pink-500/15 text-pink-400 border-pink-500/20',
  Marketing:   'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Operations:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
};

export default function CareersPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-bg via-[#0f1e35] to-dark-bg py-20 border-b border-dark-border">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs text-ocean font-semibold tracking-widest uppercase mb-4 block">We're Hiring</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Build the Future of <span className="gradient-text">Travel</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Join a passionate team on a mission to make travel seamless, delightful, and accessible for everyone.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-16 space-y-20">
        {/* Perks */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Why BharatYatra?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERKS.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center hover:border-ocean/40 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-ocean/15 border border-ocean/20 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-ocean" />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Open Roles */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-8">Open Positions</h2>
          <div className="space-y-3">
            {JOBS.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-dark-card border border-dark-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 hover:border-ocean/40 transition-all group cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-white font-semibold">{job.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${DEPT_COLORS[job.dept]}`}>{job.dept}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5"><MapPin size={13} /> {job.location}</span>
                    <span className="flex items-center gap-1.5"><Clock size={13} /> {job.type}</span>
                  </div>
                </div>
                <button className="shrink-0 flex items-center gap-2 text-sm text-ocean border border-ocean/30 hover:bg-ocean/10 px-4 py-2 rounded-xl transition-all">
                  Apply Now <ArrowRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center p-8 bg-dark-card border border-dark-border rounded-2xl">
            <Briefcase size={32} className="text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Don't see a role that fits?</h3>
            <p className="text-slate-400 text-sm mb-4">We're always looking for exceptional talent. Send us your resume.</p>
            <a
              href="mailto:careers@bharatyatra.com"
              className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5">
              Send Open Application →
          </a>
          </div>
        </section>
      </div>
    </div>
  );
}