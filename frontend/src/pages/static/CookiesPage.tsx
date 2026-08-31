import { motion } from 'framer-motion';
import StaticPageLayout from '../../components/StaticPageLayout';

const cookieTypes = [
  {
    name: 'Essential Cookies',
    purpose: 'Required for the platform to function. These handle authentication, session management, and security.',
    examples: 'Session ID, JWT token, CSRF token',
    required: true,
  },
  {
    name: 'Functional Cookies',
    purpose: 'Remember your preferences and settings to provide a personalized experience.',
    examples: 'Language preference, theme settings, sidebar state',
    required: false,
  },
  {
    name: 'Analytics Cookies',
    purpose: 'Help us understand how visitors interact with our platform so we can improve it.',
    examples: 'Page views, session duration, navigation paths',
    required: false,
  },
];

export default function CookiesPage() {
  return (
    <StaticPageLayout>
      <div className="mb-12">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-brand mb-4 inline-block">Legal</motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-white mb-2"
        >
          Cookie Policy
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-sm text-surface-400">
          Last updated: August 31, 2026
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-8 space-y-8"
      >
        <p className="text-surface-400 leading-relaxed">
          This Cookie Policy explains how Eventry uses cookies and similar technologies to recognize you when you visit our platform.
        </p>

        <div>
          <h2 className="text-lg font-semibold text-white mb-3">What Are Cookies?</h2>
          <p className="text-sm text-surface-400 leading-relaxed">
            Cookies are small data files placed on your device when you visit a website. They are widely used to make websites work efficiently and to provide reporting information.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Types of Cookies We Use</h2>
          <div className="space-y-4">
            {cookieTypes.map((cookie) => (
              <div key={cookie.name} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{cookie.name}</h3>
                  <span className={cookie.required ? 'badge-success' : 'badge-info'}>
                    {cookie.required ? 'Required' : 'Optional'}
                  </span>
                </div>
                <p className="text-sm text-surface-400 mb-2">{cookie.purpose}</p>
                <p className="text-xs text-surface-400">
                  <span className="text-surface-500 font-medium">Examples:</span> {cookie.examples}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Managing Cookies</h2>
          <p className="text-sm text-surface-400 leading-relaxed">
            You can control and manage cookies through your browser settings. Please note that disabling essential cookies may affect the functionality of the Service. Most browsers allow you to:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-surface-400 ml-4">
            <li>• View what cookies are set and delete them individually</li>
            <li>• Block third-party cookies</li>
            <li>• Block all cookies from specific sites</li>
            <li>• Clear all cookies when you close your browser</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Changes to This Policy</h2>
          <p className="text-sm text-surface-400 leading-relaxed">
            We may update this Cookie Policy from time to time. We will notify you of any material changes by posting the updated policy on this page.
          </p>
        </div>

        <div className="pt-4 border-t border-white/[0.06]">
          <p className="text-sm text-surface-400">
            Questions about our cookie practices? Contact us at{' '}
            <a href="mailto:privacy@eventry.app" className="text-brand-400 hover:text-brand-300 transition-colors">privacy@eventry.app</a>
          </p>
        </div>
      </motion.div>
    </StaticPageLayout>
  );
}
