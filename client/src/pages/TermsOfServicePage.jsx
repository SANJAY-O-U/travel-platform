// client/src/pages/TermsOfServicePage.jsx
export default function TermsOfServicePage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using TravelPlatform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our platform.',
    },
    {
      title: '2. Use of the Platform',
      content: 'You must be at least 18 years old to create an account and make bookings. You agree to provide accurate information, maintain the security of your account, and notify us immediately of any unauthorised use. Commercial use of our platform, scraping, or automated access is prohibited without written permission.',
    },
    {
      title: '3. Bookings and Payments',
      content: 'All bookings are subject to availability and confirmation. Prices are shown in INR inclusive of applicable taxes unless stated otherwise. Payment is processed securely through Stripe. A booking is confirmed only after you receive a confirmation email with a booking reference.',
    },
    {
      title: '4. Cancellations and Refunds',
      content: 'Cancellations and refunds are governed by our Cancellation Policy. Refunds are processed to the original payment method within 5–7 business days of cancellation. Service fees are non-refundable.',
    },
    {
      title: '5. User Conduct',
      content: 'You agree not to post false or misleading reviews, use the platform for unlawful purposes, infringe intellectual property rights, or interfere with the platform\'s security or functionality. We reserve the right to suspend or terminate accounts that violate these terms.',
    },
    {
      title: '6. Intellectual Property',
      content: 'All content on TravelPlatform, including logos, text, images, and software, is owned by or licensed to TravelPlatform Pvt. Ltd. You may not reproduce, distribute, or create derivative works without our express written consent.',
    },
    {
      title: '7. Limitation of Liability',
      content: 'TravelPlatform acts as an intermediary between travellers and service providers. We are not liable for the quality of accommodations, flights, or packages provided by third parties. Our total liability to you for any claim shall not exceed the amount paid for the specific booking in question.',
    },
    {
      title: '8. Governing Law',
      content: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra. Before initiating legal proceedings, you agree to first attempt resolution through our customer support.',
    },
    {
      title: '9. Changes to Terms',
      content: 'We may update these Terms from time to time. We will notify you of significant changes by email or by posting a notice on our platform. Continued use after changes constitutes acceptance of the updated Terms.',
    },
    {
      title: '10. Contact',
      content: 'For questions about these Terms, contact legal@travelplatform.com or TravelPlatform Pvt. Ltd., Bandra Kurla Complex, Mumbai 400 051, India.',
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <section className="bg-gradient-to-br from-dark-bg via-[#0f1e35] to-dark-bg py-16 border-b border-dark-border">
        <div className="container-custom text-center">
          <h1 className="text-4xl font-bold text-white mb-3">
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p className="text-slate-400">Effective date: March 1, 2025 · Last updated: March 2025</p>
        </div>
      </section>

      <div className="container-custom py-14 max-w-3xl">
        <p className="text-slate-300 mb-10 leading-relaxed">
          Please read these Terms of Service carefully before using TravelPlatform. These terms govern your use of our website, mobile applications, and services.
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
          These Terms constitute the entire agreement between you and TravelPlatform regarding your use of the platform and supersede all prior agreements.
        </div>
      </div>
    </div>
  );
}
