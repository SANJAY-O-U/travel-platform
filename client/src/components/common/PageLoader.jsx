// ============================================================
// Footer Component
// ============================================================
import { Link } from 'react-router-dom';
import { Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const FOOTER_LINKS = {
  Explore: [
    { label: 'Hotels',      to: '/hotels' },
    { label: 'Flights',     to: '/flights' },
    { label: 'Packages',    to: '/packages' },
    { label: 'Destinations', to: '/hotels' },
  ],
  Company: [
    { label: 'About Us',    to: '/contact' },
    { label: 'Contact',     to: '/contact' },
    { label: 'Careers',     to: '#' },
    { label: 'Press',       to: '#' },
  ],
  Support: [
    { label: 'Help Center', to: '#' },
    { label: 'Cancellation Policy', to: '#' },
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
  ],
};

const SOCIAL = [
  { icon: Facebook,  href: '#', label: 'Facebook' },
  { icon: Twitter,   href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube,   href: '#', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-dark-bg border-t border-dark-border mt-20">
      {/* Main footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ocean to-blue-600 flex-center shadow-glow-sm">
                <Globe size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-white">Bharat</span>
                <span className="gradient-text">Yatra</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Your all-in-one travel companion. Book hotels, flights, and curated packages with AI-powered recommendations tailored just for you.
            </p>
            {/* Contact info */}
            <div className="space-y-2">
              {[
                { icon: Mail,    text: 'support@travelplatform.com' },
                { icon: Phone,   text: '+1 (888) 123-4567' },
                { icon: MapPin,  text: 'San Francisco, CA, USA' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <Icon size={14} className="text-ocean shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-slate-400 hover:text-ocean transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-border">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} TravelPlatform. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-lg bg-dark-card border border-dark-border flex-center text-slate-400 hover:text-ocean hover:border-ocean/40 transition-all duration-200"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}