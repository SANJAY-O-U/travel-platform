import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const CONTACT_INFO = [
    { icon: Mail,  title: 'Email Us',    val: 'support@bharatyatra.com',    sub: 'Response within 24 hours' },
    { icon: Phone, title: 'Call Us',     val: '+1 (888) 123-4567',             sub: 'Mon–Fri, 9am–6pm EST' },
    { icon: MapPin,title: 'Visit Us',    val: '123 Market St, San Francisco',  sub: 'CA 94105, USA' },
    { icon: Clock, title: 'Office Hours',val: 'Mon – Fri: 9AM – 6PM',          sub: 'Weekend: 10AM – 4PM' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="bg-gradient-to-b from-dark-card/40 to-transparent border-b border-dark-border">
        <div className="container-custom py-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge-ocean text-xs mb-4 inline-flex">✦ Get In Touch</span>
            <h1 className="text-4xl font-bold text-white mb-3">
              Contact <span className="gradient-text">Us</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">
              Have a question or need help planning your trip? We're here for you.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-6">Reach Out to Us</h2>
            {CONTACT_INFO.map(({ icon: Icon, title, val, sub }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl"
              >
                <div className="w-11 h-11 rounded-xl bg-ocean/15 border border-ocean/25 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-ocean" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-slate-300 text-sm">{val}</p>
                  <p className="text-slate-500 text-xs">{sub}</p>
                </div>
              </motion.div>
            ))}

            <div className="p-5 bg-gradient-to-br from-ocean/10 to-blue-900/20 border border-ocean/20 rounded-2xl mt-6">
              <Globe size={24} className="text-ocean mb-3" />
              <h3 className="text-white font-semibold mb-1">Global Support</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our multilingual support team covers 40+ countries. No matter where you are, help is just a message away.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-card border border-dark-border rounded-2xl p-8"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-ocean" /> Send a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Your Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="input-label">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="How can we help?"
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="input-label">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your inquiry..."
                    rows={6}
                    required
                    className="input resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {sending ? (
                    <><div className="spinner w-5 h-5 border-2" /> Sending...</>
                  ) : (
                    <><Send size={16} /> Send Message</>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}