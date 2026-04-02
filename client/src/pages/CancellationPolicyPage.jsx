// client/src/pages/CancellationPolicyPage.jsx
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const TIERS = [
  {
    timing:  '7+ days before check-in',
    refund:  '90%',
    color:   'emerald',
    icon:    CheckCircle,
    note:    'Full refund minus a small processing fee',
  },
  {
    timing:  '3–7 days before check-in',
    refund:  '50%',
    color:   'amber',
    icon:    Clock,
    note:    'Half refund processed within 5–7 business days',
  },
  {
    timing:  '1–3 days before check-in',
    refund:  '25%',
    color:   'orange',
    icon:    AlertTriangle,
    note:    'Partial refund — book with confidence for flexible stays',
  },
  {
    timing:  'Less than 24 hours / No-show',
    refund:  '0%',
    color:   'red',
    icon:    XCircle,
    note:    'No refund applicable for last-minute cancellations',
  },
];

const colorMap = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   badge: 'bg-amber-500/20 text-amber-300' },
  orange:  { bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  text: 'text-orange-400',  badge: 'bg-orange-500/20 text-orange-300' },
  red:     { bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400',     badge: 'bg-red-500/20 text-red-300' },
};

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <section className="bg-gradient-to-br from-dark-bg via-[#0f1e35] to-dark-bg py-16 border-b border-dark-border">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-white mb-3">
              Cancellation <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto">
              We believe in transparent, fair policies. Here's everything you need to know about cancellations and refunds.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-14 max-w-3xl space-y-12">

        {/* Refund Tiers */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Refund Schedule</h2>
          <div className="space-y-4">
            {TIERS.map(({ timing, refund, color, icon: Icon, note }, i) => {
              const c = colorMap[color];
              return (
                <motion.div
                  key={timing}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-start gap-4 p-5 rounded-2xl border ${c.bg} ${c.border}`}
                >
                  <Icon size={22} className={`${c.text} shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-white font-semibold">{timing}</p>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${c.badge}`}>
                        {refund} Refund
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{note}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* How to Cancel */}
        <section className="bg-dark-card border border-dark-border rounded-2xl p-7">
          <h2 className="text-xl font-bold text-white mb-4">How to Cancel a Booking</h2>
          <ol className="space-y-4">
            {[
              'Log in to your BharatYatra account',
              'Go to Dashboard → My Bookings',
              'Find the booking you wish to cancel',
              'Click the "Cancel" button and confirm',
              'Your refund will be initiated automatically based on the schedule above',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="w-7 h-7 rounded-full bg-ocean/20 border border-ocean/30 flex items-center justify-center text-ocean text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-slate-300 text-sm pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Additional Notes */}
        <section className="space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl font-bold text-white">Additional Notes</h2>
          <p>Refunds are processed to your original payment method. Depending on your bank, it may take an additional 2–5 business days to reflect in your account after we initiate the refund.</p>
          <p>For packages that include flights, the airline's own cancellation policy may apply in addition to ours. Please check the package details page for specific terms.</p>
          <p>In cases of natural disasters, government travel bans, or other force majeure events, we offer full refunds regardless of the above schedule. Contact our support team with documentation.</p>
          <p>BharatYatra reserves the right to cancel any booking in cases of pricing errors, fraud, or policy violations. In such cases, a full refund will be issued.</p>
          <p>For any disputes or questions about your refund, contact us at <a href="mailto:support@BharatYatra.com" className="text-ocean hover:underline">support@BharatYatra.com</a>.</p>
        </section>

        <p className="text-slate-600 text-xs text-center">Last updated: March 2025</p>
      </div>
    </div>
  );
}