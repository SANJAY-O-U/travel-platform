// client/src/pages/HelpCenterPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, MessageSquare, Phone, Mail, BookOpen, CreditCard, Plane, Package } from 'lucide-react';

const CATEGORIES = [
  { icon: BookOpen,    label: 'Bookings',        count: 12 },
  { icon: CreditCard,  label: 'Payments',         count: 8  },
  { icon: Plane,       label: 'Flights',          count: 6  },
  { icon: Package,     label: 'Packages',         count: 9  },
];

const FAQS = [
  {
    q: 'How do I cancel my booking?',
    a: 'Go to Dashboard → My Bookings, find the booking, and click "Cancel". Refunds are processed based on our cancellation policy (90% if cancelled 7+ days before check-in, 50% if 3–7 days, 25% if 1–3 days, 0% within 24 hours).',
  },
  {
    q: 'How long does a refund take?',
    a: 'Refunds are processed within 5–7 business days to your original payment method. You\'ll receive an email confirmation once initiated.',
  },
  {
    q: 'Can I modify my booking dates?',
    a: 'Currently, to change dates you\'ll need to cancel the existing booking and make a new one. We\'re working on a direct modification feature — coming soon.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes. We use Stripe for payment processing, which is PCI-DSS Level 1 compliant. We never store your full card details on our servers.',
  },
  {
    q: 'What is included in a travel package?',
    a: 'Each package listing clearly shows inclusions (flights, hotel, meals, transfers, guide, insurance) with green checkmarks. Exclusions are also listed so there are no surprises.',
  },
  {
    q: 'How do I contact a hotel directly?',
    a: 'On the hotel detail page, scroll to the Contact section to find the hotel\'s phone number and email. You can also find this info in your booking confirmation email.',
  },
  {
    q: 'What happens if my flight is cancelled?',
    a: 'For flights booked through BharatYatra, we\'ll notify you immediately and offer a full refund or rebooking. Contact support@BharatYatra.com for assistance.',
  },
  {
    q: 'Can I book for someone else?',
    a: 'Yes. During checkout, you can enter different guest details in the "Primary Guest" section. The booking confirmation will go to your registered email.',
  },
];

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-dark-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-white font-medium text-sm">{faq.q}</span>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-slate-400 text-sm pb-4 leading-relaxed">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpCenterPage() {
  const [search, setSearch] = useState('');
  const filtered = FAQS.filter(f =>
    !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-bg via-[#0f1e35] to-dark-bg py-16 border-b border-dark-border">
        <div className="container-custom text-center">
          <h1 className="text-4xl font-bold text-white mb-3">
            How can we <span className="gradient-text">help you?</span>
          </h1>
          <p className="text-slate-400 mb-8">Search our help center or browse categories below</p>
          <div className="max-w-lg mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for help (e.g. cancel booking, refund, payment...)"
              className="input pl-12 py-3.5 text-sm"
            />
          </div>
        </div>
      </section>

      <div className="container-custom py-12 space-y-12">
        {/* Categories */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map(({ icon: Icon, label, count }) => (
            <button
              key={label}
              onClick={() => setSearch(label)}
              className="bg-dark-card border border-dark-border rounded-2xl p-5 text-center hover:border-ocean/40 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-ocean/15 border border-ocean/20 flex items-center justify-center mx-auto mb-3">
                <Icon size={18} className="text-ocean" />
              </div>
              <p className="text-white font-medium text-sm">{label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{count} articles</p>
            </button>
          ))}
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-bold text-white mb-5">
            {search ? `Results for "${search}"` : 'Frequently Asked Questions'}
          </h2>
          <div className="bg-dark-card border border-dark-border rounded-2xl px-6">
            {filtered.length > 0 ? (
              filtered.map((faq, i) => <FAQItem key={i} faq={faq} index={i} />)
            ) : (
              <div className="py-12 text-center">
                <p className="text-slate-400">No results found for "{search}"</p>
                <button onClick={() => setSearch('')} className="text-ocean text-sm mt-2 hover:underline">Clear search</button>
              </div>
            )}
          </div>
        </section>

        {/* Still need help */}
       <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {[
    { icon: MessageSquare, title: 'Live Chat', desc: 'Chat with our support team', action: 'Start Chat', href: '#' },
    { icon: Mail, title: 'Email Us', desc: 'support@BharatYatra.com', action: 'Send Email', href: 'mailto:support@travelplatform.com' },
    { icon: Phone, title: 'Call Us', desc: '+91 99999 00000 (9AM–9PM IST)', action: 'Call Now', href: 'tel:+919999900000' },
  ].map(({ icon: Icon, title, desc, action, href }) => (
    
    <a
      key={title}
      href={href}
      className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center hover:border-ocean/40 transition-all group"
    >
      <div className="w-11 h-11 rounded-2xl bg-ocean/15 border border-ocean/20 flex items-center justify-center mx-auto mb-3">
        <Icon size={20} className="text-ocean" />
      </div>
      <p className="text-white font-semibold mb-1">{title}</p>
      <p className="text-slate-400 text-xs mb-3">{desc}</p>
      <span className="text-ocean text-sm font-medium group-hover:underline">
        {action} →
      </span>
    </a>

  ))}
</section>
      </div>
    </div>
  );
}