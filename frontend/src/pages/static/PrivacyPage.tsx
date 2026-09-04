import { motion } from 'framer-motion';
import StaticPageLayout from '../../components/StaticPageLayout';

const sections = [
 {
  title: '1. Information We Collect',
  content: `We collect information you provide directly to us, such as when you create an account, register for events, or contact us. This may include your name, email address, phone number, payment information, and any other information you choose to provide.

We also automatically collect certain information when you use our platform, including your IP address, browser type, operating system, device information, and usage data such as pages visited and actions taken.`,
 },
 {
  title: '2. How We Use Your Information',
  content: `We use the information we collect to:
• Provide, maintain, and improve our services
• Process event registrations and transactions
• Send you technical notices, updates, and security alerts
• Respond to your comments, questions, and customer service requests
• Communicate with you about events, offers, and promotions
• Monitor and analyze trends, usage, and activities
• Detect, investigate, and prevent fraudulent transactions and other illegal activities`,
 },
 {
  title: '3. Information Sharing',
  content: `We do not sell your personal information. We may share your information with:
• Event organizers (limited to registration details for their events)
• Service providers who assist in operating our platform
• When required by law or to protect our rights
• In connection with a merger, acquisition, or sale of assets`,
 },
 {
  title: '4. Data Security',
  content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All passwords are encrypted using BCrypt with a cost factor of 12. Data is transmitted over TLS/SSL encryption.`,
 },
 {
  title: '5. Data Retention',
  content: `We retain your personal information for as long as your account is active or as needed to provide you services. We will also retain your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements.`,
 },
 {
  title: '6. Your Rights',
  content: `You have the right to:
• Access the personal information we hold about you
• Request correction of inaccurate data
• Request deletion of your data
• Opt out of marketing communications
• Export your data in a portable format

To exercise these rights, please contact us at privacy@eventry.app.`,
 },
 {
  title: '7. Cookies',
  content: `We use cookies and similar technologies to maintain your session and remember your preferences. For more details, please see our Cookie Policy.`,
 },
 {
  title: '8. Changes to This Policy',
  content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.`,
 },
];

export default function PrivacyPage() {
 return (
  <StaticPageLayout>
   <div className="mb-12">
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-brand mb-4 inline-block">Legal</motion.span>
    <motion.h1
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     className="text-4xl font-extrabold text-white mb-2"
    >
     Privacy Policy
    </motion.h1>
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-sm text-surface-400">
     Last updated: August 31, 2026
    </motion.p>
   </div>

   <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="surface-card p-8 space-y-8"
   >
    <p className="text-surface-400 leading-relaxed">
     At Eventry, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
    </p>

    {sections.map((s, i) => (
     <div key={i}>
      <h2 className="text-lg font-semibold text-white mb-3">{s.title}</h2>
      <p className="text-sm text-surface-400 leading-relaxed whitespace-pre-line">{s.content}</p>
     </div>
    ))}

    <div className="pt-4 border-t border-white/[0.06]">
     <p className="text-sm text-surface-400">
      If you have questions about this policy, contact us at{' '}
      <a href="mailto:privacy@eventry.app" className="text-brand-400 hover:text-brand-300 transition-colors">privacy@eventry.app</a>
     </p>
    </div>
   </motion.div>
  </StaticPageLayout>
 );
}
