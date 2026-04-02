// client/src/pages/PrivacyPolicyPage.jsx
export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information you provide directly to us, such as your name, email address, phone number, and payment information when you create an account or make a booking. We also collect information automatically when you use our platform, including log data, device information, and usage patterns through cookies and similar technologies.`,
    },
    {
      title: '2. How We Use Your Information',
      content: `We use the information we collect to process bookings and payments, communicate with you about your reservations, send promotional offers (with your consent), improve our platform and personalise your experience, and comply with legal obligations. We do not sell your personal data to third parties.`,
    },
    {
      title: '3. Information Sharing',
      content: `We share your information only with hotels, airlines, and package providers as necessary to complete your booking; with payment processors (Stripe) to handle transactions securely; and with service providers who assist our operations under strict data processing agreements. We may disclose information when required by law.`,
    },
    {
      title: '4. Data Security',
      content: `We implement industry-standard security measures including SSL/TLS encryption, bcrypt password hashing, and PCI-DSS compliant payment processing. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password for your account.`,
    },
    {
      title: '5. Cookies',
      content: `We use cookies to maintain your session, remember your preferences, and understand how you use our platform. You can control cookie settings through your browser. Disabling cookies may affect some platform functionality.`,
    },
    {
      title: '6. Your Rights',
      content: `You have the right to access, correct, or delete your personal data at any time from your Dashboard → Profile settings. You may also request a full export of your data or object to certain processing by contacting privacy@travelplatform.com.`,
    },
    {
      title: '7. Data Retention',
      content: `We retain your account data for as long as your account is active. Booking records are retained for 7 years for legal and tax purposes. You can request account deletion at any time — we will anonymise your data within 30 days of the request.`,
    },
    {
      title: '8. Contact Us',
      content: `For privacy-related queries or to exercise your rights, contact our Data Protection Officer at privacy@bharatyatra.com or write to BharatYatra Pvt. Ltd., Bandra Kurla Complex, Mumbai 400 051, India.`,
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <section className="bg-gradient-to-br from-dark-bg via-[#0f1e35] to-dark-bg py-16 border-b border-dark-border">
        <div className="container-custom text-center">
          <h1 className="text-4xl font-bold text-white mb-3">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-slate-400">Effective date: March 1, 2025 · Last updated: March 2025</p>
        </div>
      </section>

      <div className="container-custom py-14 max-w-3xl">
        <p className="text-slate-300 mb-10 leading-relaxed">
          BharatYatra Pvt. Ltd. ("we", "us", or "our") is committed to protecting your privacy. This policy explains what information we collect, how we use it, and the choices you have.
        </p>

        <div className="space-y-8">
          {sections.map(({ title, content }) => (
            <section key={title}>
              <h2 className="text-lg font-bold text-white mb-3">{title}</h2>
              <p className="text-slate-400 leading-relaxed text-sm">{content}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 p-5 bg-dark-card border border-dark-border rounded-2xl text-sm text-slate-400">
          By using BharatYatra, you agree to this Privacy Policy. We may update it periodically and will notify you of material changes via email or a prominent notice on our platform.
        </div>
      </div>
    </div>
  );
}