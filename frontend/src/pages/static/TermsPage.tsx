import { motion } from 'framer-motion';
import StaticPageLayout from '../../components/StaticPageLayout';

const sections = [
 {
  title: '1. Acceptance of Terms',
  content: `By accessing or using Eventry ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.`,
 },
 {
  title: '2. Account Registration',
  content: `You must provide accurate and complete information when creating an account. You are responsible for safeguarding your password and for all activities under your account. You must be at least 16 years old to use Eventry.`,
 },
 {
  title: '3. Event Creation & Management',
  content: `Organizers are solely responsible for the events they create, including accuracy of event details, compliance with applicable laws, and fulfillment of any promises made to attendees. Eventry acts as a platform and is not a party to transactions between organizers and attendees.`,
 },
 {
  title: '4. Payments & Refunds',
  content: `All payments are processed through our secure payment partners. Ticket prices and fees are set by organizers. Refund policies are determined by individual event organizers unless otherwise stated. Eventry charges a platform fee on each transaction as displayed at checkout.`,
 },
 {
  title: '5. User Conduct',
  content: `You agree not to:
• Use the Service for any unlawful purpose
• Create fake events or listings
• Impersonate another person or entity
• Interfere with or disrupt the Service
• Attempt to gain unauthorized access to other accounts
• Send spam or unsolicited communications`,
 },
 {
  title: '6. Intellectual Property',
  content: `The Service and its original content, features, and functionality are owned by Eventry and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express permission.`,
 },
 {
  title: '7. Limitation of Liability',
  content: `To the maximum extent permitted by law, Eventry shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. Our total liability shall not exceed the amount paid by you to Eventry in the 12 months preceding the claim.`,
 },
 {
  title: '8. Termination',
  content: `We may suspend or terminate your account at any time for conduct that violates these Terms or is harmful to other users, third parties, or the business interests of Eventry.`,
 },
 {
  title: '9. Changes to Terms',
  content: `We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page. Continued use of the Service after changes constitutes acceptance of the new Terms.`,
 },
 {
  title: '10. Contact',
  content: `Questions about these Terms? Contact us at legal@eventry.app.`,
 },
];

export default function TermsPage() {
 return (
  <StaticPageLayout>
   <div className="mb-12">
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-brand mb-4 inline-block">Legal</motion.span>
    <motion.h1
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     className="text-4xl font-extrabold text-white mb-2"
    >
     Terms of Service
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
    {sections.map((s, i) => (
     <div key={i}>
      <h2 className="text-lg font-semibold text-white mb-3">{s.title}</h2>
      <p className="text-sm text-surface-400 leading-relaxed whitespace-pre-line">{s.content}</p>
     </div>
    ))}
   </motion.div>
  </StaticPageLayout>
 );
}
